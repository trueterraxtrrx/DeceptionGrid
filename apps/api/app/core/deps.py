from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise UnauthorizedError("Missing authorization token")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedError("Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True).first()
    if not user:
        raise UnauthorizedError("User not found")
    return user


def get_current_active_user(user: User = Depends(get_current_user)) -> User:
    return user


def require_role(*allowed_roles: str):
    def _require_role(user: User = Depends(get_current_active_user)) -> User:
        if user.role not in allowed_roles:
            raise ForbiddenError("You do not have permission to perform this action")
        return user
    return _require_role
# Project version: DeceptionGrid V1.6









