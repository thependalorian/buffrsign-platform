#!/bin/bash
# BuffrSign Production Deployment Script
# Fail-safe deployment to DigitalOcean droplet with health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_USER="root"
APP_NAME="buffsign"
APP_DIR="/opt/buffsign"
BACKUP_DIR="/opt/buffsign-backup"
NGINX_CONF="/etc/nginx/sites-available/buffsign"
SYSTEMD_SERVICE="/etc/systemd/system/buffsign.service"
LOG_FILE="/var/log/buffsign-deploy.log"

# Deployment settings
NODE_VERSION="18"
PM2_INSTANCES="max"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ENABLED=true

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    echo "[ERROR] $1" >> "$LOG_FILE" 2>/dev/null || true
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$LOG_FILE" 2>/dev/null || true
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[INFO] $1" >> "$LOG_FILE" 2>/dev/null || true
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create backup of current deployment
create_backup() {
    log "Creating backup of current deployment..."
    
    if [ -d "$APP_DIR" ]; then
        # Stop services gracefully
        sudo systemctl stop buffsign 2>/dev/null || true
        sudo pkill -f "node.*buffsign" 2>/dev/null || true
        
        # Create timestamped backup
        local backup_timestamp=$(date +%Y%m%d_%H%M%S)
        local backup_path="${BACKUP_DIR}_${backup_timestamp}"
        
        sudo mkdir -p "$(dirname "$backup_path")"
        sudo cp -r "$APP_DIR" "$backup_path"
        
        # Keep only last 5 backups
        sudo find "$(dirname "$BACKUP_DIR")" -name "buffsign-backup_*" -type d | sort -r | tail -n +6 | sudo xargs rm -rf
        
        echo "$backup_path" > /tmp/buffsign_backup_path
        info "Backup created at: $backup_path"
    else
        info "No existing deployment found, skipping backup"
    fi
}

# Install system dependencies
install_system_deps() {
    log "Installing system dependencies..."
    
    # Update system
    sudo apt-get update -y
    
    # Install essential packages
    sudo apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip \
        software-properties-common
    
    # Install Node.js if not present or wrong version
    if ! command_exists node || [ "$(node --version | cut -d'.' -f1 | tr -d 'v')" != "$NODE_VERSION" ]; then
        info "Installing Node.js $NODE_VERSION..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 globally
    if ! command_exists pm2; then
        info "Installing PM2..."
        sudo npm install -g pm2
        sudo pm2 startup systemd -u $USER --hp $HOME
    fi
    
    # Install PostgreSQL if not present
    if ! command_exists psql; then
        info "Installing PostgreSQL..."
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # Install Redis if not present
    if ! command_exists redis-cli; then
        info "Installing Redis..."
        sudo apt-get install -y redis-server
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    fi
    
    info "System dependencies installed successfully"
}

