# BuffrSign Production Deployment Guide

## 🚀 Current Status

### ✅ Completed
- DNS Configuration (Namecheap)
  - `api.sign.buffr.ai` → 192.34.63.153
  - `sign.buffr.ai` → Vercel
  - `app.buffr.ai` → Vercel
  - `supabase.buffr.ai` → Supabase
- Backend API running on port 8003
- Frontend running on port 3000
- Supabase database configured
- All API endpoints tested and working

### 🔄 Next Steps
1. Add root domain DNS record
2. Deploy backend to production server
3. Deploy frontend to Vercel
4. Configure SSL certificates
5. Update environment variables

## 📋 DNS Configuration (Namecheap)

### Current Records ✅
```
A Record     api.sign       192.34.63.153         Automatic
CNAME Record sign           cname.vercel-dns.com  Automatic
CNAME Record app            cname.vercel-dns.com  Automatic
CNAME Record www            app.buffr.ai          Automatic
CNAME Record supabase       inqoltqqfneqfltcqlmx.supabase.co Automatic
```

### Missing Record ⚠️
```
CNAME Record @              cname.vercel-dns.com  Automatic
```

**Action Required**: Add the root domain CNAME record in Namecheap DNS settings.

## 🖥️ Backend Deployment (API Server: 192.34.63.153)

### Current Configuration
- **Server IP**: 192.34.63.153
- **Port**: 8003
- **Framework**: FastAPI (Python)
- **Status**: ✅ Running locally

### Production Deployment Steps

#### 1. Server Setup
```bash
# SSH to your server
ssh root@192.34.63.153

# Install Python 3.11+
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Install Nginx
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/thependalorian/buffrsign-platform.git
cd buffrsign-platform

# Create virtual environment
python3.11 -m venv buffrsign_env
source buffrsign_env/bin/activate

# Install dependencies
cd apps/api
pip install -r requirements.txt

# Create production environment file
cat > .env << 'EOF'
BUFFRSIGN_API_KEY=your-secure-production-api-key
DATABASE_URL=postgresql://postgres.inqoltqqfneqfltcqlmx:your-password@aws-0-af-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
NODE_ENV=production
CORS_ORIGINS=https://sign.buffr.ai,https://www.sign.buffr.ai
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENCRYPTION_KEY=your-32-character-encryption-key
HASH_SALT_ROUNDS=12
LLAMAINDEX_ENABLE=1
OPENAI_API_KEY=your-openai-api-key
EOF
```

#### 3. Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/buffrsign-api

# Add this configuration:
server {
    listen 80;
    server_name api.sign.buffr.ai;

    location / {
        proxy_pass http://127.0.0.1:8003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/buffrsign-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d api.sign.buffr.ai

# Test auto-renewal
sudo certbot renew --dry-run
```

#### 5. Systemd Service
```bash
# Create systemd service
sudo nano /etc/systemd/system/buffrsign-api.service

# Add this configuration:
[Unit]
Description=BuffrSign API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/root/buffrsign-platform/apps/api
Environment=PATH=/root/buffrsign-platform/buffrsign_env/bin
ExecStart=/root/buffrsign-platform/buffrsign_env/bin/uvicorn app:app --host 0.0.0.0 --port 8003
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable buffrsign-api
sudo systemctl start buffrsign-api
sudo systemctl status buffrsign-api
```

## 🌐 Frontend Deployment (Vercel)

### Current Configuration
- **Framework**: Next.js 14
- **Status**: ✅ Running locally on port 3000

### Vercel Deployment Steps

#### 1. Repository Setup
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### 2. Vercel Project Setup
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Environment Variables
Set these in Vercel Project Settings → Environment Variables:

```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucW9sdHFxZm5lcWZsdGNxbG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQyNzIsImV4cCI6MjA3MDc0MDI3Mn0.gbHXR7dU54NQ1yfoOGKN9GoWcb-HctHLPLEWuSO3CZg
NEXT_PUBLIC_API_URL=https://api.sign.buffr.ai
NEXT_PUBLIC_API_KEY=your-secure-production-api-key
NODE_ENV=production
```

#### 4. Custom Domain
1. Go to Vercel Project Settings → Domains
2. Add custom domain: `sign.buffr.ai`
3. Vercel will automatically configure SSL

## 🔧 Environment Variables Summary

### Frontend (.env.local) - Update for Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucW9sdHFxZm5lcWZsdGNxbG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQyNzIsImV4cCI6MjA3MDc0MDI3Mn0.gbHXR7dU54NQ1yfoOGKN9GoWcb-HctHLPLEWuSO3CZg
NEXT_PUBLIC_API_URL=https://api.sign.buffr.ai
NEXT_PUBLIC_API_KEY=your-secure-production-api-key
```

### Backend (.env) - Production Server
```bash
BUFFRSIGN_API_KEY=your-secure-production-api-key
DATABASE_URL=postgresql://postgres.inqoltqqfneqfltcqlmx:your-password@aws-0-af-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
NODE_ENV=production
CORS_ORIGINS=https://sign.buffr.ai,https://www.sign.buffr.ai
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENCRYPTION_KEY=your-32-character-encryption-key
HASH_SALT_ROUNDS=12
LLAMAINDEX_ENABLE=1
OPENAI_API_KEY=your-openai-api-key
```

## 🧪 Testing Checklist

### Pre-Deployment Tests
- [ ] API health check: `curl https://api.sign.buffr.ai/health`
- [ ] API ping: `curl -H "X-API-Key: your-key" https://api.sign.buffr.ai/api/v1/ping`
- [ ] Frontend loads: `https://sign.buffr.ai`
- [ ] Database connection working
- [ ] Supabase authentication working

### Post-Deployment Tests
- [ ] SSL certificates working
- [ ] CORS configuration correct
- [ ] File uploads working
- [ ] Email notifications working
- [ ] AI features working (if enabled)

## 🔒 Security Checklist

### SSL/TLS
- [ ] API server has valid SSL certificate
- [ ] Frontend has valid SSL certificate
- [ ] Auto-renewal configured

### Environment Variables
- [ ] All sensitive data in environment variables
- [ ] No hardcoded secrets in code
- [ ] Production API keys are secure

### CORS Configuration
- [ ] Only allowed origins configured
- [ ] Credentials properly handled
- [ ] Methods and headers restricted

## 📊 Monitoring Setup

### Health Checks
```bash
# API Health
curl https://api.sign.buffr.ai/health

# Frontend Health
curl https://sign.buffr.ai/api/health
```

### Logs
```bash
# Backend logs
sudo journalctl -u buffrsign-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🚨 Emergency Procedures

### Rollback Plan
1. Keep previous deployment ready
2. Database backups configured
3. Environment variable backups

### Contact Information
- **Server Access**: SSH to 192.34.63.153
- **Vercel Dashboard**: [vercel.com](https://vercel.com)
- **Supabase Dashboard**: [supabase.com](https://supabase.com)
- **Namecheap DNS**: [namecheap.com](https://namecheap.com)

## 🎯 Final URLs

After deployment, your BuffrSign platform will be available at:

- **Marketing Site**: https://buffr.ai
- **Web Application**: https://sign.buffr.ai
- **API Documentation**: https://api.sign.buffr.ai/docs
- **API Health**: https://api.sign.buffr.ai/health

---

**BuffrSign** - Empowering Namibia with legally compliant digital signatures 🇳🇦
