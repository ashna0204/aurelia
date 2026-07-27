"""Database helpers — session lifecycle and migration-drift guard."""

from pathlib import Path

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.pool import StaticPool

import app.database as database_module
from app.database import Base, check_migrations, get_db


def test_get_db_yields_and_closes():
    gen = get_db()
    session = next(gen)
    assert session.is_active
    gen.close()  # runs the finally block → session.close()


def _fresh_engine():
    return create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )


def _head_revision():
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    cfg = Config(str(Path(database_module.__file__).resolve().parent.parent / "alembic.ini"))
    return ScriptDirectory.from_config(cfg).get_current_head()


def test_check_migrations_raises_on_unmigrated_db(monkeypatch):
    engine = _fresh_engine()
    Base.metadata.create_all(engine)  # tables exist but alembic_version does not
    monkeypatch.setattr(database_module, "engine", engine)

    with pytest.raises(RuntimeError, match="schema is out of date"):
        check_migrations()


def test_check_migrations_passes_when_stamped_at_head(monkeypatch):
    engine = _fresh_engine()
    Base.metadata.create_all(engine)
    head = _head_revision()

    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)"))
        conn.execute(text("INSERT INTO alembic_version (version_num) VALUES (:v)"), {"v": head})

    monkeypatch.setattr(database_module, "engine", engine)
    # Should not raise.
    check_migrations()
