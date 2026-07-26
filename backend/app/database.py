"""
Database engine, session, and base model setup.
Uses SQLite by default — swap DATABASE_URL to PostgreSQL for production.
"""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

# For SQLite, we need check_same_thread=False
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_migrations() -> None:
    """Verify the database is migrated to head; raise if it is not.

    This replaces the previous `Base.metadata.create_all()` call. create_all()
    silently created any missing table but never *altered* an existing one, so
    a model change would leave the live schema quietly behind and surface later
    as an OperationalError on a column that was never added. Alembic is now the
    single source of truth for schema, and startup fails loudly on drift rather
    than papering over it.
    """
    from alembic.config import Config
    from alembic.script import ScriptDirectory
    from alembic.runtime.migration import MigrationContext

    alembic_cfg = Config(str(Path(__file__).resolve().parent.parent / "alembic.ini"))
    script = ScriptDirectory.from_config(alembic_cfg)
    head = script.get_current_head()

    with engine.connect() as connection:
        current = MigrationContext.configure(connection).get_current_revision()

    if current != head:
        raise RuntimeError(
            f"Database schema is out of date: at revision {current or '<none>'}, "
            f"expected {head}. Run 'alembic upgrade head' before starting the app."
        )