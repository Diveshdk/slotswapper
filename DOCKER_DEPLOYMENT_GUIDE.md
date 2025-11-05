# 🐳 SlotSwapper Docker & Deployment Guide

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed and running
- Your Supabase credentials ready

### 1. Local Docker Deployment

```bash
# Clone and navigate to your project
git clone https://github.com/Diveshdk/slotswapper.git
cd slotswapper

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env  # or use your preferred editor

# Run the deployment script
./deploy-docker.sh
```

**Or manually:**
```bash
# Build the Docker image
docker build -t slotswapper:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f slotswapper

# Stop containers
docker-compose down
```

### 2. Docker Commands Reference

```bash
# Build image
docker build -t slotswapper:latest .

# Run container directly
docker run -d \
  --name slotswapper \
  -p 3000:3000 \
  --env-file .env \
  slotswapper:latest

# View container logs
docker logs -f slotswapper

# Stop and remove container
docker stop slotswapper && docker rm slotswapper

# View running containers
docker ps

# View all containers
docker ps -a
```

## 🌐 Cloud Deployment Options

### Option 1: Railway (Recommended - Easiest)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway create slotswapper

# Set environment variables (repeat for each variable)
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_value
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
# ... (all other environment variables)

# Deploy
railway up
```

**Railway Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_POSTGRES_URL`
- `SUPABASE_POSTGRES_USER`
- `SUPABASE_POSTGRES_HOST`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_POSTGRES_PRISMA_URL`
- `SUPABASE_POSTGRES_PASSWORD`
- `SUPABASE_POSTGRES_DATABASE`
- `SUPABASE_POSTGRES_URL_NON_POOLING`

### Option 2: Render.com
1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Select **Docker** as the environment
4. Set Dockerfile path to `./Dockerfile`
5. Add all environment variables in Render dashboard
6. Deploy!

### Option 3: DigitalOcean App Platform
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create app from GitHub repository
3. Select your `slotswapper` repository
4. DigitalOcean will auto-detect the Dockerfile
5. Configure environment variables as **secrets**
6. Deploy!

### Option 4: Vercel (Serverless - No Docker)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... (repeat for all variables)

# Redeploy with environment variables
vercel --prod
```

## 🔧 Docker Configuration Details

### Dockerfile Features
- **Multi-stage build** for optimized image size
- **Node.js 20 Alpine** base image (lightweight)
- **Standalone output** for reduced bundle size
- **Non-root user** for security
- **Health check** endpoint integration
- **Production optimizations**

### Docker Compose Features
- **Environment variables** from `.env` file
- **Health checks** with automatic restarts
- **Network isolation**
- **Volume persistence** (if needed)
- **Port mapping** (3000:3000)

## 🏥 Health Checks & Monitoring

Your application includes a health check endpoint at `/api/health` that:
- ✅ Verifies server is running
- ✅ Checks database connectivity
- ✅ Returns JSON status response

**Access health check:**
```bash
curl http://localhost:3000/api/health
```

## 🔍 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker logs slotswapper
   
   # Check environment variables
   docker exec slotswapper env | grep SUPABASE
   ```

2. **Database connection issues**
   - Verify Supabase URL and keys in `.env`
   - Check network connectivity
   - Ensure RLS policies are properly set

3. **Build failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild with no cache
   docker build --no-cache -t slotswapper:latest .
   ```

4. **Port already in use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   
   # Or use different port
   docker run -p 3001:3000 slotswapper:latest
   ```

### Debug Mode
```bash
# Run container with debug output
docker run -it --rm \
  --env-file .env \
  -p 3000:3000 \
  slotswapper:latest

# Or with docker-compose
docker-compose up  # (without -d flag)
```

## 📊 Performance Optimization

### Docker Image Optimization
- ✅ Multi-stage build reduces image size
- ✅ Alpine Linux base (smaller footprint)
- ✅ `.dockerignore` excludes unnecessary files
- ✅ Standalone Next.js output
- ✅ Node.js 20 (latest LTS)

### Production Recommendations
- Use **Redis** for session storage (optional)
- Enable **CDN** for static assets
- Set up **load balancing** for multiple instances
- Configure **SSL/TLS** certificates
- Enable **monitoring** and **logging**

## 🔐 Security Considerations

- ✅ Non-root user in container
- ✅ Environment variables for secrets
- ✅ No hardcoded credentials
- ✅ Minimal attack surface (Alpine Linux)
- ✅ Health check endpoint
- ✅ Network isolation with Docker networks

## 📈 Scaling Options

### Horizontal Scaling
```yaml
# docker-compose.yml - Scale up
services:
  slotswapper:
    # ... existing config
    deploy:
      replicas: 3
    
  nginx:  # Add load balancer
    image: nginx:alpine
    # ... nginx config
```

### Vertical Scaling
```bash
# Increase container resources
docker run -m 2g --cpus="2.0" slotswapper:latest
```

## 🎯 Next Steps

1. **Deploy to your preferred platform**
2. **Set up monitoring** (optional)
3. **Configure custom domain** (optional)
4. **Set up CI/CD pipeline** (optional)
5. **Enable SSL certificate** (automatic on most platforms)

Your SlotSwapper application is now **fully containerized and ready for deployment** on any Docker-compatible platform! 🚀
