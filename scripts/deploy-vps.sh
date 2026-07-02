#!/usr/bin/env bash
# Run on your Ubuntu/nginx VPS after git pull.
# Example: bash scripts/deploy-vps.sh /var/www/karyor

set -euo pipefail

WEB_ROOT="${1:-}"

echo "[Karyor] Installing dependencies..."
npm ci
npm ci --prefix server

echo "[Karyor] Building store frontend (includes Google Analytics)..."
npm run build

if [ -n "$WEB_ROOT" ]; then
  echo "[Karyor] Copying dist/ to ${WEB_ROOT}..."
  mkdir -p "$WEB_ROOT"
  rsync -av --delete dist/ "$WEB_ROOT/"
else
  echo "[Karyor] WEB_ROOT not passed — skipped file copy."
  echo "         Run: bash scripts/deploy-vps.sh /var/www/karyor"
fi

echo "[Karyor] Restarting PM2 API..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart karyor-api || pm2 start ecosystem.config.cjs
  pm2 save
else
  echo "PM2 not found — skip API restart or install PM2 first."
fi

echo "[Karyor] Done. Open karyor.com and check Network tab for googletagmanager."