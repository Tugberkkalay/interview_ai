#!/bin/bash
# Cron job setup for Interview Platform
# Run this script to set up automated tasks

echo "🔧 Setting up cron jobs for Interview Platform..."
echo ""

# Get the absolute path to manage.py
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MANAGE_PY="$SCRIPT_DIR/manage.py"
PYTHON_PATH="$SCRIPT_DIR/.venv/bin/python"

echo "Project directory: $SCRIPT_DIR"
echo "Python path: $PYTHON_PATH"
echo ""

# Create cron jobs file
cat > /tmp/interview_cron << EOF
# Interview Platform Automated Tasks

# Retry failed webhooks (every 5 minutes)
*/5 * * * * cd $SCRIPT_DIR && $PYTHON_PATH $MANAGE_PY retry_webhooks >> /tmp/interview_webhooks.log 2>&1

# Cleanup expired temporary reports (daily at 3 AM)
0 3 * * * cd $SCRIPT_DIR && $PYTHON_PATH $MANAGE_PY cleanup_temp_data >> /tmp/interview_cleanup.log 2>&1

# Reset monthly quotas (1st day of month at 2 AM)
0 2 1 * * cd $SCRIPT_DIR && $PYTHON_PATH $MANAGE_PY reset_quotas >> /tmp/interview_quotas.log 2>&1

EOF

echo "📋 Cron jobs to be installed:"
echo ""
cat /tmp/interview_cron
echo ""

# Ask for confirmation
read -p "Install these cron jobs? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Install cron jobs
    crontab -l > /tmp/current_cron 2>/dev/null || true
    cat /tmp/current_cron /tmp/interview_cron | crontab -
    
    echo "✅ Cron jobs installed successfully!"
    echo ""
    echo "View installed cron jobs:"
    echo "  crontab -l"
    echo ""
    echo "Remove cron jobs:"
    echo "  crontab -e  (then delete the lines)"
    echo ""
    echo "Log files:"
    echo "  /tmp/interview_webhooks.log"
    echo "  /tmp/interview_cleanup.log"
    echo "  /tmp/interview_quotas.log"
else
    echo "❌ Installation cancelled"
fi

# Cleanup
rm /tmp/interview_cron

