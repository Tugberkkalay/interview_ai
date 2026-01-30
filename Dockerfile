# Use multi-stage build for smaller final image

# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile
COPY frontend/ .
RUN bun run build

# Stage 2: Final Backend Image
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast python package management
RUN pip install uv

# Copy backend requirements and install dependencies
COPY backend/pyproject.toml backend/uv.lock ./backend/
WORKDIR /app/backend
RUN uv pip install --system django gunicorn psycopg2-binary whitenoise dj-database-url python-dotenv djangorestframework django-cors-headers google-generativeai cryptography requests drf-spectacular Pillow

# Copy backend code
COPY backend/ .

# Copy built frontend assets from Stage 1
# Vite builds to dist/ by default. We copy:
# - index.html -> backend/templates/index.html
# - assets/ -> backend/static/assets/
COPY --from=frontend-builder /app/dist/index.html /app/backend/templates/index.html
COPY --from=frontend-builder /app/dist/assets/ /app/backend/static/assets/

# Collect static files
# We set verify to false because some storage backends might need credentials we don't have at build time, 
# although for local collection it usually works. 
# Setting SECRET_KEY dummy for build
RUN SECRET_KEY=build_dummy python manage.py collectstatic --noinput

# Expose port (Dokku usually redirects 80->5000 or sets PORT env var)
EXPOSE 8000

# Start Gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
