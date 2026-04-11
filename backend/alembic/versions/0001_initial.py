"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # projects
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column(
            "category",
            sa.Enum("residential", "commercial", "renovation", name="projectcategory"),
            nullable=False,
        ),
        sa.Column("location", sa.String(255)),
        sa.Column("area_sqft", sa.Integer),
        sa.Column(
            "status",
            sa.Enum("completed", "ongoing", "upcoming", name="projectstatus"),
            server_default="ongoing",
        ),
        sa.Column("featured_image", sa.String(500)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_projects_slug", "projects", ["slug"])

    # project_images
    op.create_table(
        "project_images",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "project_id",
            sa.Integer,
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("caption", sa.String(255)),
        sa.Column("sort_order", sa.Integer, server_default="0"),
    )

    # services
    op.create_table(
        "services",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("icon_name", sa.String(100)),
        sa.Column("sort_order", sa.Integer, server_default="0"),
    )

    # testimonials
    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("client_name", sa.String(255), nullable=False),
        sa.Column("client_role", sa.String(255)),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("rating", sa.Integer, server_default="5"),
        sa.Column("is_featured", sa.Boolean, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
    )

    # inquiries
    op.create_table(
        "inquiries",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("message", sa.Text),
        sa.Column(
            "source",
            sa.Enum("web", "telegram", name="inquirysource"),
            server_default="web",
        ),
        sa.Column(
            "status",
            sa.Enum("new", "contacted", "closed", name="inquirystatus"),
            server_default="new",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
    )

    # blog_posts
    op.create_table(
        "blog_posts",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("content", sa.Text),
        sa.Column("excerpt", sa.Text),
        sa.Column("featured_image", sa.String(500)),
        sa.Column("is_published", sa.Boolean, server_default="false"),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_blog_posts_slug", "blog_posts", ["slug"])

    # site_settings
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("value", sa.Text),
    )
    op.create_index("ix_site_settings_key", "site_settings", ["key"])

    # telegram_chats
    op.create_table(
        "telegram_chats",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("chat_id", sa.BigInteger, unique=True, nullable=False),
        sa.Column("username", sa.String(100)),
        sa.Column("first_name", sa.String(100)),
        sa.Column("last_name", sa.String(100)),
        sa.Column("state", sa.JSON, server_default="{}"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_telegram_chats_chat_id", "telegram_chats", ["chat_id"])

    # Seed default site settings
    op.execute(
        """
        INSERT INTO site_settings (key, value) VALUES
        ('phone', '+91 98765 43210'),
        ('email', 'info@example.com'),
        ('address', '123, Anna Salai, Chennai – 600 002, Tamil Nadu, India'),
        ('facebook', ''),
        ('instagram', ''),
        ('youtube', ''),
        ('whatsapp', '+91 98765 43210')
        """
    )

    # Seed default services
    op.execute(
        """
        INSERT INTO services (title, slug, description, icon_name, sort_order) VALUES
        ('Residential Construction', 'residential-construction', 'Custom homes built to your exact specifications with premium materials.', 'home', 1),
        ('Commercial Construction', 'commercial-construction', 'Office buildings, retail spaces, and industrial facilities.', 'building', 2),
        ('Interior Design', 'interior-design', 'Stunning interiors that blend aesthetics with functionality.', 'layout', 3),
        ('Renovation & Remodelling', 'renovation-remodelling', 'Breathe new life into existing structures with expert renovation.', 'tool', 4),
        ('Project Management', 'project-management', 'End-to-end project management ensuring on-time, on-budget delivery.', 'clipboard', 5),
        ('Architecture & Planning', 'architecture-planning', 'Innovative architectural designs that meet regulatory requirements.', 'pen-tool', 6)
        """
    )


def downgrade() -> None:
    op.drop_table("telegram_chats")
    op.drop_table("site_settings")
    op.drop_table("blog_posts")
    op.drop_table("inquiries")
    op.drop_table("testimonials")
    op.drop_table("services")
    op.drop_table("project_images")
    op.drop_table("projects")
    op.execute("DROP TYPE IF EXISTS projectcategory")
    op.execute("DROP TYPE IF EXISTS projectstatus")
    op.execute("DROP TYPE IF EXISTS inquirysource")
    op.execute("DROP TYPE IF EXISTS inquirystatus")
