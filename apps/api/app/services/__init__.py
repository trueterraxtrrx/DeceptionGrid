import re
import os
import secrets
import subprocess
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token, hash_password, verify_password,
    hash_api_key
)
from app.models import User, DeceptionAsset, DeceptionEvent, Alert, Honeytoken
from app.repositories import (
    OrganizationRepository, UserRepository, AssetRepository,
    EventRepository, AlertRepository, HoneytokenRepository, AuditLogRepository
)
from app.schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    AssetCreate, AssetUpdate, EventIngest, AlertStatusUpdate,
    HoneytokenCreate, DashboardStats, HoneytokenCreated
)
CPP_EVENT_CLASSIFIER_ENV = "DECEPTIONGRID_CPP_EVENT_CLASSIFIER"
CPP_FORCE_ENV = "DECEPTIONGRID_FORCE_CPP"
CPP_PAYLOAD_THRESHOLD_BYTES = 4096


def _cpp_event_classifier_path() -> Path:
    suffix = ".exe" if os.name == "nt" else ""
    return Path(__file__).resolve().parents[2] / "cpp" / "event_classifier" / f"deceptiongrid-event-classifier{suffix}"


def _classify_event_cpp(event_type: str, payload_preview: str | None) -> str | None:
    payload = payload_preview or ""
    if os.getenv(CPP_FORCE_ENV) != "1" and len(payload.encode("utf-8")) < CPP_PAYLOAD_THRESHOLD_BYTES:
        return None
    configured = os.getenv(CPP_EVENT_CLASSIFIER_ENV)
    binary = Path(configured) if configured else _cpp_event_classifier_path()
    if not binary.exists():
        return None
    try:
        completed = subprocess.run(
            [str(binary), event_type],
            capture_output=True,
            check=True,
            input=payload,
            text=True,
            timeout=5,
        )
        severity = completed.stdout.strip()
        return severity if severity in {"low", "medium", "high", "critical"} else None
    except Exception:
        return None

def _slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[\s_]+", "-", slug).strip("-")[:100]



class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.org_repo = OrganizationRepository(db)
        self.user_repo = UserRepository(db)
        self.audit = AuditLogRepository(db)

    def register(self, req: RegisterRequest) -> TokenResponse:
        if self.user_repo.get_by_email(req.email):
            raise ConflictError("Email already registered")

        slug = _slugify(req.organization_name)
        base_slug = slug
        i = 1
        while self.org_repo.get_by_slug(slug):
            slug = f"{base_slug}-{i}"
            i += 1

        org = self.org_repo.create(name=req.organization_name, slug=slug)
        user = self.user_repo.create(
            org_id=org.id,
            email=req.email,
            full_name=req.full_name,
            hashed_password=hash_password(req.password),
            role="OWNER",
        )
        self.audit.create(org.id, user.id, "user.register", "user", user.id)
        self.db.commit()
        token = create_access_token(user.id, {"org_id": org.id, "role": user.role})
        return TokenResponse(access_token=token)

    def login(self, req: LoginRequest) -> TokenResponse:
        user = self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedError("Invalid credentials")
        self.audit.create(user.organization_id, user.id, "user.login", "user", user.id)
        self.db.commit()
        token = create_access_token(user.id, {"org_id": user.organization_id, "role": user.role})
        return TokenResponse(access_token=token)



