.PHONY: up down build logs migrate seed test lint

up:
	docker compose up --build -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

migrate:
	docker compose exec api alembic upgrade head

seed:
	docker compose exec api python -m app.core.seed

test:
	docker compose exec api pytest

lint:
	docker compose exec api ruff check app/

shell-api:
	docker compose exec api bash

shell-db:
	docker compose exec postgres psql -U deceptiongrid deceptiongrid

restart:
	docker compose restart api
# Project version: DeceptionGrid V1.5
