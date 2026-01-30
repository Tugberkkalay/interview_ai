#!/bin/bash

# Setup cron jobs for AI Interview Platform
# Usage: sudo ./setup-cron.sh

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⏰ Setting up cron jobs...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (sudo)${NC}"
    exit 1
fi

# Backup existing crontab
echo -e "${BLUE}💾 Backing up existing crontab...${NC}"
crontab -l > /root/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true

# Create temporary cron file
TEMP_CRON=$(mktemp)

# Add existing cron jobs (if any)
crontab -l 2>/dev/null | grep -v "interview" > $TEMP_CRON || true

# Add new cron jobs
cat >> $TEMP_CRON << 'EOF'

# AI Interview Platform - Automated Tasks

# Database backup - Every day at 3:00 AM
0 3 * * * /root/qtale/service/interview/scripts/backup.sh >> /var/log/interview/backup.log 2>&1

# Cleanup temporary data - Every day at 2:00 AM
0 2 * * * cd /root/qtale/service/interview/backend && /root/.local/bin/uv run python manage.py cleanup_temp_data >> /var/log/interview/cleanup.log 2>&1

# Cleanup legacy sessions - First day of month at 3:00 AM
0 3 1 * * cd /root/qtale/service/interview/backend && /root/.local/bin/uv run python manage.py cleanup_legacy_sessions >> /var/log/interview/cleanup.log 2>&1

# Retry failed webhooks - Every hour
0 * * * * cd /root/qtale/service/interview/backend && /root/.local/bin/uv run python manage.py retry_webhooks >> /var/log/interview/webhooks.log 2>&1

# SSL certificate renewal check - Every day at 2:30 AM
30 2 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx" >> /var/log/interview/certbot.log 2>&1

EOF

# Install new crontab
crontab $TEMP_CRON
rm $TEMP_CRON

echo ""
echo -e "${GREEN}✅ Cron jobs installed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Installed cron jobs:${NC}"
echo "   - Daily backup at 3:00 AM"
echo "   - Daily cleanup at 2:00 AM"
echo "   - Monthly legacy cleanup"
echo "   - Hourly webhook retry"
echo "   - Daily SSL renewal check"
echo ""
echo -e "${BLUE}📋 View all cron jobs: crontab -l${NC}"
echo -e "${BLUE}📋 View backup logs: tail -f /var/log/interview/backup.log${NC}"
echo -e "${BLUE}📋 View cleanup logs: tail -f /var/log/interview/cleanup.log${NC}"
