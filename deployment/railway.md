# Railway Deployment Configuration

# railway.json - Railway deployment configuration
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}

# Instructions for Railway deployment:
# 1. Install Railway CLI: npm install -g @railway/cli
# 2. Login: railway login
# 3. Create project: railway create slotswapper
# 4. Add environment variables: railway variables set KEY=VALUE
# 5. Deploy: railway up
# 
# Required environment variables:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_POSTGRES_URL
# - SUPABASE_POSTGRES_USER
# - SUPABASE_POSTGRES_HOST
# - SUPABASE_JWT_SECRET
# - SUPABASE_POSTGRES_PRISMA_URL
# - SUPABASE_POSTGRES_PASSWORD
# - SUPABASE_POSTGRES_DATABASE
# - SUPABASE_POSTGRES_URL_NON_POOLING
