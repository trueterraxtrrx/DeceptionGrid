from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg2://deceptiongrid:deceptiongrid@postgres:5432/deceptiongrid"
    REDIS_URL: str = "redis://redis:6379/0"
    JWT_SECRET: str = "replace-with-a-long-random-development-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = True
    CORS_ALLOWED_ORIGINS: str | list[str] = "http://localhost:5173,http://localhost:3000"

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    @classmethod
    def normalize_cors_origins(cls, value):
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def cors_allowed_origins_list(self) -> list[str]:
        if isinstance(self.CORS_ALLOWED_ORIGINS, list):
            return self.CORS_ALLOWED_ORIGINS
        return [self.CORS_ALLOWED_ORIGINS]

    @model_validator(mode="after")
    def validate_security_defaults(self):
        production_like = self.ENVIRONMENT.lower() in {"production", "prod"}
        weak_secrets = {
            "change-me",
            "secret",
            "replace-with-a-long-random-development-secret",
        }
        if production_like and self.JWT_SECRET in weak_secrets:
            raise ValueError("JWT_SECRET must be replaced before production deployment")
        if production_like and "*" in self.cors_allowed_origins_list:
            raise ValueError("Wildcard CORS origins are not allowed in production")
        return self


settings = Settings()
# Project version: DeceptionGrid V1.1
