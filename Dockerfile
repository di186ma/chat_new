FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

CMD ["gunicorn", "chat.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"] 