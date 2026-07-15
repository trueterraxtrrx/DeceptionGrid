# DeceptionGrid Architecture

## Overview

DeceptionGrid is a defensive deception platform in the KRYNEX Labs ecosystem. It provides a FastAPI backend, PostgreSQL data model and React dashboard for decoy assets, suspicious interaction events, alerts, honeytokens and audit logs.

## Components

- `apps/api` - FastAPI application with routers, schemas, repositories, services and Alembic migrations.
- `apps/web` - React/Vite dashboard with authenticated pages and API client.
- `postgres` - primary relational data store.
- `redis` - optional local dependency for future queues, pub/sub or rate limits.

## Backend Layers

- `core` handles settings, database sessions, auth dependencies, security helpers and errors.
- `models` defines SQLAlchemy entities.
- `schemas` defines Pydantic request and response contracts.
- `repositories` keeps tenant-scoped database access in one layer.
- `services` holds business workflows such as event ingestion, alert creation and demo simulation.
- `routers` exposes REST endpoints.

## Data Model

Core entities are organizations, users, deception assets, deception events, alerts, honeytokens and audit logs. Product data is scoped by `organization_id`.

## Demo Simulator Boundary

Demo simulators call application services to create events and alerts. They do not bind ports, deploy honeypot daemons, run payloads, collect real credentials or perform network activity.

## Ecosystem Integration Points

DeceptionGrid can expose event and alert data to KRYNEX Nexus, LogForge, SentinelX, VulnScope and ThreatVault through authenticated API integrations or export workers in future versions.
<!-- Project version: DeceptionGrid V1.6 -->





