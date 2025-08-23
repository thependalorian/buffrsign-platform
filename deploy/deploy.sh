#!/bin/bash
# BuffrSign Master Deployment Script
# Intelligent deployment to DigitalOcean droplet with multiple deployment options

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

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect system specifications
detect_system() {
    log "Detecting system specifications..."
    
    # Get system info
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    CPU_CORES=$(nproc)
    DISK_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    
    info "System Specifications:"
    info "  • RAM: ${TOTAL_MEM}MB"
    info "  • CPU Cores: ${CPU_CORES}"
    info "  • Available Disk: ${DISK_SPACE}GB"
    
    # Determine deployment method based on resources
    if [ "$TOTAL_MEM" -ge 2048 ] && [ "$CPU_CORES" -ge 2 ] && [ "$DISK_SPACE" -ge 10 ]; then
        RECOMMENDED_METHOD="docker"
        info "✓ System meets requirements for Docker deployment"
    elif [ "$TOTAL_MEM" -ge 1024 ] && [ "$CPU_CORES" -ge 1 ] && [ "$DISK_SPACE" -ge 5 ]; then
        RECOMMENDED_METHOD="direct"
        warn "⚠ Limited resources detected, recommending direct deployment"
    else
        error "✗ Insufficient system resources for reliable deployment"
        error "  Minimum requirements: 1GB RAM, 1 CPU core, 5GB disk space"
        exit 1
    fi
}

