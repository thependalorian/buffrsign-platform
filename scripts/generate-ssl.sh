#!/usr/bin/env bash
set -euo pipefail
DOMAIN=${1:-sign.buffr.ai}
SSL_DIR=./infrastructure/ssl
mkdir -p "$SSL_DIR"
openssl genrsa -out "$SSL_DIR/buffrsign.key" 2048
openssl req -new -key "$SSL_DIR/buffrsign.key" -out "$SSL_DIR/buffrsign.csr" -subj "/C=NA/ST=Khomas/L=Windhoek/O=BuffrSign/CN=$DOMAIN"
openssl x509 -req -days 365 -in "$SSL_DIR/buffrsign.csr" -signkey "$SSL_DIR/buffrsign.key" -out "$SSL_DIR/buffrsign.crt"
echo "Created $SSL_DIR/buffrsign.crt"
