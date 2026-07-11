from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import (
    User, Organization, DeceptionAsset, DeceptionEvent,
    Alert, Honeytoken, AuditLog, ApiKey
)


def utcnow():
    return datetime.now(timezone.utc)



class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, slug: str) -> Organization:
        org = Organization(name=name, slug=slug)
        self.db.add(org)
        self.db.flush()
        return org

    def get_by_slug(self, slug: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.slug == slug).first()

    def get_by_id(self, org_id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == org_id).first()



class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_id: str, email: str, full_name: str, hashed_password: str, role: str = "OWNER") -> User:
        user = User(
            organization_id=org_id,
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            role=role,
        )
        self.db.add(user)
        self.db.flush()
        return user

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()



class AssetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_id: str, **kwargs) -> DeceptionAsset:
        asset = DeceptionAsset(organization_id=org_id, **kwargs)
        self.db.add(asset)
        self.db.flush()
        return asset

    def list(self, org_id: str, limit: int = 50, offset: int = 0, status: Optional[str] = None):
        q = self.db.query(DeceptionAsset).filter(DeceptionAsset.organization_id == org_id)
        if status:
            q = q.filter(DeceptionAsset.status == status)
        total = q.count()
        items = q.order_by(DeceptionAsset.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    def get(self, org_id: str, asset_id: str) -> Optional[DeceptionAsset]:
        return self.db.query(DeceptionAsset).filter(
            DeceptionAsset.id == asset_id,
            DeceptionAsset.organization_id == org_id
        ).first()

    def update(self, asset: DeceptionAsset, data: dict) -> DeceptionAsset:
        for k, v in data.items():
            if v is not None:
                setattr(asset, k, v)
        self.db.flush()
        return asset

    def delete(self, asset: DeceptionAsset):
        self.db.delete(asset)
        self.db.flush()

    def count_active(self, org_id: str) -> int:
        return self.db.query(DeceptionAsset).filter(
            DeceptionAsset.organization_id == org_id,
            DeceptionAsset.status == "active"
        ).count()



class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_id: str, **kwargs) -> DeceptionEvent:
        event = DeceptionEvent(organization_id=org_id, **kwargs)
        self.db.add(event)
        self.db.flush()
        return event

    def list(self, org_id: str, limit: int = 50, offset: int = 0,
             severity: Optional[str] = None, asset_id: Optional[str] = None):
        q = self.db.query(DeceptionEvent).filter(DeceptionEvent.organization_id == org_id)
        if severity:
            q = q.filter(DeceptionEvent.severity == severity)
        if asset_id:
            q = q.filter(DeceptionEvent.asset_id == asset_id)
        total = q.count()
        items = q.order_by(DeceptionEvent.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    def get(self, org_id: str, event_id: str) -> Optional[DeceptionEvent]:
        return self.db.query(DeceptionEvent).filter(
            DeceptionEvent.id == event_id,
            DeceptionEvent.organization_id == org_id
        ).first()

    def count_last_24h(self, org_id: str) -> int:
        since = utcnow() - timedelta(hours=24)
        return self.db.query(DeceptionEvent).filter(
            DeceptionEvent.organization_id == org_id,
            DeceptionEvent.created_at >= since
        ).count()

    def top_source_ips(self, org_id: str, limit: int = 5) -> list[dict]:
        rows = (
            self.db.query(DeceptionEvent.source_ip, func.count().label("count"))
            .filter(DeceptionEvent.organization_id == org_id, DeceptionEvent.source_ip != None)
            .group_by(DeceptionEvent.source_ip)
            .order_by(func.count().desc())
            .limit(limit)
            .all()
        )
        return [{"ip": r.source_ip, "count": r.count} for r in rows]

    def severity_distribution(self, org_id: str) -> dict:
        rows = (
            self.db.query(DeceptionEvent.severity, func.count().label("count"))
            .filter(DeceptionEvent.organization_id == org_id)
            .group_by(DeceptionEvent.severity)
            .all()
        )
        return {r.severity: r.count for r in rows}



class AlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_id: str, **kwargs) -> Alert:
        alert = Alert(organization_id=org_id, **kwargs)
        self.db.add(alert)
        self.db.flush()
        return alert

    def list(self, org_id: str, limit: int = 50, offset: int = 0,
             status: Optional[str] = None, severity: Optional[str] = None):
        q = self.db.query(Alert).filter(Alert.organization_id == org_id)
        if status:
            q = q.filter(Alert.status == status)
        if severity:
            q = q.filter(Alert.severity == severity)
        total = q.count()
        items = q.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    def get(self, org_id: str, alert_id: str) -> Optional[Alert]:
        return self.db.query(Alert).filter(
            Alert.id == alert_id,
            Alert.organization_id == org_id
        ).first()

    def count_open(self, org_id: str) -> int:
        return self.db.query(Alert).filter(
            Alert.organization_id == org_id,
            Alert.status == "open"
        ).count()

    def count_critical(self, org_id: str) -> int:
        return self.db.query(Alert).filter(
            Alert.organization_id == org_id,
            Alert.status == "open",
            Alert.severity == "critical"
        ).count()



class HoneytokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_id: str, **kwargs) -> Honeytoken:
        ht = Honeytoken(organization_id=org_id, **kwargs)
        self.db.add(ht)
        self.db.flush()
        return ht

    def list(self, org_id: str, limit: int = 50, offset: int = 0):
        q = self.db.query(Honeytoken).filter(Honeytoken.organization_id == org_id)
        total = q.count()
        items = q.order_by(Honeytoken.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    def get(self, org_id: str, ht_id: str) -> Optional[Honeytoken]:
        return self.db.query(Honeytoken).filter(
            Honeytoken.id == ht_id,
            Honeytoken.organization_id == org_id
        ).first()

    def delete(self, ht: Honeytoken):
        self.db.delete(ht)
        self.db.flush()



class AuditLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_id: str, user_id: Optional[str], action: str,
               resource_type: Optional[str] = None, resource_id: Optional[str] = None,
               metadata: dict = None, ip_address: Optional[str] = None) -> AuditLog:
        log = AuditLog(
            organization_id=org_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
            ip_address=ip_address,
        )
        self.db.add(log)
        self.db.flush()
        return log

    def list(self, org_id: str, limit: int = 50, offset: int = 0):
        q = self.db.query(AuditLog).filter(AuditLog.organization_id == org_id)
        total = q.count()
        items = q.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
        return items, total
# Project version: DeceptionGrid V1.5
