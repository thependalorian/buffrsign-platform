# BuffrSign Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying BuffrSign to production environments. BuffrSign is designed to be deployed across multiple platforms with full ETA 2019 compliance and CRAN accreditation support.

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended for Speed)
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **Time to Deploy**: ~15 minutes

### Option 2: Docker + DigitalOcean (Recommended for Control)
- **Full Stack**: Docker containers on DigitalOcean VM
- **Reverse Proxy**: Caddy with automatic SSL
- **Time to Deploy**: ~30 minutes

### Option 3: Kubernetes (Enterprise)
- **Orchestration**: Kubernetes cluster
- **Load Balancing**: Ingress controllers
- **Time to Deploy**: ~45 minutes

## 📋 Prerequisites

### Required Accounts
- **Supabase**: Database and authentication
- **Vercel**: Frontend hosting (Option 1)
- **Railway**: Backend hosting (Option 1)
- **DigitalOcean**: VM hosting (Option 2)
- **Namecheap**: Domain management
- **GitHub**: Code repository

### Required Tools
- **Git**: Version control
- **Docker**: Containerization (Option 2)
- **kubectl**: Kubernetes CLI (Option 3)
- **Domain**: buffr.ai, sign.buffr.ai, api.sign.buffr.ai

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production` with the following variables:

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.inqoltqqfneqfltcqlmx.supabase.co:5432/postgres

# API Configuration
NEXT_PUBLIC_API_URL=https://www.api.sign.buffr.ai
BUFFRSIGN_API_KEY=your-production-api-key

# Security
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
HASH_SALT_ROUNDS=12

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
SUPABASE_STORAGE_BUCKET=buffrsign-documents
SUPABASE_STORAGE_URL=https://inqoltqqfneqfltcqlmx.supabase.co/storage/v1

# AI Services
LLAMAINDEX_ENABLE=1
OPENAI_API_KEY=your-openai-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# CRAN Integration
CRAN_API_URL=https://api.cran.na
CRAN_API_KEY=your-cran-api-key

# Government Integration
NAMIBIA_ID_VERIFICATION_URL=https://api.mha.gov.na
NAMIBIA_ID_API_KEY=your-id-verification-key
```

## 🚀 Option 1: Vercel + Railway Deployment

### Step 1: Deploy Frontend to Vercel

1. **Connect Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd buffrsign-platform
vercel --prod
```

2. **Configure Environment Variables**
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_API_URL production
```

3. **Custom Domain Setup**
```bash
# Add custom domain
vercel domains add sign.buffr.ai

# Configure DNS in Namecheap
# Add CNAME record: sign.buffr.ai -> cname.vercel-dns.com
```

### Step 2: Deploy Backend to Railway

1. **Connect Repository**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
cd apps/api
railway init
```

2. **Configure Environment Variables**
```bash
# Set environment variables
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set BUFFRSIGN_API_KEY=$BUFFRSIGN_API_KEY
railway variables set LLAMAINDEX_ENABLE=1
```

3. **Deploy Application**
```bash
# Deploy to Railway
railway up

# Get deployment URL
railway domain
```

4. **Custom Domain Setup**
```bash
# Add custom domain
railway domain add api.sign.buffr.ai

# Configure DNS in Namecheap
# Add CNAME record: api.sign.buffr.ai -> [railway-domain]
```

### Step 3: Verify Deployment

```bash
# Test frontend
curl https://sign.buffr.ai/api/health

# Test backend
curl https://api.sign.buffr.ai/health

# Test database connection
curl https://api.sign.buffr.ai/api/v1/health
```

## 🐳 Option 2: Docker + DigitalOcean Deployment

### Step 1: Set Up DigitalOcean Droplet

1. **Create Droplet**
```bash
# Create Ubuntu 22.04 LTS droplet
# Size: 2GB RAM, 1 vCPU (minimum)
# Region: Frankfurt (closest to Namibia)
# Authentication: SSH key
```

2. **Connect to Droplet**
```bash
ssh root@your-droplet-ip
```

3. **Install Docker**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Add user to docker group
usermod -aG docker $USER
```

### Step 2: Deploy Application

1. **Clone Repository**
```bash
# Clone BuffrSign repository
git clone https://github.com/your-org/buffrsign-platform.git
cd buffrsign-platform

# Create production environment file
cp .env.example .env.production
nano .env.production
```

2. **Configure Production Environment**
```bash
# Edit .env.production with production values
nano .env.production

# Set production URLs
NEXT_PUBLIC_API_URL=https://api.sign.buffr.ai
FRONTEND_URL=https://sign.buffr.ai
```

3. **Deploy with Docker Compose**
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 3: Configure Reverse Proxy (Caddy)

1. **Install Caddy**
```bash
# Install Caddy
apt install caddy -y

# Create Caddyfile
nano /etc/caddy/Caddyfile
```

2. **Configure Caddyfile**
```caddyfile
# Frontend
sign.buffr.ai {
    reverse_proxy localhost:3000
    log {
        output file /var/log/caddy/sign.buffr.ai.log
    }
}

# Backend API
api.sign.buffr.ai {
    reverse_proxy localhost:8000
    log {
        output file /var/log/caddy/api.sign.buffr.ai.log
    }
}

# Marketing site
buffr.ai {
    reverse_proxy localhost:3001
    log {
        output file /var/log/caddy/buffr.ai.log
    }
}
```

3. **Start Caddy**
```bash
# Reload Caddy configuration
systemctl reload caddy

# Check Caddy status
systemctl status caddy
```

### Step 4: Configure DNS

1. **Namecheap DNS Configuration**
```bash
# Add A record for root domain
buffr.ai -> [your-droplet-ip]

# Add CNAME records for subdomains
sign.buffr.ai -> buffr.ai
api.sign.buffr.ai -> buffr.ai
```

