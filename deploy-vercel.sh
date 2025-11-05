#!/bin/bash

# Vercel Deployment Script for SlotSwapper
echo "▲ Vercel Deployment for SlotSwapper"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI"
        echo "Please install manually: npm install -g vercel"
        exit 1
    fi
fi

echo "🔐 Logging into Vercel..."
vercel login

echo "🚀 Initial deployment..."
vercel

echo "⚙️  Setting up environment variables..."
echo "Adding environment variables to Vercel..."

# Check if .env.local exists and read from it
if [ -f ".env.local" ]; then
    echo "📄 Found .env.local file. Adding variables from file..."
    
    # Read each line from .env.local and add to Vercel
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
            continue
        fi
        
        # Extract key=value
        if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            echo "Adding $key..."
            echo "$value" | vercel env add "$key" production
        fi
    done < .env.local
else
    echo "❌ .env.local not found. Please create it first:"
    echo "   cp .env.example .env.local"
    echo "   # Edit .env.local with your Supabase credentials"
    exit 1
fi

echo "🎯 Production deployment with environment variables..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is now live on Vercel!"
echo "📊 View deployments: vercel ls"
echo "📝 View logs: vercel logs"
echo "⚙️  Manage env vars: vercel env ls"
