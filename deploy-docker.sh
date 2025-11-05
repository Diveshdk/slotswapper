#!/bin/bash

# SlotSwapper Docker Deployment Script
echo "🚀 Starting SlotSwapper Docker Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Supabase credentials before running again."
    exit 1
fi

echo "📦 Building Docker image..."
docker build -t slotswapper:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    
    echo "🔄 Starting containers..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ SlotSwapper is now running!"
        echo "🌐 Access your application at: http://localhost:3000"
        echo "🔍 API Test Interface: http://localhost:3000/api-test"
        echo "📊 Check container status: docker-compose ps"
        echo "📝 View logs: docker-compose logs -f slotswapper"
        echo "🛑 Stop containers: docker-compose down"
    else
        echo "❌ Failed to start containers"
        exit 1
    fi
else
    echo "❌ Failed to build Docker image"
    exit 1
fi
