#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose up -d --build

echo "\nServices running:"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:8000/health"
