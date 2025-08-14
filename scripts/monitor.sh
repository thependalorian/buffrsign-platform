#!/usr/bin/env bash
set -euo pipefail
API="http://localhost:8000/health"
WEB="http://localhost:3000"

check() {
  local url=$1
  if curl -fsS "$url" >/dev/null; then
    echo "OK: $url"
  else
    echo "FAIL: $url" >&2
    return 1
  fi
}

check "$API"
check "$WEB"
