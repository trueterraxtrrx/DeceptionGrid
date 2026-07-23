from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models import User
from app.schemas import AlertOut, AlertStatusUpdate, PaginatedResponse
from app.services import AlertService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=PaginatedResponse)
def list_alerts(
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = AlertService(db)
    items, total = svc.list(user.organization_id, limit, offset, status, severity)
    return PaginatedResponse(items=[AlertOut.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return AlertService(db).get(user.organization_id, alert_id)


@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(alert_id: str, req: AlertStatusUpdate, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return AlertService(db).update_status(user.organization_id, user.id, alert_id, req)
# Project version: DeceptionGrid V1.6









