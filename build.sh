#!/bin/bash

# Остановка и удаление старых контейнеров
docker-compose down

# Удаление старых образов
docker rmi -f chat-frontend chat-backend

# Сборка фронтенда
echo "Building frontend..."
docker build -t chat-frontend -f frontend.Dockerfile .

# Сборка и запуск контейнеров
echo "Building and starting containers..."
docker-compose up --build -d

# Просмотр логов
echo "Viewing logs..."
docker-compose logs -f 