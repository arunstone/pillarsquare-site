#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Production deploy for Pillar Square Properties
# Usage:
#   ./scripts/deploy.sh           # full deploy (with SSL bootstrap if needed)
#   ./scripts/deploy.sh --skip-certbot  # skip SSL step (re-deploys only)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"
DOMAIN="${DOMAIN:-example.com}"
EMAIL="${CERTBOT_EMAIL:-admin@example.com}"
CERT_PATH="./certbot/conf/live/$DOMAIN"

log()  { echo -e "\033[1;34m[deploy]\033[0m $*"; }
err()  { echo -e "\033[1;31m[error]\033[0m $*" >&2; }
warn() { echo -e "\033[1;33m[warn]\033[0m $*"; }

# ── 1. Pre-flight checks ───────────────────────────────────────────────────────
log "Checking prerequisites…"
command -v docker >/dev/null || { err "docker not found"; exit 1; }
command -v git    >/dev/null || { err "git not found"; exit 1; }
[ -f ".env" ]     || { err ".env missing — copy .env.example and fill it in"; exit 1; }

# ── 2. Pull latest code ────────────────────────────────────────────────────────
log "Pulling latest changes…"
git pull --rebase

# ── 3. Build images ────────────────────────────────────────────────────────────
log "Building Docker images…"
$COMPOSE build --no-cache --parallel

# ── 4. Start DB only (needed for migrations) ───────────────────────────────────
log "Starting database…"
$COMPOSE up -d db
log "Waiting for DB to be healthy…"
for i in $(seq 1 20); do
  $COMPOSE exec db pg_isready -U "${POSTGRES_USER:-pillar}" >/dev/null 2>&1 && break
  [ "$i" -eq 20 ] && { err "DB did not become healthy in time"; exit 1; }
  sleep 2
done

# ── 5. Run database migrations ─────────────────────────────────────────────────
log "Running Alembic migrations…"
$COMPOSE run --rm backend alembic upgrade head

# ── 6. Seed on first run ───────────────────────────────────────────────────────
SEEDED_FLAG=".seeded"
if [ ! -f "$SEEDED_FLAG" ]; then
  log "First run detected — seeding database…"
  $COMPOSE run --rm backend python -m app.seed
  touch "$SEEDED_FLAG"
  log "Seeding complete."
else
  log "Seed flag found — skipping seed."
fi

# ── 7. SSL: first-run Certbot bootstrap ────────────────────────────────────────
if [[ "${1:-}" != "--skip-certbot" ]]; then
  if [ ! -d "$CERT_PATH" ]; then
    log "No SSL certificate found — bootstrapping Certbot for $DOMAIN…"
    # Bring nginx up in HTTP-only mode (certs don't exist yet so 443 block will
    # fail; use a temporary HTTP-only config or rely on 80 block handling ACME)
    $COMPOSE up -d nginx
    sleep 3
    docker run --rm \
      -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
      -v "$(pwd)/certbot/www:/var/www/certbot" \
      certbot/certbot certonly \
        --webroot -w /var/www/certbot \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos --non-interactive --quiet
    log "SSL certificate obtained."
  else
    log "SSL certificate already exists — skipping initial Certbot run."
  fi
else
  warn "--skip-certbot passed — skipping SSL step."
fi

# ── 8. Start all services (zero downtime rolling restart) ──────────────────────
log "Starting all services…"
$COMPOSE up -d --remove-orphans

# ── 9. Health check ────────────────────────────────────────────────────────────
log "Waiting for backend to become healthy…"
for i in $(seq 1 20); do
  if curl -sf "http://localhost/api/health" >/dev/null 2>&1; then
    log "Backend is healthy."
    break
  fi
  if [ "$i" -eq 20 ]; then
    err "Backend health check failed after 20 attempts."
    $COMPOSE logs --tail=60 backend
    exit 1
  fi
  sleep 3
done

# ── 10. Prune old images ────────────────────────────────────────────────────────
log "Pruning dangling images…"
docker image prune -f

log "Deployment complete — https://$DOMAIN"
