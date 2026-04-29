#!/usr/bin/env bash
# Deploy / redeploy SkillBridge on the host.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> install deps"
npm ci

echo "==> prisma generate + migrate"
npx prisma generate
npx prisma migrate deploy

echo "==> build"
npm run build

echo "==> pm2 reload"
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save

echo "Done."
