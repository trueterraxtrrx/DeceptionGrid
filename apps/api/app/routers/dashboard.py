from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models import User
from app.repositories import AuditLogRepository
from app.schemas import DashboardStats, AuditLogOut, PaginatedResponse, EventOut
from app.services import DashboardService, DemoSimulatorService

dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])
audit_router = APIRouter(prefix="/audit-logs", tags=["audit"])
demo_router = APIRouter(prefix="/demo", tags=["demo"])


@dashboard_router.get("/stats", response_model=DashboardStats)
def get_stats(user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return DashboardService(db).get_stats(user.organization_id)


@audit_router.get("", response_model=PaginatedResponse)
def list_audit_logs(
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    repo = AuditLogRepository(db)
    items, total = repo.list(user.organization_id, limit, offset)
    return PaginatedResponse(items=[AuditLogOut.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


@demo_router.post("/simulate/ssh-login", response_model=EventOut, status_code=201)
def sim_ssh(user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return DemoSimulatorService(db).simulate_ssh_login(user.organization_id)


@demo_router.post("/simulate/admin-panel-hit", response_model=EventOut, status_code=201)
def sim_admin(user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return DemoSimulatorService(db).simulate_admin_panel(user.organization_id)


@demo_router.post("/simulate/database-probe", response_model=EventOut, status_code=201)
def sim_db(user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return DemoSimulatorService(db).simulate_database_probe(user.organization_id)


@demo_router.post("/simulate/honeytoken-trigger", response_model=EventOut, status_code=201)
def sim_token(user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return DemoSimulatorService(db).simulate_honeytoken_trigger(user.organization_id)
# Project version: DeceptionGrid V1.6







