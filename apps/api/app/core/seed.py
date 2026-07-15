"""
Demo seed: creates an org, user, demo assets, and simulated events.
Run: docker compose exec api python -m app.core.seed
"""
from app.core.database import SessionLocal
from app.schemas import RegisterRequest, AssetCreate, EventIngest
from app.services import AuthService, AssetService, DemoSimulatorService


def seed():
    db = SessionLocal()
    try:
        # Register demo org
        auth = AuthService(db)
        try:
            result = auth.register(RegisterRequest(
                email="demo@deceptiongrid.io",
                password="Demo1234!",
                full_name="Demo Admin",
                organization_name="KRYNEX Demo Org",
            ))
            print("OK Demo user created: demo@deceptiongrid.io / Demo1234!")
        except Exception:
            print("~ Demo user already exists, skipping")
            from app.repositories import UserRepository
            user = UserRepository(db).get_by_email("demo@deceptiongrid.io")
            if not user:
                raise
            org_id = user.organization_id
        else:
            from app.core.security import decode_token
            payload = decode_token(result.access_token)
            org_id = payload["org_id"]
            from app.repositories import UserRepository
            user = UserRepository(db).get_by_email("demo@deceptiongrid.io")

        # Create demo assets
        svc = AssetService(db)
        assets_to_create = [
            AssetCreate(name="SSH Honeypot - Web DMZ", type="fake_ssh", host="10.0.1.50", port=22, description="Decoy SSH endpoint in DMZ"),
            AssetCreate(name="Admin Panel Decoy", type="fake_http_admin", host="10.0.1.51", port=8080, description="Fake admin panel"),
            AssetCreate(name="MySQL Banner Trap", type="fake_database", host="10.0.1.52", port=3306, description="Fake MySQL endpoint"),
            AssetCreate(name="Internal API Decoy", type="fake_api", host="10.0.1.53", port=443, description="Fake internal API gateway"),
        ]
        for a in assets_to_create:
            try:
                svc.create(org_id, user.id, a)
                print(f"OK Asset created: {a.name}")
            except Exception as e:
                print(f"~ Skipping asset {a.name}: {e}")

        # Simulate some events
        sim = DemoSimulatorService(db)
        for _ in range(3):
            sim.simulate_ssh_login(org_id)
        for _ in range(2):
            sim.simulate_admin_panel(org_id)
        sim.simulate_database_probe(org_id)
        sim.simulate_honeytoken_trigger(org_id)
        print("OK Demo events simulated")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
# Project version: DeceptionGrid V1.6






