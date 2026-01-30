#!/bin/bash

# Health check script for AI Interview Platform
# Usage: ./health-check.sh

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🏥 AI Interview Platform - Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if service is running
echo -e "${BLUE}1️⃣  Checking service status...${NC}"
if systemctl is-active --quiet interview; then
    echo -e "${GREEN}   ✅ Service is running${NC}"
    SERVICE_STATUS="OK"
else
    echo -e "${RED}   ❌ Service is not running${NC}"
    SERVICE_STATUS="FAILED"
fi

# Check PostgreSQL
echo ""
echo -e "${BLUE}2️⃣  Checking PostgreSQL...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}   ✅ PostgreSQL is running${NC}"
    
    # Check database connection
    if sudo -u postgres psql -d interview_db -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Database connection OK${NC}"
        
        # Get database size
        DB_SIZE=$(sudo -u postgres psql -d interview_db -t -c "SELECT pg_size_pretty(pg_database_size('interview_db'));")
        echo -e "${BLUE}   ℹ️  Database size: ${DB_SIZE}${NC}"
    else
        echo -e "${RED}   ❌ Cannot connect to database${NC}"
    fi
else
    echo -e "${RED}   ❌ PostgreSQL is not running${NC}"
fi

# Check Nginx
echo ""
echo -e "${BLUE}3️⃣  Checking Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}   ✅ Nginx is running${NC}"
    
    # Test nginx configuration
    if nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Nginx configuration is valid${NC}"
    else
        echo -e "${RED}   ❌ Nginx configuration has errors${NC}"
    fi
else
    echo -e "${RED}   ❌ Nginx is not running${NC}"
fi

# Check disk space
echo ""
echo -e "${BLUE}4️⃣  Checking disk space...${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}   ✅ Disk usage: ${DISK_USAGE}%${NC}"
elif [ $DISK_USAGE -lt 90 ]; then
    echo -e "${YELLOW}   ⚠️  Disk usage: ${DISK_USAGE}% (getting high)${NC}"
else
    echo -e "${RED}   ❌ Disk usage: ${DISK_USAGE}% (critical)${NC}"
fi

# Check memory
echo ""
echo -e "${BLUE}5️⃣  Checking memory...${NC}"
MEMORY_INFO=$(free -h | awk 'NR==2 {print $3 " / " $2 " (" $3/$2 * 100 "%)"}')
echo -e "${BLUE}   ℹ️  Memory usage: ${MEMORY_INFO}${NC}"

# Check log file sizes
echo ""
echo -e "${BLUE}6️⃣  Checking log files...${NC}"
if [ -d "/var/log/interview" ]; then
    LOG_SIZE=$(du -sh /var/log/interview 2>/dev/null | cut -f1)
    echo -e "${BLUE}   ℹ️  Log directory size: ${LOG_SIZE}${NC}"
    
    # Show last errors if any
    ERROR_COUNT=$(grep -c "ERROR" /var/log/interview/error.log 2>/dev/null | tail -100 || echo "0")
    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "${YELLOW}   ⚠️  Found ${ERROR_COUNT} errors in last 100 lines${NC}"
    else
        echo -e "${GREEN}   ✅ No recent errors${NC}"
    fi
fi

# Check socket file
echo ""
echo -e "${BLUE}7️⃣  Checking socket file...${NC}"
if [ -S "/root/qtale/service/interview/backend/interview.sock" ]; then
    echo -e "${GREEN}   ✅ Socket file exists${NC}"
else
    echo -e "${RED}   ❌ Socket file not found${NC}"
fi

# Check SSL certificate
echo ""
echo -e "${BLUE}8️⃣  Checking SSL certificate...${NC}"
if [ -d "/etc/letsencrypt/live" ]; then
    CERT_DIRS=$(ls /etc/letsencrypt/live/ 2>/dev/null | grep -v README)
    if [ -n "$CERT_DIRS" ]; then
        echo -e "${GREEN}   ✅ SSL certificates found${NC}"
        for CERT_DIR in $CERT_DIRS; do
            if [ -f "/etc/letsencrypt/live/$CERT_DIR/cert.pem" ]; then
                EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$CERT_DIR/cert.pem | cut -d= -f2)
                echo -e "${BLUE}   ℹ️  $CERT_DIR expires: $EXPIRY${NC}"
            fi
        done
    else
        echo -e "${YELLOW}   ⚠️  No SSL certificates found${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Let's Encrypt directory not found${NC}"
fi

# Recent service logs
echo ""
echo -e "${BLUE}9️⃣  Recent service logs (last 5 lines):${NC}"
journalctl -u interview -n 5 --no-pager | sed 's/^/   /'

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
if [ "$SERVICE_STATUS" == "OK" ]; then
    echo -e "${GREEN}✅ Overall Status: HEALTHY${NC}"
else
    echo -e "${RED}❌ Overall Status: UNHEALTHY${NC}"
    echo -e "${RED}   Please check the service logs: sudo journalctl -u interview -f${NC}"
fi
echo ""
