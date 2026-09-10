#!/bin/bash

set -euo pipefail

APP_DIR="/home/ubuntu/sweets-app"
SERVER_DIR="$APP_DIR/server"
CLIENT_DIR="$APP_DIR/client"
PM2_APP="vyas-sweets-api"
HEALTH_URL="http://127.0.0.1:5000/api/health"

cd "$APP_DIR"

echo "--- Pulling latest code ---"
git pull origin main

echo "--- Building server ---"
cd "$SERVER_DIR"
npm ci
# Build into a temp dir first so a failing tsc never leaves a half-written dist/.
# set -e already aborts the deploy on failure, but this keeps the running dist intact.
rm -rf dist.new
npm run build -- --outDir dist.new
rm -rf dist
mv dist.new dist

# Sanity-check the fresh build actually contains the current routes (catches a
# stale/partial build silently serving old code).
if ! grep -q "admin-me" dist/routes/auth.js; then
  echo "ERROR: built dist/routes/auth.js is missing expected routes — aborting deploy" >&2
  exit 1
fi

echo "--- Building client ---"
cd "$CLIENT_DIR"
npm ci
npm run build

echo "--- Seeding admin user (idempotent) ---"
cd "$SERVER_DIR"
# seedAdmin reads env via dotenv; load the prod env file so ADMIN_* / MONGO_URI resolve.
if [ -f /etc/sweets-app/.env ]; then
  set -a; . /etc/sweets-app/.env; set +a
fi
node dist/scripts/seedAdmin.js

echo "--- Restarting server ---"
if pm2 list | grep -q "$PM2_APP"; then
  pm2 restart "$PM2_APP" --update-env
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save

echo "--- Health check ---"
# Give the process a moment to bind, then poll the health endpoint.
ok=0
for i in $(seq 1 10); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    ok=1
    echo "Health check passed (attempt $i)"
    break
  fi
  echo "Waiting for API to come up (attempt $i)..."
  sleep 2
done

if [ "$ok" -ne 1 ]; then
  echo "ERROR: API failed health check at $HEALTH_URL" >&2
  pm2 logs "$PM2_APP" --lines 40 --nostream >&2 || true
  exit 1
fi

echo "--- Deployment complete ---"
