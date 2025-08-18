#!/usr/bin/env bash
set -euo pipefail

# BuffrSign - Environment Setup Script
# Generates a production .env at /opt/secrets/buffrsign.env from prompts or existing values
SECRETS_FILE="${SECRETS_FILE:-/opt/secrets/buffrsign.env}"

prompt_if_empty() {
  local key="$1"; local default_value="${2:-}"
  local current_value="${!key-}"
  if [ -z "${current_value}" ]; then
    read -rp "$key [${default_value}]: " input || true
    export "$key"="${input:-$default_value}"
  fi
}

mkdir -p "$(dirname "$SECRETS_FILE")"

# Defaults for domains
export AGENT_API_HOSTNAME="${AGENT_API_HOSTNAME:-api.sign.buffr.ai}"
export FRONTEND_HOSTNAME="${FRONTEND_HOSTNAME:-sign.buffr.ai}"
export LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-george@buffr.ai}"

# Prompt for critical settings if not provided via env
prompt_if_empty SUPABASE_URL
prompt_if_empty SUPABASE_SERVICE_ROLE_KEY
prompt_if_empty SUPABASE_ANON_KEY
prompt_if_empty NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
prompt_if_empty NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY"
prompt_if_empty NEXT_PUBLIC_API_URL "https://$AGENT_API_HOSTNAME"
prompt_if_empty NEXT_PUBLIC_API_KEY

# API Configuration
prompt_if_empty BUFFRSIGN_API_KEY

# Optional: AI keys
prompt_if_empty OPENAI_API_KEY

# Security Configuration
prompt_if_empty JWT_SECRET
prompt_if_empty ENCRYPTION_KEY

# Email Configuration
prompt_if_empty SMTP_HOST
prompt_if_empty SMTP_USER
prompt_if_empty SMTP_PASS

# Persist
cat > "$SECRETS_FILE" <<EOF
# Domain Configuration
AGENT_API_HOSTNAME=$AGENT_API_HOSTNAME
FRONTEND_HOSTNAME=$FRONTEND_HOSTNAME
LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL

# Environment Configuration
ENVIRONMENT=production
NODE_ENV=production

# Frontend Configuration
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY

# Backend Configuration
BUFFRSIGN_API_KEY=$BUFFRSIGN_API_KEY
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# AI Configuration
LLAMAINDEX_ENABLE=1
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_TEMPERATURE=0.1

# Security Configuration
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
HASH_SALT_ROUNDS=12

# Email Configuration
SMTP_HOST=$SMTP_HOST
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_SMART_TEMPLATES=true
ENABLE_COMPLIANCE_AI=true
ENABLE_DOCUMENT_INTELLIGENCE=true

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/uploads

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# CORS Configuration
CORS_ORIGINS=https://sign.buffr.ai,https://www.sign.buffr.ai,http://localhost:3000

# Monitoring
LOG_LEVEL=info
EOF

chmod 600 "$SECRETS_FILE"
echo "Wrote secrets to $SECRETS_FILE"
