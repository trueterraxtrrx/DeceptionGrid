from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models import User
from app.schemas import EventIngest, EventOut, PaginatedResponse
from app.services import EventService

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=PaginatedResponse)
def list_events(
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    severity: Optional[str] = None,
    asset_id: Optional[str] = None,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = EventService(db)
    items, total = svc.list(user.organization_id, limit, offset, severity, asset_id)
    return PaginatedResponse(items=[EventOut.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


@router.post("/ingest", response_model=EventOut, status_code=201)
def ingest_event(req: EventIngest, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return EventService(db).ingest(user.organization_id, req)


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: str, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return EventService(db).get(user.organization_id, event_id)
# Project version: DeceptionGrid V1.4
