FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiera in backend direkt till /app
COPY backend ./ 
COPY frontend ../frontend

WORKDIR /app

EXPOSE 5000
CMD ["python", "app.py"]
