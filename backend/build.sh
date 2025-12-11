#!/bin/bash
# Build script for Render deployment
# This script uses uv as package manager

set -o errexit  # Exit on error

echo "Starting build process..."

# Install uv if not already installed
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Install dependencies using uv
echo "Installing Python dependencies with uv..."
uv sync

# Collect static files
echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

# Run migrations (optional - can be done manually)
# echo "Running migrations..."
# uv run python manage.py migrate --noinput

echo "Build completed successfully!"

