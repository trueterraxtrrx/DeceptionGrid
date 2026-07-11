from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import me_router, router as auth_router
from app.routers.assets import router as assets_router
from app.routers.events import router as events_router
from app.routers.alerts import router as alerts_router
from app.routers.honeytokens import router as honeytokens_router
from app.routers.dashboard import dashboard_router, audit_router, demo_router

app = FastAPI(
    title="DeceptionGrid API",
    description="Enterprise Honeypot & Deception Platform by KRYNEX Labs",
    version="1.4.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(me_router, prefix="/api/v1")
app.include_router(assets_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(honeytokens_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(demo_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "deceptiongrid-api"}
# Project version: DeceptionGrid V1.4
