#!/bin/bash

# Railway.app Deployment Script for SlotSwapper
echo "🚂 Railway Deployment for SlotSwapper"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Railway CLI"
        echo "Please install manually: npm install -g @railway/cli"
        exit 1
    fi
fi

echo "🔐 Logging into Railway..."
railway login

echo "🎯 Creating Railway project..."
railway create slotswapper

echo "⚙️  Setting up environment variables..."
echo "Please enter your Supabase credentials:"

read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
railway variables set NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"

read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"

read -p "SUPABASE_SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY
railway variables set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"

read -p "SUPABASE_POSTGRES_URL: " POSTGRES_URL
railway variables set SUPABASE_POSTGRES_URL="$POSTGRES_URL"

read -p "SUPABASE_POSTGRES_USER (usually 'postgres'): " POSTGRES_USER
railway variables set SUPABASE_POSTGRES_USER="$POSTGRES_USER"

read -p "SUPABASE_POSTGRES_HOST: " POSTGRES_HOST
railway variables set SUPABASE_POSTGRES_HOST="$POSTGRES_HOST"

read -p "SUPABASE_JWT_SECRET: " JWT_SECRET
railway variables set SUPABASE_JWT_SECRET="$JWT_SECRET"

read -p "SUPABASE_POSTGRES_PRISMA_URL: " PRISMA_URL
railway variables set SUPABASE_POSTGRES_PRISMA_URL="$PRISMA_URL"

read -p "SUPABASE_POSTGRES_PASSWORD: " POSTGRES_PASSWORD
railway variables set SUPABASE_POSTGRES_PASSWORD="$POSTGRES_PASSWORD"

read -p "SUPABASE_POSTGRES_DATABASE (usually 'postgres'): " POSTGRES_DATABASE
railway variables set SUPABASE_POSTGRES_DATABASE="$POSTGRES_DATABASE"

read -p "SUPABASE_POSTGRES_URL_NON_POOLING: " POSTGRES_URL_NON_POOLING
railway variables set SUPABASE_POSTGRES_URL_NON_POOLING="$POSTGRES_URL_NON_POOLING"

echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at the Railway-provided URL"
echo "📊 Check deployment status: railway status"
echo "📝 View logs: railway logs"
