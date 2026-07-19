from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models import User
from app.schemas import HoneytokenCreate, HoneytokenOut, HoneytokenCreated, PaginatedResponse
from app.services import HoneytokenService

router = APIRouter(prefix="/honeytokens", tags=["honeytokens"])


@router.get("", response_model=PaginatedResponse)
def list_honeytokens(
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = HoneytokenService(db)
    items, total = svc.list(user.organization_id, limit, offset)
    return PaginatedResponse(items=[HoneytokenOut.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


@router.post("", response_model=HoneytokenCreated, status_code=201)
def create_honeytoken(req: HoneytokenCreate, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    ht, raw_token = HoneytokenService(db).create(user.organization_id, user.id, req)
    out = HoneytokenCreated.model_validate(ht)
    out.raw_token = raw_token
    return out


@router.get("/{ht_id}", response_model=HoneytokenOut)
def get_honeytoken(ht_id: str, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return HoneytokenService(db).get(user.organization_id, ht_id)


@router.delete("/{ht_id}", status_code=204)
def delete_honeytoken(ht_id: str, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    HoneytokenService(db).delete(user.organization_id, user.id, ht_id)
# Project version: DeceptionGrid V1.6







