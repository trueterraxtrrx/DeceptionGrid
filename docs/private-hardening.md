# DeceptionGrid Private Deployment Notes

The private version can use the same app structure as the public demo, but must run with stricter operational controls.

## Required Before Private Use

- Set `ENVIRONMENT=production`.
- Replace `JWT_SECRET` with a long random secret.
- Pin `CORS_ALLOWED_ORIGINS` to private domains only.
- Use managed PostgreSQL backups or encrypted volume backups.
- Add rate limiting for ingestion and auth endpoints.
- Add integration tests for organization isolation.
- Add API key management endpoints and UI before external ingestion is enabled.
- Review role enforcement for OWNER, ADMIN, ANALYST and VIEWER workflows.

## Security Boundary

Private deployment must remain defensive-only. Do not add malware, exploit payloads, stealth, persistence, AV bypass, credential theft, destructive actions or unauthorized remote control.

Safe private extensions are allowed:

- authenticated ingestion APIs;
- export workers to LogForge/Nexus;
- richer alert workflows;
- read-only public demo mode;
- private SOC dashboards;
- audit log retention policies.
<!-- Project version: DeceptionGrid V1.3 -->
