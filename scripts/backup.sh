#!/bin/bash

# Database backup script for AI Interview Platform
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="interview_db"
RETENTION_DAYS=7

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔄 Starting backup process...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Database backup
echo -e "${BLUE}📦 Creating database backup...${NC}"
sudo -u postgres pg_dump $DB_NAME > $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql

# Compress backup
echo -e "${BLUE}🗜️  Compressing backup...${NC}"
gzip $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql

# Check if backup was successful
if [ -f "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz" | cut -f1)
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "${GREEN}   File: ${DB_NAME}_${TIMESTAMP}.sql.gz${NC}"
    echo -e "${GREEN}   Size: ${BACKUP_SIZE}${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Delete old backups
echo -e "${BLUE}🧹 Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
DELETED_COUNT=$(find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ $DELETED_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Deleted $DELETED_COUNT old backup(s)${NC}"
else
    echo -e "${BLUE}ℹ️  No old backups to delete${NC}"
fi

# List all backups
echo ""
echo -e "${BLUE}📋 Current backups:${NC}"
ls -lh $BACKUP_DIR/${DB_NAME}_*.sql.gz 2>/dev/null | awk '{print "   " $9 " - " $5}' || echo "   No backups found"

echo ""
echo -e "${GREEN}✅ Backup process completed!${NC}"
