# Stage 1: Build React frontend
FROM node:18-alpine AS web-builder
WORKDIR /app

# Copy root package.json for workspace setup
COPY package*.json ./
RUN npm install

# Copy web package files and build
COPY packages/web/package*.json ./packages/web/
COPY packages/web/ ./packages/web/
RUN cd packages/web && npm install && npm run build

# Stage 2: Build Python runtime with Flask backend
FROM python:3.11-slim AS final

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal OS deps and Python requirements
COPY packages/api/requirements.txt ./
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && pip install --no-cache-dir -r requirements.txt \
  && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY packages/api/ ./

# Copy built React app from web-builder stage
COPY --from=web-builder /app/packages/web/build /frontend

# Update Flask to serve from the new build directory
ENV STATIC_FOLDER=/frontend

EXPOSE 5000

CMD ["python", "app.py"]