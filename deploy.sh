#!/bin/bash

# Deployment script for AI Interview Platform on Hetzner
# Usage: sudo ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/root/qtale/service/interview"
BACKEND_DIR="$PROJECT_DIR/backend"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd $PROJECT_DIR

# Git pull
echo -e "${BLUE}📥 Pulling latest changes from git...${NC}"
git pull origin main

cd $BACKEND_DIR

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${RED}❌ uv is not installed${NC}"
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies with uv...${NC}"
uv sync

# Collect static files
echo -e "${BLUE}📁 Collecting static files...${NC}"
uv run python manage.py collectstatic --noinput

# Run migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
uv run python manage.py migrate

# Create default prompts if they don't exist
echo -e "${BLUE}📝 Creating default prompts...${NC}"
uv run python manage.py create_default_prompts || true

# Restart service
echo -e "${BLUE}🔄 Restarting interview service...${NC}"
systemctl restart interview

# Wait a moment for service to start
sleep 2

# Check service status
if systemctl is-active --quiet interview; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}✅ Service is running${NC}"
    echo ""
    echo -e "${BLUE}🔍 Check status: sudo systemctl status interview${NC}"
    echo -e "${BLUE}📋 View logs: sudo journalctl -u interview -f${NC}"
else
    echo -e "${RED}❌ Service failed to start${NC}"
    echo -e "${RED}Check logs: sudo journalctl -u interview -n 50${NC}"
    exit 1
fi

# Show service status
echo ""
echo -e "${BLUE}Service Status:${NC}"
systemctl status interview --no-pager -l