class AssetService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AssetRepository(db)
        self.audit = AuditLogRepository(db)

    def create(self, org_id: str, user_id: str, req: AssetCreate) -> DeceptionAsset:
        asset = self.repo.create(
            org_id=org_id,
            name=req.name,
            type=req.type,
            host=req.host,
            port=req.port,
            description=req.description,
            config_json=req.config_json or {},
        )
        self.audit.create(org_id, user_id, "asset.create", "asset", asset.id)
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def list(self, org_id: str, limit: int, offset: int, status: Optional[str]):
        return self.repo.list(org_id, limit, offset, status)

    def get(self, org_id: str, asset_id: str) -> DeceptionAsset:
        asset = self.repo.get(org_id, asset_id)
        if not asset:
            raise NotFoundError("Asset")
        return asset

    def update(self, org_id: str, user_id: str, asset_id: str, req: AssetUpdate) -> DeceptionAsset:
        asset = self.get(org_id, asset_id)
        self.repo.update(asset, req.model_dump(exclude_none=True))
        self.audit.create(org_id, user_id, "asset.update", "asset", asset_id)
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def delete(self, org_id: str, user_id: str, asset_id: str):
        asset = self.get(org_id, asset_id)
        self.repo.delete(asset)
        self.audit.create(org_id, user_id, "asset.delete", "asset", asset_id)
        self.db.commit()



class EventService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EventRepository(db)
        self.alert_repo = AlertRepository(db)

    def ingest(self, org_id: str, req: EventIngest) -> DeceptionEvent:
        severity = _classify_event_cpp(req.event_type, req.payload_preview) or req.severity
        event = self.repo.create(
            org_id=org_id,
            asset_id=req.asset_id,
            event_type=req.event_type,
            source_ip=req.source_ip,
            user_agent=req.user_agent,
            payload_preview=req.payload_preview,
            metadata_json=req.metadata_json or {},
            severity=severity,
        )
        # Auto-create alert for medium+ severity
        if severity in ("medium", "high", "critical"):
            title = f"Deception interaction detected: {req.event_type} from {req.source_ip or 'unknown'}"
            self.alert_repo.create(
                org_id=org_id,
                asset_id=req.asset_id,
                event_id=event.id,
                title=title,
                severity=severity,
            )
        self.db.commit()
        self.db.refresh(event)
        return event

    def list(self, org_id: str, limit: int, offset: int, severity: Optional[str], asset_id: Optional[str]):
        return self.repo.list(org_id, limit, offset, severity, asset_id)

    def get(self, org_id: str, event_id: str) -> DeceptionEvent:
        event = self.repo.get(org_id, event_id)
        if not event:
            raise NotFoundError("Event")
        return event



class AlertService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AlertRepository(db)
        self.audit = AuditLogRepository(db)

    def list(self, org_id: str, limit: int, offset: int, status: Optional[str], severity: Optional[str]):
        return self.repo.list(org_id, limit, offset, status, severity)

    def get(self, org_id: str, alert_id: str) -> Alert:
        alert = self.repo.get(org_id, alert_id)
        if not alert:
            raise NotFoundError("Alert")
        return alert

    def update_status(self, org_id: str, user_id: str, alert_id: str, req: AlertStatusUpdate) -> Alert:
        alert = self.get(org_id, alert_id)
        alert.status = req.status
        self.audit.create(org_id, user_id, "alert.status_update", "alert", alert_id, {"status": req.status})
        self.db.commit()
        self.db.refresh(alert)
        return alert



class HoneytokenService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = HoneytokenRepository(db)
        self.audit = AuditLogRepository(db)

    def create(self, org_id: str, user_id: str, req: HoneytokenCreate) -> tuple[Honeytoken, str]:
        raw_token = f"dg-decoy-{secrets.token_urlsafe(32)}"
        prefix = raw_token[:16]
        token_hash = hash_api_key(raw_token)

        ht = self.repo.create(
            org_id=org_id,
            name=req.name,
            token_type=req.token_type,
            token_value_hash=token_hash,
            token_prefix=prefix,
        )
        self.audit.create(org_id, user_id, "honeytoken.create", "honeytoken", ht.id)
        self.db.commit()
        self.db.refresh(ht)
        return ht, raw_token

    def list(self, org_id: str, limit: int, offset: int):
        return self.repo.list(org_id, limit, offset)

    def get(self, org_id: str, ht_id: str) -> Honeytoken:
        ht = self.repo.get(org_id, ht_id)
        if not ht:
            raise NotFoundError("Honeytoken")
        return ht

    def delete(self, org_id: str, user_id: str, ht_id: str):
        ht = self.get(org_id, ht_id)
        self.repo.delete(ht)
        self.audit.create(org_id, user_id, "honeytoken.delete", "honeytoken", ht_id)
        self.db.commit()



