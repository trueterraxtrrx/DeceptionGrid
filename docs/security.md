# DeceptionGrid Security Scope

## Defensive-Only Scope

DeceptionGrid is defensive-only. It is intended for decoy asset management, honeytokens, suspicious interaction tracking, alert generation and SOC investigation workflows.

It does not include malware, credential theft, exploitation, stealth, persistence, AV bypass, unauthorized remote control or destructive actions.

## Safe Demo Simulators

Demo simulators are local application workflows. They only create database records for events and alerts. They do not open real attack services, execute payloads, scan targets, collect real credentials or control remote systems.

## Honeytokens

Honeytokens are decoy markers. Raw token values are returned once at creation time for operator placement in controlled defensive environments. The backend stores token hashes and short prefixes, not reusable raw token values.

## Credential Handling

DeceptionGrid should not collect real user credentials. Payload previews in demo events must stay synthetic or redacted.

## Application Hardening

- Weak development JWT secrets are blocked when `ENVIRONMENT=production`.
- Wildcard CORS origins are blocked when `ENVIRONMENT=production`.
- Request schemas validate allowed enum values, bounded text fields and TCP port ranges.
- New passwords must include uppercase, lowercase and numeric characters.
- Honeytoken raw values are returned only once during creation.

## Integration Safety

Future KRYNEX integrations should exchange alerts, logs, indicators and metadata through authenticated APIs. Integrations must preserve organization boundaries and should avoid exporting secrets or raw credentials.

## Production Hardening Notes

- Replace development secrets before deployment.
- Enforce least-privilege roles for users and API keys.
- Add rate limiting to ingestion endpoints.
- Add structured audit logging for integration actions.
- Review CORS origins per environment.
<!-- Project version: DeceptionGrid V1.6 -->

