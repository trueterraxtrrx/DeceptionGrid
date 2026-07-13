# DeceptionGrid Audit

## Current Folder Structure

```text
DeceptionGrid/
  README.md
  .env.example
  .gitignore
  docker-compose.yml
  Makefile
  apps/
    api/
      app/
        core/
        models/
        repositories/
        routers/
        schemas/
        services/
      alembic/
    web/
      src/
        api/
        components/
        hooks/
        pages/
        types/
  docs/
```

## Backend Stack

FastAPI, SQLAlchemy 2, Alembic, Pydantic, python-jose JWT auth, passlib/bcrypt and PostgreSQL. The API is organized into core settings, routers, schemas, repositories and services.

## Frontend Stack

React 18, TypeScript, Vite, TailwindCSS, React Router, TanStack Query, Axios, Recharts and lucide-react. The dashboard uses a dark enterprise layout with sidebar navigation, cards, tables and badges.

## Database

PostgreSQL is the primary database. Current models include organizations, users, API keys, deception assets, deception events, alerts, honeytokens and audit logs.

## Docker Status

Docker Compose defines PostgreSQL, Redis, API and web services. API and web Dockerfiles are present. The setup is suitable for local MVP development.

## README Status

README has been normalized to match the KRYNEX Labs public MVP style used by LogForge and VulnScope: overview, features, architecture, stack, screenshots, quick start, env vars, API overview, project structure, security scope, ecosystem, roadmap and license.

## Auth Status

JWT auth is implemented with register, login and current-user endpoints. `/api/v1/me` is exposed to match the KRYNEX API style. Legacy `/api/v1/auth/me` was not retained in the frontend to keep the current contract clean.

## API Status

The expected resource endpoints exist for auth, assets, events, alerts, honeytokens, audit logs and safe demo simulators. Demo simulators create local database events and alerts only.

## Frontend Status

Core pages exist for dashboard, assets, asset detail, events, alerts, honeytokens, audit logs and settings. `/assets/:id` is implemented with asset profile, status actions, recent asset-scoped events, configuration JSON, lifecycle metadata and safe operating boundary notes.

## Security Concerns

- `.env.example` uses safe placeholders and must not be replaced with real secrets in git.
- Honeytokens store hashes and prefixes, not raw token values after creation.
- Demo simulator payload previews are static local examples and do not open services or execute payloads.
- Production-like startup rejects weak JWT secrets and wildcard CORS origins.
- Pydantic request models validate password strength, TCP port range, allowed asset/event/status/token enums and bounded text fields.
- API keys have a model but no full management UI yet.
- Rate limiting and production-grade RBAC enforcement should be strengthened before private deployment.

## Differences From Other KRYNEX Projects

- Frontend path is `apps/web` instead of `frontend` or requested `apps/dashboard`.
- Backend path is `apps/api`, which is acceptable and already close to the requested normalized structure.
- API key management remains model-level in the public MVP.
- Screenshots are documented and should be captured after the verified build is running.

## Normalization Completed

- README rewritten in KRYNEX public MVP style.
- Docs added for architecture, API, security, deployment and screenshots.
- Environment template aligned around `DEMO_MODE` and `CORS_ALLOWED_ORIGINS`.
- Current-user API aligned to `/api/v1/me`.
- Defensive-only wording added across README and docs.
- Unsafe/offensive UI wording replaced with neutral SOC wording.
- Encoding artifacts removed from Python section comments.
- Asset detail page added for public demo drill-down.
- Backend validation and production secret/CORS guards added.
- Minimal schema security tests added.

## Left For Later

- Add screenshots for GitHub presentation.
- Add backend integration tests around tenant isolation and simulator behavior.
- Add API key management endpoints/UI if ingestion keys are needed.
- Consider renaming `apps/web` to `apps/dashboard` only when ready to update Docker, Vite and docs together.
<!-- Project version: DeceptionGrid V1.6 -->




