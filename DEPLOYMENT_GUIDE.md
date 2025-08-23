# 🚀 BuffrSign Production Deployment Guide

## Deploy to DigitalOcean Droplet - Fail-Safe Setup

This guide provides multiple deployment options for the BuffrSign platform with automatic health checks, rollback capabilities, and production-ready configurations.

## 📋 Prerequisites

### System Requirements
- **Minimum**: 1GB RAM, 1 CPU core, 5GB disk space
- **Recommended**: 2GB+ RAM, 2+ CPU cores, 10GB+ disk space
- **OS**: Ubuntu 20.04+ or Debian 10+ (auto-detected)
- **Access**: Root or sudo privileges required

### DigitalOcean Droplet Setup
1. Create a droplet with Ubuntu 20.04 LTS
2. Choose appropriate size based on requirements
3. Add SSH key for secure access
4. Enable monitoring and backups (recommended)

## 🎯 Quick Deployment

### Option 1: Smart Auto-Detection (Recommended)
```bash
# Clone the repository to your droplet
git clone <your-repo-url> buffsign
cd buffsign

# Run smart deployment (auto-detects best method)
./deploy/deploy.sh
```

### Option 2: Force Docker Deployment
```bash
# For systems with 2GB+ RAM - containerized deployment
./deploy/deploy.sh --docker
```

### Option 3: Force Direct Deployment
```bash
# For limited resources - direct system installation
./deploy/deploy.sh --direct
```

### Option 4: With Custom Domain
```bash
# Deploy with automatic SSL setup
./deploy/deploy.sh --domain yourdomain.com
```

## 🔧 Deployment Methods

### Method 1: Docker Deployment
**Best for**: Production environments, easy management, scaling

**Features**:
- Complete containerization with Docker Compose
- Built-in monitoring (Prometheus + Grafana)
- Automatic health checks and restarts
- Easy backup and restore
- SSL certificate automation

**Requirements**: 2GB+ RAM, Docker support

### Method 2: Direct Deployment
**Best for**: Limited resources, maximum performance

**Features**:
- Direct system installation with systemd services
- PM2 process management
- Nginx reverse proxy
- PostgreSQL and Redis on host system
- Lower memory footprint

**Requirements**: 1GB+ RAM, sudo access

## 📊 System Detection & Auto-Configuration

The deployment script automatically:

1. **Detects System Resources**
   - RAM, CPU cores, disk space
   - Existing services and ports
   - Network connectivity

2. **Chooses Optimal Method**
   - Docker for high-resource systems
   - Direct for limited resources
   - Fallback mechanisms

3. **Security Hardening**
   - UFW firewall configuration
   - Fail2ban intrusion protection
   - Secure password generation
   - SSL certificate setup

## 🛡️ Security Features

### Automatic Security Configuration
- **Firewall**: Only essential ports open (22, 80, 443)
- **Fail2ban**: Automatic IP blocking for failed attempts
- **Strong Passwords**: Auto-generated 32-character passwords
- **Encryption**: All data encrypted at rest and in transit
- **Rate Limiting**: API and authentication endpoints protected

### Compliance Ready
- **ETA 2019**: Full Namibian compliance implementation
- **SADC Model Law**: Regional legal framework support
- **Audit Trails**: Comprehensive logging and monitoring
- **Data Protection**: GDPR-style privacy controls

## 🔄 Health Checks & Monitoring

### Automatic Health Monitoring
- **Application Health**: HTTP endpoint monitoring
- **Database Health**: PostgreSQL connection checks
- **Cache Health**: Redis connectivity verification
- **Service Health**: All system services monitored

### Monitoring Stack (Docker Deployment)
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Beautiful dashboards and visualization
- **Loki**: Centralized log aggregation
- **AlertManager**: Automated incident response

### Health Check Endpoints
```bash
# Basic health check
curl http://your-droplet-ip/health

# Detailed API health
curl http://your-droplet-ip/api/health

# Service status
systemctl status buffsign  # Direct deployment
docker-compose ps          # Docker deployment
```

## 📝 Environment Configuration

### Required API Keys
After deployment, update these in your environment file:

```bash
# Edit environment configuration
sudo nano /opt/buffsign/.env  # Direct deployment
nano deploy/.env              # Docker deployment
```

**Essential Configuration**:
```env
# AI Features (Required for document intelligence)
OPENAI_API_KEY=your_openai_api_key_here

# Email Notifications (Required for user workflows)
EMAIL_API_KEY=your_sendgrid_api_key_here

# SMS Notifications (Optional but recommended)
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# Domain Configuration
APP_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api
```

### Optional Integrations
```env
# Cloud Storage (Recommended for production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
STORAGE_BUCKET=buffsign-documents-prod

# Monitoring & Analytics
SENTRY_DSN=your_sentry_dsn_here
DATADOG_API_KEY=your_datadog_api_key_here
```

## 🌐 SSL Certificate Setup

### Automatic SSL (During Deployment)
```bash
# Deploy with automatic SSL certificate
./deploy/deploy.sh --domain yourdomain.com
```

### Manual SSL (After Deployment)
```bash
# Install Certbot and get certificate
sudo certbot --nginx -d yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## 👥 Initial Setup

### 1. Create Admin User
1. Visit: `https://yourdomain.com/register`
2. Use role: `admin` during registration
3. The first admin user becomes system administrator

