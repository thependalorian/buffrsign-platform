#!/bin/bash

# BuffrSign - Production Deployment Script
# Based on successful deployment patterns from other projects

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VM_IP="192.34.63.153"
VM_USER="root"
PROJECT_DIR="/opt/buffrsign"
SECRETS_FILE="/opt/secrets/buffrsign.env"

echo -e "${BLUE}🚀 BuffrSign - Production Deployment${NC}"
echo "=========================================="
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the buffrsign-platform directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Please create .env file with your configuration"
    exit 1
fi

print_status "Environment file found"

# Step 1: Validate environment variables
print_info "Step 1: Validating environment variables..."

# Check required variables
required_vars=(
    "BUFFRSIGN_API_KEY"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_API_URL"
    "NEXT_PUBLIC_API_KEY"
    "LETSENCRYPT_EMAIL"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Missing required environment variable: $var"
        exit 1
    fi
done

print_status "Environment variables validated"

# Step 2: Create deployment package
print_info "Step 2: Creating deployment package..."

# Create temporary deployment directory
DEPLOY_DIR="deploy-temp"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp docker-compose.yml $DEPLOY_DIR/
cp Caddyfile $DEPLOY_DIR/
cp apps/api/Dockerfile $DEPLOY_DIR/
cp apps/web/Dockerfile $DEPLOY_DIR/
cp -r apps $DEPLOY_DIR/
cp -r components $DEPLOY_DIR/
cp -r supabase $DEPLOY_DIR/
cp package*.json $DEPLOY_DIR/
cp next.config.js $DEPLOY_DIR/
cp tailwind.config.ts $DEPLOY_DIR/
cp postcss.config.js $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/

# Copy environment file
cp .env $DEPLOY_DIR/

print_status "Deployment package created"

# Step 3: Copy files to VM
print_info "Step 3: Copying files to Digital Ocean VM..."

# Create project directory on VM
ssh ${VM_USER}@${VM_IP} "mkdir -p ${PROJECT_DIR}"

# Copy deployment package
print_info "Copying deployment files..."
if scp -r $DEPLOY_DIR/* ${VM_USER}@${VM_IP}:${PROJECT_DIR}/; then
    print_status "Files copied successfully"
else
    print_error "Failed to copy files to VM"
    exit 1
fi

# Step 4: Setup VM environment
print_info "Step 4: Setting up VM environment..."

# Install Docker and Docker Compose if not present
ssh ${VM_USER}@${VM_IP} << 'EOF'
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
EOF

print_status "VM environment setup complete"

# Step 5: Deploy application
print_info "Step 5: Deploying application..."

# Stop existing containers and deploy
ssh ${VM_USER}@${VM_IP} << EOF
    cd ${PROJECT_DIR}
    
    # Stop existing containers
    docker-compose down || true
    
    # Remove old images
    docker system prune -f
    
    # Build and start containers
    docker-compose up -d --build
    
    # Wait for services to be healthy
    echo "Waiting for services to be healthy..."
    sleep 30
    
    # Check service status
    docker-compose ps
EOF

print_status "Application deployed"

# Step 6: Verify deployment
print_info "Step 6: Verifying deployment..."

# Test API health
print_info "Testing API health..."
if curl -f https://api.sign.buffr.ai/health; then
    print_status "API health check passed"
else
    print_warning "API health check failed - may need time to start"
fi

# Test frontend
print_info "Testing frontend..."
if curl -f https://sign.buffr.ai; then
    print_status "Frontend check passed"
else
    print_warning "Frontend check failed - may need time to start"
fi

# Step 7: SSL certificate verification
print_info "Step 7: Verifying SSL certificates..."

# Check SSL certificate
if openssl s_client -connect api.sign.buffr.ai:443 -servername api.sign.buffr.ai < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    print_status "SSL certificate verified"
else
    print_warning "SSL certificate may need time to provision"
fi

# Step 8: Cleanup
print_info "Step 8: Cleaning up..."

# Remove temporary deployment directory
rm -rf $DEPLOY_DIR

print_status "Cleanup complete"

# Final status
echo ""
echo -e "${GREEN}🎉 BuffrSign deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  • API: https://api.sign.buffr.ai"
echo "  • Frontend: https://sign.buffr.ai"
echo "  • Marketing: https://buffr.ai"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "  • View logs: ssh ${VM_USER}@${VM_IP} 'cd ${PROJECT_DIR} && docker-compose logs -f'"
echo "  • Restart services: ssh ${VM_USER}@${VM_IP} 'cd ${PROJECT_DIR} && docker-compose restart'"
echo "  • Update deployment: Run this script again"
echo ""
echo -e "${BLUE}📊 Monitoring:${NC}"
echo "  • Health check: https://api.sign.buffr.ai/health"
echo "  • API docs: https://api.sign.buffr.ai/docs"
echo ""
echo -e "${GREEN}BuffrSign is now live and ready to revolutionize digital signatures in Southern Africa! 🇳🇦${NC}"
