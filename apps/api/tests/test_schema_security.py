import pytest
from pydantic import ValidationError

from app.schemas import AssetCreate, EventIngest, RegisterRequest


def test_register_requires_stronger_demo_password():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="weak@example.com",
            password="password",
            full_name="Weak User",
            organization_name="Weak Org",
        )


def test_asset_port_must_be_valid_tcp_port():
    with pytest.raises(ValidationError):
        AssetCreate(
            name="Invalid port asset",
            type="fake_ssh",
            host="10.0.0.10",
            port=70000,
        )


def test_event_ingest_rejects_unknown_event_type():
    with pytest.raises(ValidationError):
        EventIngest(event_type="raw_payload_execution", severity="critical")
# Project version: DeceptionGrid V1.6
