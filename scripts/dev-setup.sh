#!/usr/bin/env bash
set -euo pipefail
if ! command -v docker &>/dev/null; then echo "Docker required"; exit 1; fi
if ! command -v docker compose &>/dev/null && ! command -v docker-compose &>/dev/null; then echo "Docker Compose required"; exit 1; fi

./scripts/init-project.sh
