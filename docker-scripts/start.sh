#!/bin/bash

# Start script for Partner Portal Backend
set -e

echo "🐳 Starting Partner Portal Backend with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from docker.env.example..."
    cp docker.env.example .env
    echo "📝 Please edit .env file with your actual configuration values"
    echo "🔑 Don't forget to set JWT_SECRET, MAILGUN_* variables!"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec api npm run migration:run

echo "✅ Partner Portal Backend is running!"
echo ""
echo "🌐 API: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
