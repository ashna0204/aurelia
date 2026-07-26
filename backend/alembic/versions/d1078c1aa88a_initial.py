"""initial

Creates the two tables backing the public enquiry forms, matching
app.models.Base.metadata.

This revision was previously a no-op (`pass` in both directions) while the
schema was conjured at startup by `Base.metadata.create_all()`. A fresh deploy
running `alembic upgrade head` therefore produced an *empty* database, and any
later model change drifted silently from the live schema, because
`create_all()` never alters an existing table. Both halves are fixed here: the
schema is defined in this revision, and the `create_all()` call is gone.

Revision ID: d1078c1aa88a
Revises:
Create Date: 2026-06-04 12:18:03.200558

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1078c1aa88a'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the quote_requests and contact_messages tables."""
    op.create_table(
        "quote_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("products", sa.JSON(), nullable=False),
        sa.Column("volume", sa.String(length=50), nullable=True),
        sa.Column("frequency", sa.String(length=50), nullable=True),
        sa.Column("destination", sa.String(length=255), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=True),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quote_requests_id"), "quote_requests", ["id"], unique=False)
    op.create_index(op.f("ix_quote_requests_email"), "quote_requests", ["email"], unique=False)
    op.create_index(op.f("ix_quote_requests_status"), "quote_requests", ["status"], unique=False)

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contact_messages_id"), "contact_messages", ["id"], unique=False)


def downgrade() -> None:
    """Drop both tables. Destructive — this erases every stored enquiry."""
    op.drop_index(op.f("ix_contact_messages_id"), table_name="contact_messages")
    op.drop_table("contact_messages")

    op.drop_index(op.f("ix_quote_requests_status"), table_name="quote_requests")
    op.drop_index(op.f("ix_quote_requests_email"), table_name="quote_requests")
    op.drop_index(op.f("ix_quote_requests_id"), table_name="quote_requests")
    op.drop_table("quote_requests")
