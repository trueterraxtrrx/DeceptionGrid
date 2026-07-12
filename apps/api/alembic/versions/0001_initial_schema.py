"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-26

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enums
    op.execute("CREATE TYPE user_role AS ENUM ('OWNER','ADMIN','ANALYST','VIEWER')")
    op.execute("CREATE TYPE asset_type AS ENUM ('fake_ssh','fake_http_admin','fake_database','honeytoken','fake_api')")
    op.execute("CREATE TYPE asset_status AS ENUM ('active','inactive','maintenance')")
    op.execute("CREATE TYPE event_type AS ENUM ('ssh_login_attempt','http_request','database_probe','api_request','honeytoken_trigger')")
    op.execute("CREATE TYPE event_severity AS ENUM ('low','medium','high','critical')")
    op.execute("CREATE TYPE alert_severity AS ENUM ('low','medium','high','critical')")
    op.execute("CREATE TYPE alert_status AS ENUM ('open','investigating','resolved','false_positive')")
    op.execute("CREATE TYPE token_type AS ENUM ('api_key_decoy','credential_marker','url_canary','file_canary')")
    op.execute("CREATE TYPE token_status AS ENUM ('active','triggered','inactive')")

    op.create_table("organizations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    op.create_table("users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("OWNER","ADMIN","ANALYST","VIEWER", name="user_role"), default="ANALYST"),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_org", "users", ["organization_id"])

    op.create_table("api_keys",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("key_hash", sa.String(255), nullable=False),
        sa.Column("key_prefix", sa.String(16), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    op.create_table("deception_assets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.Enum("fake_ssh","fake_http_admin","fake_database","honeytoken","fake_api", name="asset_type"), nullable=False),
        sa.Column("status", sa.Enum("active","inactive","maintenance", name="asset_status"), default="active"),
        sa.Column("host", sa.String(255)),
        sa.Column("port", sa.Integer),
        sa.Column("description", sa.Text),
        sa.Column("config_json", sa.JSON),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    op.create_table("deception_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False, index=True),
        sa.Column("asset_id", sa.String(36), sa.ForeignKey("deception_assets.id")),
        sa.Column("event_type", sa.Enum("ssh_login_attempt","http_request","database_probe","api_request","honeytoken_trigger", name="event_type"), nullable=False),
        sa.Column("source_ip", sa.String(45)),
        sa.Column("user_agent", sa.String(512)),
        sa.Column("payload_preview", sa.Text),
        sa.Column("metadata_json", sa.JSON),
        sa.Column("severity", sa.Enum("low","medium","high","critical", name="event_severity"), default="medium"),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    op.create_table("alerts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False, index=True),
        sa.Column("asset_id", sa.String(36), sa.ForeignKey("deception_assets.id")),
        sa.Column("event_id", sa.String(36), sa.ForeignKey("deception_events.id")),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("severity", sa.Enum("low","medium","high","critical", name="alert_severity"), default="medium"),
        sa.Column("status", sa.Enum("open","investigating","resolved","false_positive", name="alert_status"), default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    op.create_table("honeytokens",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("token_type", sa.Enum("api_key_decoy","credential_marker","url_canary","file_canary", name="token_type"), nullable=False),
        sa.Column("token_value_hash", sa.String(255), nullable=False),
        sa.Column("token_prefix", sa.String(32)),
        sa.Column("status", sa.Enum("active","triggered","inactive", name="token_status"), default="active"),
        sa.Column("trigger_count", sa.Integer, default=0),
        sa.Column("last_triggered_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    op.create_table("audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False, index=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("action", sa.String(128), nullable=False),
        sa.Column("resource_type", sa.String(64)),
        sa.Column("resource_id", sa.String(64)),
        sa.Column("metadata_json", sa.JSON),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("user_agent", sa.String(512)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )


def downgrade():
    op.drop_table("audit_logs")
    op.drop_table("honeytokens")
    op.drop_table("alerts")
    op.drop_table("deception_events")
    op.drop_table("deception_assets")
    op.drop_table("api_keys")
    op.drop_table("users")
    op.drop_table("organizations")
    for enum in ["user_role","asset_type","asset_status","event_type","event_severity","alert_severity","alert_status","token_type","token_status"]:
        op.execute(f"DROP TYPE IF EXISTS {enum}")
# Project version: DeceptionGrid V1.6

