#!/usr/bin/env bash
set -euo pipefail
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
FILE_DB="$BACKUP_DIR/buffrsign_db_$TS.sql"

if command -v docker compose &>/dev/null; then DC="docker compose"; else DC="docker-compose"; fi

$DC exec -T postgres pg_dump -U buffrsign buffrsign > "$FILE_DB"
echo "Backup created: $FILE_DB"
