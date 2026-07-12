import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON, Boolean, Column, DateTime, Enum, ForeignKey,
    String, Text, Integer
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


def gen_uuid():
    return str(uuid.uuid4())



class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    users = relationship("User", back_populates="organization")
    assets = relationship("DeceptionAsset", back_populates="organization")
    events = relationship("DeceptionEvent", back_populates="organization")
    alerts = relationship("Alert", back_populates="organization")
    honeytokens = relationship("Honeytoken", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")
    api_keys = relationship("ApiKey", back_populates="organization")



class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        Enum("OWNER", "ADMIN", "ANALYST", "VIEWER", name="user_role"),
        default="ANALYST"
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    organization = relationship("Organization", back_populates="users")



class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), nullable=False)
    key_prefix = Column(String(16), nullable=False)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    organization = relationship("Organization", back_populates="api_keys")



class DeceptionAsset(Base):
    __tablename__ = "deception_assets"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(
        Enum("fake_ssh", "fake_http_admin", "fake_database", "honeytoken", "fake_api", name="asset_type"),
        nullable=False
    )
    status = Column(
        Enum("active", "inactive", "maintenance", name="asset_status"),
        default="active"
    )
    host = Column(String(255), nullable=True)
    port = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    config_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    organization = relationship("Organization", back_populates="assets")
    events = relationship("DeceptionEvent", back_populates="asset")
    alerts = relationship("Alert", back_populates="asset")



class DeceptionEvent(Base):
    __tablename__ = "deception_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id = Column(UUID(as_uuid=False), ForeignKey("deception_assets.id"), nullable=True)
    event_type = Column(
        Enum("ssh_login_attempt", "http_request", "database_probe", "api_request", "honeytoken_trigger", name="event_type"),
        nullable=False
    )
    source_ip = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    payload_preview = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict)
    severity = Column(
        Enum("low", "medium", "high", "critical", name="event_severity"),
        default="medium"
    )
    created_at = Column(DateTime(timezone=True), default=utcnow)

    organization = relationship("Organization", back_populates="events")
    asset = relationship("DeceptionAsset", back_populates="events")
    alert = relationship("Alert", back_populates="event", uselist=False)



class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id = Column(UUID(as_uuid=False), ForeignKey("deception_assets.id"), nullable=True)
    event_id = Column(UUID(as_uuid=False), ForeignKey("deception_events.id"), nullable=True)
    title = Column(String(512), nullable=False)
    severity = Column(
        Enum("low", "medium", "high", "critical", name="alert_severity"),
        default="medium"
    )
    status = Column(
        Enum("open", "investigating", "resolved", "false_positive", name="alert_status"),
        default="open"
    )
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    organization = relationship("Organization", back_populates="alerts")
    asset = relationship("DeceptionAsset", back_populates="alerts")
    event = relationship("DeceptionEvent", back_populates="alert")



class Honeytoken(Base):
    __tablename__ = "honeytokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    token_type = Column(
        Enum("api_key_decoy", "credential_marker", "url_canary", "file_canary", name="token_type"),
        nullable=False
    )
    token_value_hash = Column(String(255), nullable=False)
    token_prefix = Column(String(32), nullable=True)
    status = Column(
        Enum("active", "triggered", "inactive", name="token_status"),
        default="active"
    )
    trigger_count = Column(Integer, default=0)
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    organization = relationship("Organization", back_populates="honeytokens")



class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    organization_id = Column(UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    action = Column(String(128), nullable=False)
    resource_type = Column(String(64), nullable=True)
    resource_id = Column(String(64), nullable=True)
    metadata_json = Column(JSON, default=dict)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    organization = relationship("Organization", back_populates="audit_logs")
# Project version: DeceptionGrid V1.6
