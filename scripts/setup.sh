#!/usr/bin/env bash
# Bootstraps a fresh Ubuntu 22.04 EC2 host for SkillBridge.
set -euo pipefail

DEPLOY_DIR=${DEPLOY_DIR:-/opt/skillbridge}
NODE_MAJOR=${NODE_MAJOR:-20}

echo "==> apt update + base packages"
sudo apt-get update -y
sudo apt-get install -y curl git nginx ufw

echo "==> Node.js ${NODE_MAJOR}.x"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> PM2"
sudo npm i -g pm2

echo "==> firewall"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "==> deploy dir ${DEPLOY_DIR}"
sudo mkdir -p "$DEPLOY_DIR"
sudo chown -R "$USER":"$USER" "$DEPLOY_DIR"

echo "Done. Clone repo into ${DEPLOY_DIR} and run scripts/deploy.sh"