# Setup application directory
setup_app_directory() {
    log "Setting up application directory..."
    
    # Create application directory
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    
    # Copy application files
    cp -r "$PROJECT_ROOT"/* "$APP_DIR/"
    
    # Set proper permissions
    sudo chown -R www-data:www-data "$APP_DIR"
    sudo chmod -R 755 "$APP_DIR"
    
    # Create necessary directories
    sudo mkdir -p "$APP_DIR/uploads" "$APP_DIR/logs" "$APP_DIR/temp"
    sudo chown -R www-data:www-data "$APP_DIR/uploads" "$APP_DIR/logs" "$APP_DIR/temp"
    
    info "Application directory setup complete"
}

# Install application dependencies
install_app_deps() {
    log "Installing application dependencies..."
    
    cd "$APP_DIR"
    
    # Install backend dependencies
    info "Installing backend dependencies..."
    npm ci --production --silent
    
    # Install frontend dependencies and build
    if [ -d "frontend" ]; then
        info "Installing frontend dependencies..."
        cd frontend
        npm ci --silent
        
        info "Building frontend..."
        npm run build
        
        # Move built frontend to public directory
        cd ..
        sudo mkdir -p public
        sudo cp -r frontend/dist/* public/
        sudo chown -R www-data:www-data public/
    fi
    
    # Build backend
    info "Building backend..."
    npm run build
    
    info "Application dependencies installed successfully"
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Generate random password for database
    local db_password=$(openssl rand -base64 32)
    
    # Create database user and database
    sudo -u postgres psql << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'buffsign') THEN
        CREATE USER buffsign WITH PASSWORD '$db_password';
    END IF;
END
\$\$;

DROP DATABASE IF EXISTS buffsign_prod;
CREATE DATABASE buffsign_prod OWNER buffsign;
GRANT ALL PRIVILEGES ON DATABASE buffsign_prod TO buffsign;
EOF
    
    # Run database schema
    if [ -f "$APP_DIR/src/database/schema.sql" ]; then
        info "Running database schema..."
        sudo -u postgres psql -d buffsign_prod -f "$APP_DIR/src/database/schema.sql"
    fi
    
    # Store database connection string
    echo "postgresql://buffsign:$db_password@localhost:5432/buffsign_prod" > /tmp/buffsign_db_url
    
    info "Database setup complete"
}

# Generate production environment file
generate_env_file() {
    log "Generating production environment file..."
    
    local db_url=$(cat /tmp/buffsign_db_url)
    local jwt_secret=$(openssl rand -hex 64)
    local encryption_key=$(openssl rand -hex 32)
    
    cat > "$APP_DIR/.env" << EOF
# BuffrSign Production Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=$db_url
DB_MAX_CONNECTIONS=20

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=$encryption_key

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000

# Storage (Local for now, configure AWS S3 later)
STORAGE_PROVIDER=local
UPLOADS_DIR=$APP_DIR/uploads

# AI Configuration (Configure with your API keys)
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4-turbo-preview

# Email Configuration (Configure with your provider)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@buffsign.com

# SMS Configuration (Configure with Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM=+1234567890

# Compliance
ETA_2019_ENABLED=true
SADC_ENABLED=true
SADC_COUNTRIES=NA,ZA,BW,ZM,ZW

# Application URLs (Update with your domain)
APP_URL=https://buffsign.com
API_URL=https://buffsign.com/api

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_WORKFLOW_OPTIMIZATION=true
ENABLE_MULTI_LANGUAGE=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_API_DOCS=true
EOF
    
    # Set secure permissions
    sudo chown www-data:www-data "$APP_DIR/.env"
    sudo chmod 600 "$APP_DIR/.env"
    
    info "Environment file generated"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee "$NGINX_CONF" > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Serve static files
    location / {
        root /opt/buffsign/public;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
    
    # Auth endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File upload size
    client_max_body_size 50M;
    
    # Hide server version
    server_tokens off;
}
EOF
    
    # Enable site
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    sudo nginx -t
    
    info "Nginx configured successfully"
}

# Setup PM2 ecosystem
setup_pm2() {
    log "Setting up PM2 ecosystem..."
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'buffsign-api',
    script: 'dist/server.js',
    cwd: '$APP_DIR',
    instances: '$PM2_INSTANCES',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$APP_DIR/logs/pm2-error.log',
    out_file: '$APP_DIR/logs/pm2-out.log',
    log_file: '$APP_DIR/logs/pm2-combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    source_map_support: true,
    instance_var: 'INSTANCE_ID'
  }]
};
EOF
    
    info "PM2 ecosystem configured"
}

# Setup systemd service
setup_systemd() {
    log "Setting up systemd service..."
    
    sudo tee "$SYSTEMD_SERVICE" > /dev/null << EOF
[Unit]
Description=BuffrSign Digital Signature Platform
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/local/bin/pm2 start $APP_DIR/ecosystem.config.js --env production
ExecReload=/usr/local/bin/pm2 reload $APP_DIR/ecosystem.config.js --env production
ExecStop=/usr/local/bin/pm2 stop $APP_DIR/ecosystem.config.js
PIDFile=/home/www-data/.pm2/pm2.pid
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable buffsign
    
    info "Systemd service configured"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    # Reset UFW to defaults
    sudo ufw --force reset
    
    # Set default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (be careful not to lock yourself out)
    sudo ufw allow ssh
    sudo ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow from localhost (for internal services)
    sudo ufw allow from 127.0.0.1
    
    # Enable firewall
    sudo ufw --force enable
    
    info "Firewall configured"
}

# Setup fail2ban
setup_fail2ban() {
    log "Setting up fail2ban..."
    
    # Create custom jail for BuffrSign
    sudo tee /etc/fail2ban/jail.d/buffsign.conf > /dev/null << EOF
[buffsign-auth]
enabled = true
port = http,https
filter = buffsign-auth
logpath = $APP_DIR/logs/pm2-combined.log
maxretry = 5
bantime = 3600
findtime = 600

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 600
EOF
    
    # Create filter for BuffrSign auth failures
    sudo tee /etc/fail2ban/filter.d/buffsign-auth.conf > /dev/null << 'EOF'
[Definition]
failregex = ^.*Failed login attempt.*IP: <HOST>.*$
            ^.*Invalid credentials.*IP: <HOST>.*$
            ^.*Authentication failed.*IP: <HOST>.*$
ignoreregex =
EOF
    
    # Restart fail2ban
    sudo systemctl restart fail2ban
    sudo systemctl enable fail2ban
    
    info "Fail2ban configured"
}

# Health check function
health_check() {
    local max_attempts=60
    local attempt=1
    
    log "Running health checks..."
    
    while [ $attempt -le $max_attempts ]; do
        info "Health check attempt $attempt/$max_attempts"
        
        # Check if application is responding
        if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
            log "✓ Application is healthy!"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    error "Deployment failed, initiating rollback..."
    
    if [ -f /tmp/buffsign_backup_path ]; then
        local backup_path=$(cat /tmp/buffsign_backup_path)
        
        if [ -d "$backup_path" ]; then
            log "Restoring from backup: $backup_path"
            
            # Stop current services
            sudo systemctl stop buffsign 2>/dev/null || true
            sudo pm2 stop all 2>/dev/null || true
            
            # Restore backup
            sudo rm -rf "$APP_DIR"
            sudo cp -r "$backup_path" "$APP_DIR"
            sudo chown -R www-data:www-data "$APP_DIR"
            
            # Start services
            sudo systemctl start buffsign
            
            # Wait and check health
            sleep 10
            if health_check; then
                log "Rollback successful"
                return 0
            else
                error "Rollback failed"
                return 1
            fi
        fi
    fi
    
    error "No backup available for rollback"
    return 1
}

# Start services
start_services() {
    log "Starting services..."
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Start and enable Redis
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    # Start Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Start BuffrSign application
    sudo systemctl start buffsign
    
    # Check service status
    if sudo systemctl is-active --quiet buffsign; then
        info "✓ BuffrSign service is running"
    else
        error "✗ BuffrSign service failed to start"
        sudo journalctl -u buffsign --no-pager -l
        return 1
    fi
    
    info "All services started successfully"
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Create log rotation
    sudo tee /etc/logrotate.d/buffsign > /dev/null << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload buffsign
    endscript
}
EOF
    
    # Set up monitoring cron job
    (crontab -l 2>/dev/null; echo "*/5 * * * * curl -f http://localhost:3000/health > /dev/null 2>&1 || systemctl restart buffsign") | crontab -
    
    # Clean up temporary files
    rm -f /tmp/buffsign_*
    
    info "Post-deployment tasks completed"
}

