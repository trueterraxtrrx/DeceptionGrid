import pytest

from app.core.deps import require_role
from app.core.errors import ForbiddenError
from app.core.security import hash_password, verify_password


class _FakeUser:
    def __init__(self, role):
        self.role = role


def test_hash_password_round_trip_with_pinned_bcrypt():
    hashed = hash_password("Demo1234!")
    assert hashed != "Demo1234!"
    assert verify_password("Demo1234!", hashed)


def test_require_role_rejects_disallowed_role():
    check = require_role("OWNER", "ADMIN")
    with pytest.raises(ForbiddenError):
        check(user=_FakeUser("VIEWER"))


def test_require_role_allows_permitted_role():
    check = require_role("OWNER", "ADMIN")
    user = _FakeUser("ADMIN")
    assert check(user=user) is user
# Project version: DeceptionGrid V1.6
