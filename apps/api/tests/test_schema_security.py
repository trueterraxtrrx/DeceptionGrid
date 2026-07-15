import pytest
from pathlib import Path
from pydantic import ValidationError

from app.services import _classify_event_cpp, _export_event_cpp
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


def test_cpp_event_classifier_escalates_payload_attacks(monkeypatch):
    monkeypatch.setenv("DECEPTIONGRID_FORCE_CPP", "1")
    binary = Path(__file__).resolve().parents[1] / "cpp" / "event_classifier" / "build" / "Release" / "deceptiongrid-event-classifier.exe"
    monkeypatch.setenv("DECEPTIONGRID_CPP_EVENT_CLASSIFIER", str(binary))
    severity = _classify_event_cpp("http_request", "GET /../../etc/passwd UNION SELECT credential")
    assert severity == "critical"
    exported = _export_event_cpp("logforge", "http_request", "GET /admin")
    assert exported and exported["service"] == "deceptiongrid"
# Project version: DeceptionGrid V1.6



