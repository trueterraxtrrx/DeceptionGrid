from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.services import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
me_router = APIRouter(tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return AuthService(db).register(req)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(req)


@me_router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_active_user)):
    return user
# Project version: DeceptionGrid V1.6

