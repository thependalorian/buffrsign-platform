# 🚀 BuffrSign Deployment Guide: Vercel + Railway

## 📋 Overview

This guide provides step-by-step instructions for deploying BuffrSign using:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: LlamaIndex integration

## 🎯 Prerequisites

- GitHub repository with BuffrSign code
- Supabase project configured
- Vercel account
- Railway account
- Domain configured in Namecheap

## 📁 Required Files

### 1. Vercel Configuration (`vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm install"
}
```

### 2. Railway Configuration (`railway.json`)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/api && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd apps/api && uvicorn app:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### 3. Procfile (Alternative to railway.json)
```
web: cd apps/api && uvicorn app:app --host 0.0.0.0 --port $PORT
```

## 🌐 Vercel Deployment (Frontend)

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `thependalorian/buffrsign-platform`
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Environment Variables
Set these in Vercel Project Settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=https://api-sign-buffr-ai.railway.app
NEXT_PUBLIC_API_KEY=your-backend-api-key

# Environment
NODE_ENV=production
```

### Step 3: Domain Configuration
1. Go to Project Settings → Domains
2. Add custom domain: `sign.buffr.ai`
3. Configure DNS records in Namecheap:
   ```
   Type: CNAME
   Host: sign
   Value: cname.vercel-dns.com
   ```

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy your frontend
3. Monitor the build logs for any issues

## 🚂 Railway Deployment (Backend)

### Step 1: Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `thependalorian/buffrsign-platform`
5. Set root directory to `apps/api`

### Step 2: Environment Variables
Set these in Railway Project Settings → Variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres.inqoltqqfneqfltcqlmx:your-password@aws-0-af-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
BUFFRSIGN_API_KEY=your-secure-production-api-key
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://sign.buffr.ai

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-32-chars-min
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key-here
HASH_SALT_ROUNDS=12

# AI Services Configuration
OPENAI_API_KEY=your-openai-api-key-here
LLAMAINDEX_ENABLE=1

# CORS Configuration
CORS_ORIGINS=https://sign.buffr.ai,https://www.sign.buffr.ai,http://localhost:3000
```

### Step 3: Domain Configuration
1. Go to Project Settings → Domains
2. Add custom domain: `api.sign.buffr.ai`
3. Configure DNS records in Namecheap:
   ```
   Type: A
   Host: api.sign
   Value: [Railway IP Address]
   ```

### Step 4: Deploy
1. Railway will automatically detect the configuration
2. Click "Deploy"
3. Monitor the deployment logs

## 🔧 Environment Configuration

### Create `.env` file for local development:
```bash
# Copy the example file
cp env.example .env

# Edit with your actual values
nano .env
```

### Required Environment Variables:

#### Frontend (Vercel)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=https://api-sign-buffr-ai.railway.app
NEXT_PUBLIC_API_KEY=your-backend-api-key
```

#### Backend (Railway)
```bash
BUFFRSIGN_API_KEY=your-secure-production-api-key
SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-super-secure-jwt-secret-key-here-32-chars-min
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

## 🧪 Testing Deployment

### 1. Frontend Tests
```bash
# Test homepage
curl https://sign.buffr.ai

# Test API connectivity
curl https://sign.buffr.ai/api/health
```

### 2. Backend Tests
```bash
# Test health endpoint
curl https://api.sign.buffr.ai/health

# Test API documentation
curl https://api.sign.buffr.ai/docs

# Test authentication
curl -X POST https://api.sign.buffr.ai/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Integration Tests
```bash
# Test frontend → backend communication
curl https://sign.buffr.ai/api/health

# Test database connection
curl https://api.sign.buffr.ai/health
```

## 🔒 Security Checklist

### SSL/TLS
- [ ] Vercel automatically provides SSL certificates
- [ ] Railway automatically provides SSL certificates
- [ ] Custom domains configured with HTTPS

### Environment Variables
- [ ] All sensitive data in environment variables
- [ ] No hardcoded secrets in code
- [ ] Production API keys are secure

### CORS Configuration
- [ ] Only allowed origins configured
- [ ] Credentials properly handled
- [ ] Methods and headers restricted

### Database Security
- [ ] Supabase RLS policies configured
- [ ] Connection strings secured
- [ ] Service role key protected

## 📊 Monitoring Setup

### Vercel Monitoring
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] Analytics setup

### Railway Monitoring
- [ ] Health checks configured
- [ ] Logs monitoring
- [ ] Performance metrics

### Supabase Monitoring
- [ ] Database performance monitoring
- [ ] Query analytics
- [ ] Storage usage tracking

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Node.js version
node --version

# Check Python version
python --version

# Verify dependencies
npm install
pip install -r requirements.txt
```

#### Environment Variables
```bash
# Verify all required variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $BUFFRSIGN_API_KEY

# Check variable names (case-sensitive)
# Ensure no trailing spaces
```

#### CORS Issues
```bash
# Update CORS configuration in FastAPI
CORS_ORIGINS=https://sign.buffr.ai,https://www.sign.buffr.ai

# Check domain configurations
# Verify HTTPS setup
```

#### Database Connection
```bash
# Test connection strings locally
psql "postgresql://postgres.inqoltqqfneqfltcqlmx:password@aws-0-af-south-1.pooler.supabase.com:6543/postgres"

# Check Supabase service status
# Verify RLS policies
```

## 📈 Performance Optimization

### Frontend (Vercel)
- [ ] Image optimization enabled
- [ ] Code splitting configured
- [ ] Caching strategies implemented

### Backend (Railway)
- [ ] Database connection pooling
- [ ] Response caching
- [ ] Rate limiting configured

### Database (Supabase)
- [ ] Indexes optimized
- [ ] Query performance monitored
- [ ] Connection pooling configured

## 🔄 CI/CD Setup

### GitHub Actions (Optional)
```yaml
name: Deploy to Vercel and Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)

### Community
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Railway Discord](https://discord.gg/railway)
- [Supabase Discord](https://discord.supabase.com)

---

## 🎉 Deployment Complete!

Your BuffrSign platform is now deployed with:
- **Frontend**: https://sign.buffr.ai (Vercel)
- **Backend**: https://api.sign.buffr.ai (Railway)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: LlamaIndex integration

### Next Steps
1. Test all functionality
2. Configure monitoring and alerts
3. Set up backup strategies
4. Plan for scaling

**BuffrSign** - Empowering Namibia with legally compliant digital signatures 🇳🇦
