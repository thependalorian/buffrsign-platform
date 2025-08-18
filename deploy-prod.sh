#!/usr/bin/env bash
set -euo pipefail

# BuffrSign production deployment on a single Ubuntu VM (Docker Compose + Caddy)
# Assumes running from the buffrsign-platform directory in the repository

PROJECT_DIR="$(pwd)"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.caddy.yml"
SECRETS_FILE="${SECRETS_FILE:-/opt/secrets/buffrsign.env}"

echo "🚀 BuffrSign Production Deployment"
echo "Project directory: ${PROJECT_DIR}"
echo "Secrets file: ${SECRETS_FILE}"

# Ensure we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found in current directory"
    echo "Please run this script from the buffrsign-platform directory"
    exit 1
fi

echo "[1/6] Ensuring Docker is installed..."
if ! command -v docker >/dev/null 2>&1; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER" || true
    echo "Docker installed. You may need to log out and back in for group changes to take effect."
fi

echo "[2/6] Enabling firewall (22,80,443)..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow OpenSSH || true
    sudo ufw allow 80,443/tcp || true
    sudo ufw --force enable || true
    echo "Firewall configured"
fi

echo "[3/6] Enabling unattended security updates..."
sudo apt-get update -y >/dev/null 2>&1 || true
sudo apt-get install -y unattended-upgrades >/dev/null 2>&1 || true
sudo dpkg-reconfigure -plow unattended-upgrades >/dev/null 2>&1 || true
echo "Security updates configured"

echo "[4/6] Setting up environment..."
# Run the environment setup script
if [ -f "setup-env.sh" ]; then
    bash setup-env.sh
else
    echo "❌ setup-env.sh not found. Please ensure it exists in the current directory."
    exit 1
fi

echo "[5/6] Building and starting containers..."
# Use the secrets file if it exists
if [ -f "$SECRETS_FILE" ]; then
    echo "Using secrets from: $SECRETS_FILE"
    docker compose ${COMPOSE_FILES} --env-file "$SECRETS_FILE" up -d --build
else
    echo "Using local .env file"
    docker compose ${COMPOSE_FILES} up -d --build
fi

echo "[6/6] Waiting for Caddy to provision certificates (30-60s)..."
sleep 30

echo "--- Compose status ---"
if [ -f "$SECRETS_FILE" ]; then
    docker compose ${COMPOSE_FILES} --env-file "$SECRETS_FILE" ps
else
    docker compose ${COMPOSE_FILES} ps
fi

echo "--- Caddy logs (tail) ---"
if [ -f "$SECRETS_FILE" ]; then
    docker compose ${COMPOSE_FILES} --env-file "$SECRETS_FILE" logs --tail=100 caddy || true
else
    docker compose ${COMPOSE_FILES} logs --tail=100 caddy || true
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Verification commands:"
echo "  curl -I https://sign.buffr.ai"
echo "  curl -I https://api.sign.buffr.ai/health"
echo ""
echo "📊 Monitoring:"
if [ -f "$SECRETS_FILE" ]; then
    echo "  docker compose ${COMPOSE_FILES} --env-file $SECRETS_FILE logs -f"
else
    echo "  docker compose ${COMPOSE_FILES} logs -f"
fi
