#!/bin/bash

set -euo pipefail

APP_DIR="/home/ubuntu/sweets-app"
SERVER_DIR="$APP_DIR/server"
CLIENT_DIR="$APP_DIR/client"
PM2_APP="vyas-sweets-api"

cd "$APP_DIR"

echo "--- Pulling latest code ---"
git pull origin main

echo "--- Building server ---"
cd "$SERVER_DIR"
npm ci
npm run build

echo "--- Building client ---"
cd "$CLIENT_DIR"
npm ci
npm run build

echo "--- Restarting server ---"
cd "$SERVER_DIR"
if pm2 list | grep -q "$PM2_APP"; then
  pm2 restart "$PM2_APP"
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save

echo "--- Deployment complete ---"
