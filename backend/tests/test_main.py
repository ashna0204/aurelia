"""App entrypoints and lifespan."""

import app.main as main_module
from app.main import app, lifespan


def test_root_endpoint(client):
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "running"
    assert body["name"]


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}


async def test_lifespan_runs_migration_check(monkeypatch):
    calls = []
    monkeypatch.setattr(main_module, "check_migrations", lambda: calls.append(True))

    async with lifespan(app):
        # Startup ran the migration check before yielding.
        assert calls == [True]
