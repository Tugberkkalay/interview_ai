# Use multi-stage build for smaller final image

# Stage 1: Build Frontend
FROM oven/bun:1 AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
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
RUN uv sync --frozen --no-dev
ENV PATH="/app/backend/.venv/bin:$PATH"

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

# Start Daphne (ASGI)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
