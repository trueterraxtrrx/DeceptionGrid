# DeceptionGrid API

Base path: `/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`

## Assets

- `GET /assets`
- `POST /assets`
- `GET /assets/{id}`
- `PATCH /assets/{id}`
- `DELETE /assets/{id}`

All asset operations are scoped by the authenticated user's `organization_id`. Public demo asset labels must stay synthetic and should not expose real hosts or customer infrastructure.

## Events

- `GET /events`
- `POST /events/ingest`
- `GET /events/{id}`

## Alerts

- `GET /alerts`
- `GET /alerts/{id}`
- `PATCH /alerts/{id}/status`

## Honeytokens

- `GET /honeytokens`
- `POST /honeytokens`
- `GET /honeytokens/{id}`
- `DELETE /honeytokens/{id}`

## Audit

- `GET /audit-logs`

## Demo Simulators

- `POST /demo/simulate/ssh-login`
- `POST /demo/simulate/admin-panel-hit`
- `POST /demo/simulate/database-probe`
- `POST /demo/simulate/honeytoken-trigger`

Demo simulators only create safe local database events and alerts.

## Tenant Isolation

Authenticated resource queries are scoped by the current user's `organization_id`. Integrations should preserve this boundary and avoid cross-organization reads or writes.
<!-- Project version: DeceptionGrid V1.6 -->

