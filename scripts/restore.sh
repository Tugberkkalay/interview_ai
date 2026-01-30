#!/bin/bash

# Database restore script for AI Interview Platform
# Usage: ./restore.sh <backup_file>

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_NAME="interview_db"
BACKUP_DIR="/root/backups"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Backup file not specified${NC}"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -1 $BACKUP_DIR/${DB_NAME}_*.sql.gz 2>/dev/null | sed 's/^/  /' || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try to find it in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}⚠️  WARNING: This will replace the current database!${NC}"
echo -e "${YELLOW}   Database: $DB_NAME${NC}"
echo -e "${YELLOW}   Backup: $BACKUP_FILE${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${BLUE}Restore cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Starting restore process...${NC}"

# Stop the application service
echo -e "${BLUE}🛑 Stopping interview service...${NC}"
systemctl stop interview

# Create a temporary backup of current database
echo -e "${BLUE}💾 Creating safety backup of current database...${NC}"
SAFETY_BACKUP="$BACKUP_DIR/${DB_NAME}_before_restore_$(date +%Y%m%d_%H%M%S).sql"
sudo -u postgres pg_dump $DB_NAME > $SAFETY_BACKUP
gzip $SAFETY_BACKUP
echo -e "${GREEN}✅ Safety backup created: ${SAFETY_BACKUP}.gz${NC}"

# Decompress backup if needed
TEMP_FILE=""
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${BLUE}🗜️  Decompressing backup...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Drop and recreate database
echo -e "${BLUE}🗄️  Dropping existing database...${NC}"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER interview_user;"

# Restore database
echo -e "${BLUE}📥 Restoring database from backup...${NC}"
sudo -u postgres psql $DB_NAME < "$RESTORE_FILE"

# Clean up temp file
if [ -n "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
fi

# Run migrations (in case there are newer migrations)
echo -e "${BLUE}🔄 Running migrations...${NC}"
cd /root/qtale/service/interview/backend
uv run python manage.py migrate

# Start the application service
echo -e "${BLUE}▶️  Starting interview service...${NC}"
systemctl start interview

# Wait and check status
sleep 2
if systemctl is-active --quiet interview; then
    echo ""
    echo -e "${GREEN}✅ Restore completed successfully!${NC}"
    echo -e "${GREEN}✅ Service is running${NC}"
    echo ""
    echo -e "${BLUE}📋 Safety backup location: ${SAFETY_BACKUP}.gz${NC}"
else
    echo ""
    echo -e "${RED}❌ Service failed to start after restore${NC}"
    echo -e "${RED}Check logs: sudo journalctl -u interview -n 50${NC}"
    exit 1
fi