2. **SSL Certificate Verification**
```bash
# Caddy automatically obtains SSL certificates
# Verify certificates are working
curl -I https://sign.buffr.ai
curl -I https://api.sign.buffr.ai
```

## ☸️ Option 3: Kubernetes Deployment

### Step 1: Set Up Kubernetes Cluster

1. **Create Cluster**
```bash
# Using DigitalOcean Kubernetes
# Create cluster with 3 nodes
# Node size: 2GB RAM, 1 vCPU minimum
```

2. **Configure kubectl**
```bash
# Download kubeconfig
doctl kubernetes cluster kubeconfig save buffrsign-cluster

# Verify connection
kubectl cluster-info
```

### Step 2: Deploy Application

1. **Create Namespace**
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
```

2. **Create Secrets**
```bash
# Create secret for environment variables
kubectl create secret generic buffrsign-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=api-key=$BUFFRSIGN_API_KEY \
  -n buffrsign
```

3. **Deploy Services**
```bash
# Deploy backend
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml

# Deploy frontend
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

4. **Verify Deployment**
```bash
# Check pod status
kubectl get pods -n buffrsign

# Check services
kubectl get services -n buffrsign

# Check ingress
kubectl get ingress -n buffrsign
```

## 🔒 Security Configuration

### SSL/TLS Certificates

1. **Automatic SSL (Recommended)**
```bash
# Caddy automatically handles SSL certificates
# No additional configuration needed
```

2. **Manual SSL (Alternative)**
```bash
# Generate SSL certificates
./scripts/generate-ssl.sh sign.buffr.ai

# Configure nginx with SSL
# See infrastructure/nginx/nginx.conf
```

### Firewall Configuration

```bash
# Configure UFW firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Check firewall status
ufw status
```

### Security Headers

```bash
# Configure security headers in nginx
# See infrastructure/nginx/security-headers.conf

# Or use Caddy security headers
# See infrastructure/caddy/Caddyfile
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks**
```bash
# Frontend health check
curl https://sign.buffr.ai/api/health

# Backend health check
curl https://api.sign.buffr.ai/health

# Database health check
curl https://api.sign.buffr.ai/api/v1/health
```

2. **Log Monitoring**
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# View system logs
journalctl -u caddy -f
journalctl -u docker -f
```

### Performance Monitoring

1. **Resource Usage**
```bash
# Monitor system resources
htop
df -h
free -h
```

2. **Application Metrics**
```bash
# Monitor application performance
# Access metrics endpoint
curl https://api.sign.buffr.ai/metrics
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

1. **Create Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
    
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

2. **Configure Secrets**
```bash
# Add secrets to GitHub repository
VERCEL_TOKEN=your-vercel-token
RAILWAY_TOKEN=your-railway-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id
```

## 🚨 Backup & Recovery

### Database Backup

1. **Automated Backups**
```bash
# Create backup script
nano scripts/backup.sh

# Make executable
chmod +x scripts/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/buffrsign-platform/scripts/backup.sh
```

2. **Manual Backup**
```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup files
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

### Disaster Recovery

1. **Recovery Plan**
```bash
# Restore database
psql $DATABASE_URL < backup_file.sql

# Restore files
tar -xzf files_backup.tar.gz

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 📈 Performance Optimization

### Frontend Optimization

1. **Build Optimization**
```bash
# Optimize Next.js build
cd apps/web
npm run build

# Analyze bundle size
npm run analyze
```

2. **CDN Configuration**
```bash
# Configure Vercel CDN
# Automatic with Vercel deployment

# Or configure Cloudflare
# Add domain to Cloudflare
# Configure caching rules
```

### Backend Optimization

1. **Database Optimization**
```bash
# Optimize PostgreSQL
# Add indexes for frequently queried columns
# Configure connection pooling
```

2. **Caching Strategy**
```bash
# Configure Redis caching
# Cache frequently accessed data
# Implement cache invalidation
```

## 🔍 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
```bash
# Check certificate status
openssl s_client -connect sign.buffr.ai:443 -servername sign.buffr.ai

# Renew certificates
caddy reload
```

2. **Database Connection Issues**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
# Monitor active connections
```

3. **Performance Issues**
```bash
# Monitor resource usage
top
iotop
netstat -tulpn

# Check application logs
docker-compose logs -f
```

### Support Resources

- **Documentation**: [docs.sign.buffr.ai](https://www.docs.sign.buffr.ai)
- **Status Page**: [status.sign.buffr.ai](https://www.status.sign.buffr.ai)
- **Support Email**: support@sign.buffr.ai
- **Emergency Contact**: +264-61-BUFF-SIGN

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Security headers configured
- [ ] Monitoring setup complete

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] Performance metrics acceptable
- [ ] Backup system working
- [ ] Monitoring alerts configured
- [ ] Documentation updated

### Production Readiness
- [ ] CRAN accreditation application submitted
- [ ] ETA 2019 compliance verified
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Disaster recovery plan tested
- [ ] Support team trained

## 🎯 Next Steps

1. **Monitor Performance**
   - Set up monitoring dashboards
   - Configure alerting
   - Track key metrics

2. **Scale Infrastructure**
   - Monitor resource usage
   - Scale up as needed
   - Optimize performance

3. **Security Hardening**
   - Regular security audits
   - Penetration testing
   - Compliance monitoring

4. **Feature Development**
   - Mobile app development
   - Advanced AI features
   - Government integrations

---

**BuffrSign** - Production-Ready Digital Signature Platform 🇳🇦

*Deployed with ❤️ for Southern Africa*
