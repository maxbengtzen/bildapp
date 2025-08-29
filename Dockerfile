# Stage 1: build frontend assets using Node
FROM node:18-alpine AS nodebuilder
WORKDIR /app

# Copy frontend package files and install dependencies, then build the production CSS
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/
RUN cd frontend \
    && npm install \
    && npm run build:css || (echo "Build failed:" && cat npm-debug.log || true)

# Stage 2: final runtime image using Python
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal OS deps and Python requirements
COPY backend/requirements.txt ./
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && pip install --no-cache-dir -r requirements.txt \
  && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./

# Copy the whole frontend folder from the builder stage into /frontend (Flask expects ../frontend)
COPY --from=nodebuilder /app/frontend /frontend

EXPOSE 5000

CMD ["python", "app.py"]
