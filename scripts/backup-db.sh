#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup-db.sh — PostgreSQL backup for Pillar Square Properties
# Usage:   ./scripts/backup-db.sh
# Cron:    0 2 * * * cd /srv/pillar-square && ./scripts/backup-db.sh >> /var/log/pillar-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="pillarsquare_${TIMESTAMP}.sql.gz"

# Load .env if present (handles cron environment with no sourced profile)
if [ -f ".env" ]; then
  set -o allexport
  # shellcheck disable=SC1091
  source <(grep -v '^\s*#' .env | grep -v '^\s*$')
  set +o allexport
fi

POSTGRES_DB="${POSTGRES_DB:-pillarsquare}"
POSTGRES_USER="${POSTGRES_USER:-pillarsquare}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [backup] $*"; }

mkdir -p "$BACKUP_DIR"

log "Starting backup of '$POSTGRES_DB' → $BACKUP_DIR/$FILENAME"

docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$BACKUP_DIR/$FILENAME"

SIZE=$(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)
log "Backup complete: $FILENAME ($SIZE)"

# ── Retention: delete backups older than KEEP_DAYS days ───────────────────────
log "Removing backups older than $KEEP_DAYS days…"
find "$BACKUP_DIR" -name "pillarsquare_*.sql.gz" -mtime +"$KEEP_DAYS" -delete

log "Current backups:"
ls -lht "$BACKUP_DIR"/pillarsquare_*.sql.gz 2>/dev/null || log "(none)"
