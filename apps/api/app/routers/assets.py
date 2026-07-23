from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models import User
from app.schemas import AssetCreate, AssetUpdate, AssetOut, PaginatedResponse
from app.services import AssetService

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=PaginatedResponse)
def list_assets(
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    status: Optional[str] = None,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = AssetService(db)
    items, total = svc.list(user.organization_id, limit, offset, status)
    return PaginatedResponse(items=[AssetOut.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


@router.post("", response_model=AssetOut, status_code=201)
def create_asset(req: AssetCreate, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return AssetService(db).create(user.organization_id, user.id, req)


@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: str, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return AssetService(db).get(user.organization_id, asset_id)


@router.patch("/{asset_id}", response_model=AssetOut)
def update_asset(asset_id: str, req: AssetUpdate, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return AssetService(db).update(user.organization_id, user.id, asset_id, req)


@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: str, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    AssetService(db).delete(user.organization_id, user.id, asset_id)
# Project version: DeceptionGrid V1.6