# Print deployment summary
print_summary() {
    log "Deployment completed successfully!"
    
    echo ""
    echo -e "${GREEN}🚀 BuffrSign Platform Deployed Successfully! 🇳🇦${NC}"
    echo ""
    echo -e "${BLUE}📱 Application:${NC} http://$(curl -s ifconfig.me)"
    echo -e "${BLUE}🔧 API:${NC} http://$(curl -s ifconfig.me)/api"
    echo -e "${BLUE}💊 Health Check:${NC} http://$(curl -s ifconfig.me)/health"
    echo ""
    echo -e "${BLUE}🗄️  Services Status:${NC}"
    echo "   • BuffrSign: $(sudo systemctl is-active buffsign)"
    echo "   • Nginx: $(sudo systemctl is-active nginx)"
    echo "   • PostgreSQL: $(sudo systemctl is-active postgresql)"
    echo "   • Redis: $(sudo systemctl is-active redis-server)"
    echo ""
    echo -e "${YELLOW}⚙️  Next Steps:${NC}"
    echo "   1. Configure domain name in Nginx"
    echo "   2. Set up SSL certificate with: sudo certbot --nginx"
    echo "   3. Update API keys in $APP_DIR/.env"
    echo "   4. Configure monitoring and alerting"
    echo ""
    echo -e "${GREEN}🔒 Security Features:${NC}"
    echo "   ✓ Firewall configured (UFW)"
    echo "   ✓ Fail2ban protection enabled"
    echo "   ✓ Rate limiting configured"
    echo "   ✓ Security headers enabled"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo "   • Logs: $APP_DIR/logs/"
    echo "   • PM2 Status: pm2 status"
    echo "   • Service Status: systemctl status buffsign"
    echo ""
    echo -e "${GREEN}Deployment completed at: $(date)${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 BuffrSign Production Deployment              ║"
    echo "║          Fail-Safe Deployment to DigitalOcean Droplet       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Trap errors for rollback
    if [ "$ROLLBACK_ENABLED" = true ]; then
        trap 'rollback' ERR
    fi
    
    # Deployment steps
    create_backup
    install_system_deps
    setup_app_directory
    install_app_deps
    setup_database
    generate_env_file
    configure_nginx
    setup_pm2
    setup_systemd
    configure_firewall
    setup_fail2ban
    start_services
    
    # Health check
    if ! health_check; then
        error "Health check failed"
        exit 1
    fi
    
    post_deployment
    print_summary
    
    log "🎉 BuffrSign deployment completed successfully!"
}

# Run deployment
main "$@"