class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.asset_repo = AssetRepository(db)
        self.event_repo = EventRepository(db)
        self.alert_repo = AlertRepository(db)

    def get_stats(self, org_id: str) -> DashboardStats:
        assets, total_assets = self.asset_repo.list(org_id, limit=1000, offset=0)
        return DashboardStats(
            total_assets=total_assets,
            active_assets=self.asset_repo.count_active(org_id),
            events_last_24h=self.event_repo.count_last_24h(org_id),
            open_alerts=self.alert_repo.count_open(org_id),
            critical_alerts=self.alert_repo.count_critical(org_id),
            top_source_ips=self.event_repo.top_source_ips(org_id),
            severity_distribution=self.event_repo.severity_distribution(org_id),
        )



class DemoSimulatorService:
    """Generates safe demo events without touching real network services."""

    DEMO_IPS = ["45.33.32.156", "192.168.100.50", "10.0.0.99", "203.0.113.42", "198.51.100.7"]

    def __init__(self, db: Session):
        self.db = db
        self.event_svc = EventService(db)
        self.asset_repo = AssetRepository(db)

    def _pick_asset(self, org_id: str, asset_type: str) -> Optional[str]:
        items, _ = self.asset_repo.list(org_id, limit=1, offset=0, status="active")
        return items[0].id if items else None

    def simulate_ssh_login(self, org_id: str) -> DeceptionEvent:
        ip = secrets.choice(self.DEMO_IPS)
        return self.event_svc.ingest(org_id, EventIngest(
            asset_id=self._pick_asset(org_id, "fake_ssh"),
            event_type="ssh_login_attempt",
            source_ip=ip,
            user_agent="OpenSSH_8.9p1",
            payload_preview="SSH-2.0-OpenSSH_8.9p1 | username=root | credential redacted",
            metadata_json={"username": "root", "auth_method": "password", "demo": True},
            severity="high",
        ))

    def simulate_admin_panel(self, org_id: str) -> DeceptionEvent:
        ip = secrets.choice(self.DEMO_IPS)
        return self.event_svc.ingest(org_id, EventIngest(
            asset_id=self._pick_asset(org_id, "fake_http_admin"),
            event_type="http_request",
            source_ip=ip,
            user_agent="Mozilla/5.0 (compatible; Scanner/1.0)",
            payload_preview="GET /admin/login HTTP/1.1",
            metadata_json={"path": "/admin/login", "method": "GET", "demo": True},
            severity="medium",
        ))

    def simulate_database_probe(self, org_id: str) -> DeceptionEvent:
        ip = secrets.choice(self.DEMO_IPS)
        return self.event_svc.ingest(org_id, EventIngest(
            asset_id=self._pick_asset(org_id, "fake_database"),
            event_type="database_probe",
            source_ip=ip,
            user_agent=None,
            payload_preview="MySQL 5.7.38 banner probe",
            metadata_json={"banner": "MySQL 5.7.38", "demo": True},
            severity="high",
        ))

    def simulate_honeytoken_trigger(self, org_id: str) -> DeceptionEvent:
        ip = secrets.choice(self.DEMO_IPS)
        return self.event_svc.ingest(org_id, EventIngest(
            event_type="honeytoken_trigger",
            source_ip=ip,
            user_agent="python-requests/2.31.0",
            payload_preview="Honeytoken API key used in request",
            metadata_json={"token_prefix": "dg-decoy-demo", "endpoint": "/api/v1/data", "demo": True},
            severity="critical",
        ))
# Project version: DeceptionGrid V1.6


