# Stage 1: Build React frontend
FROM node:22.19.0-alpine AS web-builder
WORKDIR /app

# Copy root package.json for workspace setup
COPY package*.json ./
RUN npm install

# Copy web package files and build
COPY web/package*.json ./web/
COPY web/ ./web/

# Build with Vite (modern, fast, supports Tailwind v4.x)
RUN cd web && echo "=== BUILDING WITH VITE ===" && \
    echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    npm install && \
    npm run build

# Stage 2: Build Python runtime with Flask backend
FROM python:3.13-slim AS final

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal OS deps and Python requirements
COPY api/requirements.txt ./
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && pip install --no-cache-dir -r requirements.txt \
  && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY api/ ./

# Copy built React app from web-builder stage
COPY --from=web-builder /app/web/build /frontend

# Update Flask to serve from the new build directory
ENV STATIC_FOLDER=/frontend

EXPOSE 5000

CMD ["python", "app.py"]