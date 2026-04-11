# Pillar Square Properties

Real estate marketing site for Pillar Square Properties, Chennai.

**Stack:** React 18 + Vite + TypeScript + TailwindCSS · FastAPI · PostgreSQL 16 · nginx · Docker

**Domain:** example.com

---

## Prerequisites

- Docker + Docker Compose v2
- Git
- A server with ports 80 and 443 open (for production)

---

## Quickstart (local dev)

```bash
git clone <repo-url>
cd pillar-square

cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD, SECRET_KEY, WEBHOOK_SECRET at minimum

docker compose up -d
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

Frontend: http://localhost:5173  
API: http://localhost:8000/api  
API docs: http://localhost:8000/docs

---

## Production Deploy

```bash
# First time
ssh user@your-server
git clone <repo-url> /srv/pillar-square
cd /srv/pillar-square
cp .env.example .env
# Fill in .env with real values
chmod +x scripts/deploy.sh scripts/backup-db.sh
./scripts/deploy.sh
```

On re-deploy:
```bash
./scripts/deploy.sh --skip-certbot
```

### SSL

SSL is bootstrapped automatically on first run via Certbot. Ensure:
- DNS for `example.com` points to the server
- Port 80 is reachable before running deploy (for ACME challenge)

Auto-renewal runs inside the `certbot` container (checks every 12 hours).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_DB` | yes | Database name |
| `POSTGRES_USER` | yes | DB username |
| `POSTGRES_PASSWORD` | yes | DB password |
| `DATABASE_URL` | yes | Full asyncpg connection string |
| `SECRET_KEY` | yes | JWT signing key — use a long random string |
| `DEBUG` | no | `true` enables FastAPI debug mode (default `false`) |
| `ALLOWED_ORIGINS` | yes | Comma-separated CORS origins |
| `BACKEND_CORS_ORIGINS` | no | JSON array of CORS origins (alternative format) |
| `ADMIN_EMAIL` | yes | Default admin login email |
| `ADMIN_PASSWORD` | yes | Default admin login password |
| `TELEGRAM_BOT_TOKEN` | no | Telegram bot token (for admin notifications) |
| `TELEGRAM_ADMIN_CHAT_ID` | no | Chat ID to receive inquiry notifications |
| `WEBHOOK_SECRET` | yes | Shared secret for `X-Webhook-Secret` header on n8n webhook |
| `VITE_API_BASE_URL` | yes | API base URL used by the frontend build |
| `UPLOAD_DIR` | no | Path for uploaded images (default `/app/uploads`) |
| `DOMAIN` | yes | Primary domain (no `https://`) |
| `CERTBOT_EMAIL` | yes | Email for Let's Encrypt registration |

---

## API Reference

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/projects` | public | `?featured=true`, `?category=`, `?status=`, paginated |
| GET | `/api/projects/{slug}` | public | Includes images |
| GET | `/api/services` | public | Ordered by `sort_order` |
| GET | `/api/testimonials` | public | `?featured_only=true` |
| GET | `/api/blog` | public | Published only, paginated |
| GET | `/api/blog/{slug}` | public | |
| GET | `/api/settings` | public | Returns `{key: value}` dict |
| POST | `/api/inquiries` | public | Rate-limited 5/hr per IP |
| POST | `/api/inquiries/webhook/telegram-inquiry` | `X-Webhook-Secret` | n8n webhook target |
| POST | `/api/admin/login` | — | Returns JWT |
| POST | `/api/admin/upload` | JWT | Image upload |
| GET | `/api/admin/inquiries` | JWT | Filterable, paginated |

---

## Database Backups

```bash
# Manual backup
./scripts/backup-db.sh

# Automated daily backup at 2 AM (add to crontab)
0 2 * * * cd /srv/pillar-square && ./scripts/backup-db.sh >> /var/log/pillar-backup.log 2>&1
```

Backups are stored in `./backups/` and rotated — last 7 days kept.

---

## Project Structure

```
pillar-square/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routes/       # FastAPI routers
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Notification, etc.
│   │   ├── seed.py       # Idempotent DB seed
│   │   └── main.py
│   ├── alembic/          # DB migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   └── components/
│   └── Dockerfile
├── nginx/
│   ├── nginx.conf
│   └── conf.d/default.conf
├── scripts/
│   ├── deploy.sh
│   └── backup-db.sh
├── docker-compose.yml        # Dev
├── docker-compose.prod.yml   # Production
└── .env.example
```
