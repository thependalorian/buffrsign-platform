#!/usr/bin/env bash
set -euo pipefail
# placeholder deploy script (wire to your platform)
echo "Build images locally"
docker build -t buffrsign-frontend:local apps/web
docker build -t buffrsign-backend:local apps/api