### 2. Configure Organization Settings
1. Login to admin panel
2. Configure organization details
3. Set up compliance settings for Namibia/SADC
4. Configure email templates and branding

### 3. Test Core Features
1. Upload a test document
2. Create a signing workflow
3. Test AI analysis features
4. Verify compliance reporting

## 🔧 Management Commands

### Docker Deployment Management
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Update to latest version
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Direct Deployment Management
```bash
# View application logs
sudo journalctl -u buffsign -f

# Restart BuffrSign
sudo systemctl restart buffsign

# Check service status
sudo systemctl status buffsign

# View PM2 processes
pm2 status

# Restart with PM2
pm2 restart buffsign-api
```

## 🗄️ Backup & Recovery

### Automatic Backups (Docker)
```bash
# Database backup (runs daily at 2 AM)
docker exec buffsign-backup-prod /backup.sh

# Manual backup
docker exec buffsign-postgres-prod pg_dump -U buffsign buffsign_prod > backup.sql
```

### Manual Backups (Direct)
```bash
# Database backup
sudo -u postgres pg_dump buffsign_prod > /opt/buffsign-backup/$(date +%Y%m%d_%H%M%S).sql

# Full application backup
sudo tar -czf /opt/buffsign-backup/app-$(date +%Y%m%d_%H%M%S).tar.gz /opt/buffsign
```

### Recovery Process
```bash
# Restore database from backup
sudo -u postgres psql buffsign_prod < backup.sql

# Restore application files
sudo tar -xzf app-backup.tar.gz -C /
sudo systemctl restart buffsign
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check deployment logs
tail -f /var/log/buffsign-deploy.log

# Manual rollback (if backup exists)
sudo systemctl stop buffsign
sudo cp -r /opt/buffsign-backup_TIMESTAMP /opt/buffsign
sudo systemctl start buffsign
```

#### 2. Health Checks Fail
```bash
# Check service status
sudo systemctl status buffsign nginx postgresql redis

# Check application logs
sudo journalctl -u buffsign -n 50

# Test database connection
sudo -u postgres psql buffsign_prod -c "SELECT version();"
```

#### 3. SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Test SSL configuration
curl -I https://yourdomain.com
```

#### 4. Performance Issues
```bash
# Check system resources
htop
df -h
free -m

# Check application metrics
curl http://localhost:3000/metrics

# Restart services if needed
sudo systemctl restart buffsign
```

### Log Locations
- **Application Logs**: `/opt/buffsign/logs/`
- **System Logs**: `journalctl -u buffsign`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`
- **Deployment Logs**: `/var/log/buffsign-deploy.log`

## 📈 Scaling & Performance

### Vertical Scaling (Upgrade Droplet)
1. Create snapshot of current droplet
2. Resize droplet in DigitalOcean panel
3. Restart services to utilize new resources

### Horizontal Scaling (Load Balancer)
1. Create multiple droplet instances
2. Set up DigitalOcean Load Balancer
3. Configure shared database instance
4. Implement Redis cluster for sessions

### Performance Optimization
```bash
# Enable PM2 cluster mode (Direct deployment)
pm2 start ecosystem.config.js --env production

# Optimize PostgreSQL settings
sudo nano /etc/postgresql/13/main/postgresql.conf

# Enable Nginx caching
sudo nano /etc/nginx/sites-available/buffsign
```

## 🌍 Multi-Region Deployment

### SADC Region Setup
1. Deploy in multiple SADC countries
2. Configure region-specific compliance settings
3. Set up data residency rules
4. Implement cross-border recognition

### Disaster Recovery
1. Set up secondary region deployment
2. Configure database replication
3. Implement automated failover
4. Test recovery procedures regularly

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Droplet created with sufficient resources
- [ ] SSH access configured
- [ ] Domain DNS pointing to droplet IP
- [ ] Required API keys obtained

### Deployment
- [ ] Repository cloned to droplet
- [ ] Deployment script executed successfully
- [ ] Health checks passing
- [ ] SSL certificate configured

### Post-Deployment
- [ ] Admin user created
- [ ] API keys configured
- [ ] Test document uploaded and signed
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

### Production Ready
- [ ] Domain configured with SSL
- [ ] Email/SMS providers configured
- [ ] Cloud storage integrated
- [ ] Monitoring dashboards set up
- [ ] Compliance settings verified

---

## 🎉 Success! Your BuffrSign Platform is Now Live

After successful deployment, your AI-powered digital signature platform is ready to serve the Namibian and SADC markets with:

- ✅ **ETA 2019 Compliance**: Full legal framework implementation
- ✅ **AI Document Intelligence**: Advanced analysis and optimization
- ✅ **Enterprise Security**: Bank-grade protection and encryption
- ✅ **Mobile-First Design**: Perfect for African mobile usage patterns
- ✅ **Real-Time Collaboration**: Live document workflows
- ✅ **Comprehensive Monitoring**: Full observability and health checks

**Welcome to the future of digital signatures in Africa! 🇳🇦**

---

### Support & Documentation
- **Technical Issues**: Check troubleshooting section above
- **Feature Questions**: Refer to main README.md
- **Business Inquiries**: Contact your implementation team
- **Security Concerns**: Review security configuration guide

**Deployment completed successfully - BuffrSign is ready for business! 🚀**
