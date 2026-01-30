#!/bin/bash

# One-command setup script for Hetzner server
# This script will guide you through the entire setup process
# Usage: bash setup-hetzner.sh

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║       AI Interview Platform - Hetzner Setup Wizard       ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run as root${NC}"
    echo "Please run: sudo bash $0"
    exit 1
fi

echo -e "${YELLOW}⚠️  This script will install and configure:${NC}"
echo "   - PostgreSQL database"
echo "   - Python uv package manager"
echo "   - Nginx web server"
echo "   - Systemd service"
echo "   - SSL certificate (Let's Encrypt)"
echo "   - Firewall rules"
echo "   - Cron jobs for maintenance"
echo ""
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Setup cancelled."
    exit 0
fi

# Step 1: System update
echo ""
echo -e "${BLUE}[1/12] Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install required packages
echo ""
echo -e "${BLUE}[2/12] Installing required packages...${NC}"
apt install -y python3 python3-pip git nginx postgresql postgresql-contrib curl build-essential libpq-dev ufw certbot python3-certbot-nginx

# Step 3: PostgreSQL setup
echo ""
echo -e "${BLUE}[3/12] Setting up PostgreSQL...${NC}"
systemctl start postgresql
systemctl enable postgresql

echo ""
echo -e "${YELLOW}Database Configuration:${NC}"
read -p "Database password for interview_user: " DB_PASSWORD

sudo -u postgres psql <<EOF
CREATE DATABASE interview_db;
CREATE USER interview_user WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE interview_user SET client_encoding TO 'utf8';
ALTER ROLE interview_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE interview_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE interview_db TO interview_user;
EOF

echo -e "${GREEN}✅ Database created${NC}"

# Step 4: Install uv
echo ""
echo -e "${BLUE}[4/12] Installing uv package manager...${NC}"
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Step 5: Clone repository
echo ""
echo -e "${BLUE}[5/12] Setting up project directory...${NC}"
echo "Enter your git repository URL:"
read -p "Git URL: " GIT_URL

mkdir -p /root/qtale/service
cd /root/qtale/service

if [ -d "interview" ]; then
    echo -e "${YELLOW}Directory already exists. Pulling latest changes...${NC}"
    cd interview
    git pull origin main
else
    git clone "$GIT_URL" interview
    cd interview
fi

# Step 6: Environment variables
echo ""
echo -e "${BLUE}[6/12] Configuring environment variables...${NC}"
cd backend

if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists. Creating backup...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

cp env.template.hetzner .env

echo ""
echo -e "${YELLOW}Please provide the following information:${NC}"
read -p "Your domain (e.g., interview.example.com): " DOMAIN
read -p "Your server IP: " SERVER_IP
read -p "Gemini API Key: " GEMINI_KEY
read -p "Frontend URL (e.g., https://interview-frontend.example.com): " FRONTEND_URL

# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

# Update .env file
sed -i "s|your-super-secret-key-here-please-change-this|$SECRET_KEY|g" .env
sed -i "s|your-domain.com|$DOMAIN|g" .env
sed -i "s|your-server-ip|$SERVER_IP|g" .env
sed -i "s|your_db_password_here|$DB_PASSWORD|g" .env
sed -i "s|your-gemini-api-key-here|$GEMINI_KEY|g" .env
sed -i "s|https://your-frontend-domain.com|$FRONTEND_URL|g" .env

chmod 600 .env

echo -e "${GREEN}✅ Environment configured${NC}"

# Step 7: Install dependencies
echo ""
echo -e "${BLUE}[7/12] Installing Python dependencies...${NC}"
cd /root/qtale/service/interview/backend
uv sync

# Step 8: Django setup
echo ""
echo -e "${BLUE}[8/12] Setting up Django...${NC}"
uv run python manage.py collectstatic --noinput
uv run python manage.py migrate
uv run python manage.py create_default_prompts || true

echo ""
echo -e "${YELLOW}Create admin user:${NC}"
uv run python manage.py createsuperuser

# Step 9: Systemd service
echo ""
echo -e "${BLUE}[9/12] Installing systemd service...${NC}"
mkdir -p /var/log/interview
cp /root/qtale/service/interview/systemd/interview.service /etc/systemd/system/
systemctl daemon-reload
systemctl start interview
systemctl enable interview

if systemctl is-active --quiet interview; then
    echo -e "${GREEN}✅ Service is running${NC}"
else
    echo -e "${RED}❌ Service failed to start${NC}"
    journalctl -u interview -n 20
fi

# Step 10: Nginx
echo ""
echo -e "${BLUE}[10/12] Configuring Nginx...${NC}"
cp /root/qtale/service/interview/nginx/interview.conf /etc/nginx/sites-available/interview
sed -i "s|your-domain.com|$DOMAIN|g" /etc/nginx/sites-available/interview
ln -sf /etc/nginx/sites-available/interview /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

echo -e "${GREEN}✅ Nginx configured${NC}"

# Step 11: SSL Certificate
echo ""
echo -e "${BLUE}[11/12] Installing SSL certificate...${NC}"
echo -e "${YELLOW}⚠️  Make sure your domain DNS is pointing to this server${NC}"
read -p "Is your DNS configured? (yes/no): " DNS_READY

if [ "$DNS_READY" == "yes" ]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN"
    echo -e "${GREEN}✅ SSL certificate installed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping SSL. Run manually later: sudo certbot --nginx -d $DOMAIN${NC}"
fi

# Step 12: Firewall
echo ""
echo -e "${BLUE}[12/12] Configuring firewall...${NC}"
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo -e "${GREEN}✅ Firewall configured${NC}"

# Cron jobs
echo ""
echo -e "${BLUE}Setting up cron jobs...${NC}"
/root/qtale/service/interview/scripts/setup-cron.sh

# Final health check
echo ""
echo -e "${BLUE}Running health check...${NC}"
sleep 3
/root/qtale/service/interview/scripts/health-check.sh

# Success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║       ✅  Installation Completed Successfully!           ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Your AI Interview Platform is now running at:${NC}"
echo -e "   🌐 http://$DOMAIN"
echo -e "   🔒 https://$DOMAIN"
echo ""
echo -e "${BLUE}Admin Panel:${NC}"
echo -e "   🔐 https://$DOMAIN/admin/"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "   📊 Health Check: sudo /root/qtale/service/interview/scripts/health-check.sh"
echo -e "   📋 View Logs: sudo journalctl -u interview -f"
echo -e "   🔄 Deploy Updates: sudo /root/qtale/service/deploy.sh"
echo -e "   💾 Backup Database: sudo /root/qtale/service/interview/scripts/backup.sh"
echo ""
echo -e "${YELLOW}Important Files:${NC}"
echo -e "   📄 Environment: /root/qtale/service/interview/backend/.env"
echo -e "   📁 Project: /root/qtale/service/interview/"
echo -e "   📚 Documentation: /root/qtale/service/interview/HETZNER_COMMANDS.md"
echo ""
echo -e "${GREEN}🎉 Happy interviewing!${NC}"
