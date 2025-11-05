#!/bin/bash

# Docker Installation Script for macOS
echo "🐳 Docker Installation and Setup for SlotSwapper"

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is already installed!"
    docker --version
else
    echo "❌ Docker not found. Installing Docker Desktop..."
    
    # Check if Homebrew is installed
    if command -v brew &> /dev/null; then
        echo "📦 Installing Docker Desktop via Homebrew..."
        brew install --cask docker
        
        echo "🚀 Starting Docker Desktop..."
        open /Applications/Docker.app
        
        echo "⏳ Waiting for Docker to start (this may take a few minutes)..."
        echo "   Please wait for Docker Desktop to fully load before continuing."
        echo "   You'll see the Docker icon in your menu bar when it's ready."
        
        # Wait for Docker daemon to be ready
        while ! docker info > /dev/null 2>&1; do
            echo "   Still waiting for Docker to start..."
            sleep 5
        done
        
        echo "✅ Docker is now running!"
        
    else
        echo "❌ Homebrew not found. Please install Docker Desktop manually:"
        echo "   1. Visit: https://docs.docker.com/desktop/install/mac/"
        echo "   2. Download Docker Desktop for Mac"
        echo "   3. Install and run Docker Desktop"
        echo "   4. Return and run this script again"
        exit 1
    fi
fi

echo "🔧 Docker installation complete!"
echo "📝 Next steps:"
echo "   1. Copy .env.example to .env: cp .env.example .env"
echo "   2. Edit .env with your Supabase credentials"
echo "   3. Run deployment: ./deploy-docker.sh"
echo ""
echo "🌐 Alternative deployment options (no Docker required):"
echo "   • Vercel: https://vercel.com (recommended for Next.js)"
echo "   • Railway: https://railway.app (Docker support)"
echo "   • Render: https://render.com (Docker support)"
