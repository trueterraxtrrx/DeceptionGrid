# DeceptionGrid Deployment

## Local Development

```bash
cp .env.example .env
docker compose up --build
docker compose exec api alembic upgrade head
docker compose exec api python -m app.core.seed
```

Frontend: <http://localhost:5173>  
API docs: <http://localhost:8000/docs>

## Environment

Use `.env.example` as the safe public template. Do not commit real `.env` files.

Required variables:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `ENVIRONMENT`
- `DEMO_MODE`
- `CORS_ALLOWED_ORIGINS`
- `VITE_API_URL`

## Docker Compose

The Compose stack includes PostgreSQL, Redis, API and web services. It is intended for local development and MVP review. Production deployments should use managed secrets, pinned origins, database backups and non-root service hardening.

## Migrations

Run Alembic migrations before using the API:

```bash
docker compose exec api alembic upgrade head
```

## Public Demo Notes

For public demos, keep `DEMO_MODE=true`, use safe seed data and avoid real customer data, real infrastructure addresses or secrets.
<!-- Project version: DeceptionGrid V1.1 -->