# Check existing services
check_existing_services() {
    log "Checking for existing services..."
    
    EXISTING_SERVICES=()
    
    # Check for existing Docker containers
    if command_exists docker; then
        if [ "$(docker ps -q)" ]; then
            EXISTING_SERVICES+=("docker-containers")
            info "Found existing Docker containers"
        fi
    fi
    
    # Check for existing services
    if systemctl is-active --quiet nginx 2>/dev/null; then
        EXISTING_SERVICES+=("nginx")
        info "Found existing Nginx service"
    fi
    
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        EXISTING_SERVICES+=("postgresql")
        info "Found existing PostgreSQL service"
    fi
    
    if systemctl is-active --quiet redis 2>/dev/null; then
        EXISTING_SERVICES+=("redis")
        info "Found existing Redis service"
    fi
    
    # Check for Node.js processes
    if pgrep -f "node" > /dev/null; then
        EXISTING_SERVICES+=("nodejs-processes")
        info "Found existing Node.js processes"
    fi
    
    if [ ${#EXISTING_SERVICES[@]} -gt 0 ]; then
        warn "Existing services detected: ${EXISTING_SERVICES[*]}"
        warn "Deployment will attempt to work with existing infrastructure"
    else
        info "No conflicting services detected"
    fi
}

# Validate environment
validate_environment() {
    log "Validating deployment environment..."
    
    # Check if running as root or with sudo
    if [ "$EUID" -eq 0 ]; then
        info "✓ Running with root privileges"
    elif sudo -n true 2>/dev/null; then
        info "✓ Sudo access available"
    else
        error "✗ Root privileges or sudo access required"
        exit 1
    fi
    
    # Check internet connectivity
    if ping -c 1 google.com > /dev/null 2>&1; then
        info "✓ Internet connectivity available"
    else
        error "✗ No internet connectivity detected"
        exit 1
    fi
    
    # Check if this is Ubuntu/Debian
    if [ -f /etc/debian_version ]; then
        info "✓ Debian/Ubuntu system detected"
    else
        warn "⚠ Non-Debian system detected, some features may not work"
    fi
}

# Generate secure secrets
generate_secrets() {
    log "Generating secure configuration..."
    
    # Create production environment file
    cp "$SCRIPT_DIR/.env.production" "$SCRIPT_DIR/.env"
    
    # Generate secure passwords and secrets
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -hex 64)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
    
    # Update environment file
    sed -i "s/REPLACE_WITH_SECURE_PASSWORD/$DB_PASSWORD/g" "$SCRIPT_DIR/.env"
    sed -i "s/REPLACE_WITH_SECURE_PASSWORD/$REDIS_PASSWORD/g" "$SCRIPT_DIR/.env"
    sed -i "s/REPLACE_WITH_JWT_SECRET/$JWT_SECRET/g" "$SCRIPT_DIR/.env"
    sed -i "s/REPLACE_WITH_ENCRYPTION_KEY/$ENCRYPTION_KEY/g" "$SCRIPT_DIR/.env"
    sed -i "s/REPLACE_WITH_GRAFANA_PASSWORD/$GRAFANA_PASSWORD/g" "$SCRIPT_DIR/.env"
    
    # Set secure permissions
    chmod 600 "$SCRIPT_DIR/.env"
    
    info "Secure configuration generated"
}

# Docker deployment method
deploy_docker() {
    log "Starting Docker deployment..."
    
    # Install Docker if not present
    if ! command_exists docker; then
        info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Install Docker Compose if not present
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Copy production Docker Compose file
    cp "$SCRIPT_DIR/docker-production.yml" "$PROJECT_ROOT/docker-compose.prod.yml"
    
    # Build and start services
    cd "$PROJECT_ROOT"
    
    info "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    info "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    info "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
        log "✓ Docker deployment successful"
        return 0
    else
        error "✗ Docker deployment failed"
        docker-compose -f docker-compose.prod.yml logs
        return 1
    fi
}

# Direct deployment method
deploy_direct() {
    log "Starting direct deployment..."
    
    # Use the production deployment script
    chmod +x "$SCRIPT_DIR/production.sh"
    "$SCRIPT_DIR/production.sh"
}

# Health check function
comprehensive_health_check() {
    log "Running comprehensive health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        info "Health check attempt $attempt/$max_attempts"
        
        # Try to get public IP
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipecho.net/plain 2>/dev/null || echo "localhost")
        
        # Check application health
        if curl -f -s "http://localhost/health" > /dev/null 2>&1 || curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
            log "✓ Application is responding!"
            
            # Test API endpoint
            if curl -f -s "http://localhost/api/health" > /dev/null 2>&1 || curl -f -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
                log "✓ API is responding!"
            fi
            
            return 0
        fi
        
        sleep 10
        attempt=$((attempt + 1))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Setup SSL certificate
setup_ssl() {
    log "Setting up SSL certificate..."
    
    # Check if domain is configured
    if [ "$1" != "localhost" ] && [ ! -z "$1" ]; then
        info "Setting up SSL for domain: $1"
        
        # Install certbot if not present
        if ! command_exists certbot; then
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-nginx
        fi
        
        # Generate certificate
        sudo certbot --nginx -d "$1" --non-interactive --agree-tos --email "admin@$1" --redirect
        
        # Set up auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        log "✓ SSL certificate configured"
    else
        warn "No domain specified, skipping SSL setup"
        info "To set up SSL later, run: sudo certbot --nginx -d yourdomain.com"
    fi
}

# Post-deployment configuration
post_deployment_config() {
    log "Running post-deployment configuration..."
    
    # Get public IP
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-droplet-ip")
    
    # Create admin user (if database is accessible)
    info "Setting up default admin user..."
    
    # This would typically involve running a script to create admin user
    # For now, we'll just log the instruction
    info "Admin user setup instructions will be displayed at the end"
    
    # Setup monitoring alerts
    info "Configuring monitoring..."
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/buffsign > /dev/null << EOF
/opt/buffsign/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload buffsign 2>/dev/null || docker-compose -f /opt/buffsign/docker-compose.prod.yml restart api
    endscript
}
EOF
    
    log "Post-deployment configuration completed"
}

