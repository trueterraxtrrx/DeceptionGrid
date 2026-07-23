from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
import re



class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    organization_name: str = Field(min_length=2, max_length=255)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must include an uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must include a lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must include a number")
        return value

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    organization_id: str
    created_at: datetime
    model_config = {"from_attributes": True}



class AssetCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    type: str
    host: Optional[str] = None
    port: Optional[int] = Field(default=None, ge=1, le=65535)
    description: Optional[str] = Field(default=None, max_length=1000)
    config_json: Optional[dict] = {}

    @field_validator("type")
    @classmethod
    def validate_asset_type(cls, value: str) -> str:
        allowed = {"fake_ssh", "fake_http_admin", "fake_database", "honeytoken", "fake_api"}
        if value not in allowed:
            raise ValueError("Unsupported asset type")
        return value

class AssetUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    status: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = Field(default=None, ge=1, le=65535)
    description: Optional[str] = Field(default=None, max_length=1000)
    config_json: Optional[dict] = None

    @field_validator("status")
    @classmethod
    def validate_asset_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        allowed = {"active", "inactive", "maintenance"}
        if value not in allowed:
            raise ValueError("Unsupported asset status")
        return value

class AssetOut(BaseModel):
    id: str
    organization_id: str
    name: str
    type: str
    status: str
    host: Optional[str]
    port: Optional[int]
    description: Optional[str]
    config_json: dict
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}



class EventIngest(BaseModel):
    asset_id: Optional[str] = None
    event_type: str
    source_ip: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=512)
    payload_preview: Optional[str] = Field(default=None, max_length=2000)
    metadata_json: Optional[dict] = {}
    severity: str = "medium"

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        allowed = {"ssh_login_attempt", "http_request", "database_probe", "api_request", "honeytoken_trigger"}
        if value not in allowed:
            raise ValueError("Unsupported event type")
        return value

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, value: str) -> str:
        allowed = {"low", "medium", "high", "critical"}
        if value not in allowed:
            raise ValueError("Unsupported severity")
        return value

class EventOut(BaseModel):
    id: str
    organization_id: str
    asset_id: Optional[str]
    event_type: str
    source_ip: Optional[str]
    user_agent: Optional[str]
    payload_preview: Optional[str]
    metadata_json: dict
    severity: str
    created_at: datetime
    model_config = {"from_attributes": True}



class AlertStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        allowed = {"open", "investigating", "resolved", "false_positive"}
        if value not in allowed:
            raise ValueError("Unsupported alert status")
        return value

class AlertOut(BaseModel):
    id: str
    organization_id: str
    asset_id: Optional[str]
    event_id: Optional[str]
    title: str
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}



class HoneytokenCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    token_type: str

    @field_validator("token_type")
    @classmethod
    def validate_token_type(cls, value: str) -> str:
        allowed = {"api_key_decoy", "credential_marker", "url_canary", "file_canary"}
        if value not in allowed:
            raise ValueError("Unsupported honeytoken type")
        return value

class HoneytokenOut(BaseModel):
    id: str
    organization_id: str
    name: str
    token_type: str
    token_prefix: Optional[str]
    status: str
    trigger_count: int
    last_triggered_at: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}

class HoneytokenCreated(HoneytokenOut):
    raw_token: str  # shown once only



class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    limit: int
    offset: int



class AuditLogOut(BaseModel):
    id: str
    organization_id: str
    user_id: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}



class DashboardStats(BaseModel):
    total_assets: int
    active_assets: int
    events_last_24h: int
    open_alerts: int
    critical_alerts: int
    top_source_ips: list[dict]
    severity_distribution: dict
# Project version: DeceptionGrid V1.6









