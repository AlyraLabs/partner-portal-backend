#!/bin/bash

# Development script for Partner Portal Backend
set -e

echo "🐳 Starting Partner Portal Backend in Development Mode..."

# Start only database services for development
echo "🔨 Starting development database..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 5

# Set development environment variables
export DB_HOST=localhost
export DB_PORT=5433
export DB_USERNAME=postgres
export DB_PASSWORD=devpassword
export DB_NAME=partner_portal_dev

echo "🔄 Running database migrations..."
npm run migration:run

echo "✅ Development environment ready!"
echo ""
echo "🗄️  PostgreSQL Dev: localhost:5433"
echo "🔴 Redis Dev: localhost:6380"
echo ""
echo "🚀 Now run: npm run start:dev"
echo "🛑 To stop databases: docker-compose -f docker-compose.dev.yml down"