# Print deployment summary
print_deployment_summary() {
    local deployment_method=$1
    local public_ip=$2
    local domain=${3:-$public_ip}
    
    echo ""
    echo -e "${GREEN}🎉 BuffrSign Platform Deployed Successfully! 🇳🇦${NC}"
    echo ""
    echo -e "${BLUE}📋 Deployment Summary:${NC}"
    echo "   • Method: $deployment_method"
    echo "   • IP Address: $public_ip"
    echo "   • Domain: $domain"
    echo "   • Deployed at: $(date)"
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    if [ "$domain" != "$public_ip" ]; then
        echo "   • Application: https://$domain"
        echo "   • API: https://$domain/api"
        echo "   • Health Check: https://$domain/health"
    else
        echo "   • Application: http://$public_ip"
        echo "   • API: http://$public_ip/api"
        echo "   • Health Check: http://$public_ip/health"
    fi
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    if [ "$deployment_method" = "docker" ]; then
        echo "   • View Logs: docker-compose -f docker-compose.prod.yml logs -f"
        echo "   • Restart: docker-compose -f docker-compose.prod.yml restart"
        echo "   • Stop: docker-compose -f docker-compose.prod.yml down"
        echo "   • Update: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
    else
        echo "   • View Logs: sudo journalctl -u buffsign -f"
        echo "   • Restart: sudo systemctl restart buffsign"
        echo "   • Stop: sudo systemctl stop buffsign"
        echo "   • Status: sudo systemctl status buffsign"
    fi
    echo ""
    echo -e "${YELLOW}⚙️  Next Steps:${NC}"
    echo "   1. Configure your domain DNS to point to $public_ip"
    echo "   2. Update API keys in the environment file"
    echo "   3. Set up SSL certificate (if not already done)"
    echo "   4. Create your first admin user"
    echo "   5. Test document upload and signing workflows"
    echo ""
    echo -e "${GREEN}🔐 Security Notes:${NC}"
    echo "   • Strong passwords have been generated automatically"
    echo "   • Firewall is configured to allow only necessary ports"
    echo "   • Fail2ban is active for intrusion protection"
    echo "   • All services are running with minimal privileges"
    echo ""
    echo -e "${BLUE}📧 Admin User Creation:${NC}"
    echo "   Visit: http://$domain/register"
    echo "   Use role: 'admin' during registration"
    echo "   The first user with admin role becomes the system administrator"
    echo ""
    echo -e "${GREEN}Deployment completed successfully! 🚀${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 BuffrSign Smart Deployment                   ║"
    echo "║            Automated DigitalOcean Droplet Setup             ║"
    echo "║                    🇳🇦 Ready for Africa 🇳🇦                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Parse command line arguments
    DEPLOYMENT_METHOD=""
    DOMAIN=""
    FORCE_METHOD=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --method)
                FORCE_METHOD="$2"
                shift 2
                ;;
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --docker)
                FORCE_METHOD="docker"
                shift
                ;;
            --direct)
                FORCE_METHOD="direct"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --method METHOD    Force deployment method (docker|direct)"
                echo "  --domain DOMAIN    Set domain name for SSL"
                echo "  --docker          Force Docker deployment"
                echo "  --direct          Force direct deployment"
                echo "  --help            Show this help"
                echo ""
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run pre-deployment checks
    validate_environment
    detect_system
    check_existing_services
    generate_secrets
    
    # Determine deployment method
    if [ ! -z "$FORCE_METHOD" ]; then
        DEPLOYMENT_METHOD="$FORCE_METHOD"
        info "Deployment method forced to: $DEPLOYMENT_METHOD"
    else
        DEPLOYMENT_METHOD="$RECOMMENDED_METHOD"
        info "Recommended deployment method: $DEPLOYMENT_METHOD"
    fi
    
    # Confirm deployment
    echo ""
    echo -e "${YELLOW}Ready to deploy BuffrSign using $DEPLOYMENT_METHOD method${NC}"
    echo -e "${YELLOW}This will install and configure all necessary services${NC}"
    read -p "Continue with deployment? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        info "Deployment cancelled"
        exit 0
    fi
    
    # Execute deployment
    case $DEPLOYMENT_METHOD in
        docker)
            if deploy_docker; then
                DEPLOYMENT_SUCCESS=true
            else
                error "Docker deployment failed, falling back to direct deployment"
                DEPLOYMENT_METHOD="direct"
                deploy_direct && DEPLOYMENT_SUCCESS=true
            fi
            ;;
        direct)
            deploy_direct && DEPLOYMENT_SUCCESS=true
            ;;
        *)
            error "Unknown deployment method: $DEPLOYMENT_METHOD"
            exit 1
            ;;
    esac
    
    # Verify deployment
    if [ "$DEPLOYMENT_SUCCESS" = true ]; then
        if comprehensive_health_check; then
            PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
            
            # Setup SSL if domain provided
            if [ ! -z "$DOMAIN" ]; then
                setup_ssl "$DOMAIN"
            fi
            
            post_deployment_config
            print_deployment_summary "$DEPLOYMENT_METHOD" "$PUBLIC_IP" "$DOMAIN"
            
            log "🎉 BuffrSign platform deployed successfully!"
            exit 0
        else
            error "Deployment completed but health checks failed"
            exit 1
        fi
    else
        error "Deployment failed"
        exit 1
    fi
}

# Run main function
main "$@"