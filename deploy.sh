#!/bin/bash

# BuffrSign Platform Deployment Script
# Deploys to Vercel (Frontend) and Railway (Backend)

set -e

echo "🚀 BuffrSign Platform Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking deployment dependencies..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Please install with: npm i -g vercel"
        exit 1
    fi
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Please install with: npm i -g @railway/cli"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    if [ -f "scripts/security_audit.py" ]; then
        python scripts/security_audit.py
        if [ $? -eq 0 ]; then
            print_success "Security audit passed"
        else
            print_error "Security audit failed"
            exit 1
        fi
    else
        print_warning "Security audit script not found, skipping..."
    fi
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd apps/api
    
    # Check if Railway project is linked
    if [ ! -f ".railway" ]; then
        print_status "Linking Railway project..."
        railway link
    fi
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up --detach
    
    # Get the deployment URL
    RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$RAILWAY_URL" ]; then
        print_success "Backend deployed to: $RAILWAY_URL"
        echo "RAILWAY_URL=$RAILWAY_URL" > .env.railway
    else
        print_error "Failed to get Railway deployment URL"
        exit 1
    fi
    
    cd ../..
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd apps/web
    
    # Check if Vercel project is linked
    if [ ! -f ".vercel" ]; then
        print_status "Linking Vercel project..."
        vercel link --yes
    fi
    
    # Set environment variables
    if [ -f "../../.env.railway" ]; then
        source ../../.env.railway
        vercel env add NEXT_PUBLIC_API_URL production "$RAILWAY_URL"
    fi
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod --yes
    
    # Get the deployment URL
    VERCEL_URL=$(vercel ls --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$VERCEL_URL" ]; then
        print_success "Frontend deployed to: $VERCEL_URL"
        echo "VERCEL_URL=$VERCEL_URL" > .env.vercel
    else
        print_error "Failed to get Vercel deployment URL"
        exit 1
    fi
    
    cd ../..
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    cd apps/api
    if [ -f "test_jwt.py" ]; then
        print_status "Running JWT tests..."
        python test_jwt.py
    fi
    cd ../..
    
    # Frontend tests
    cd apps/web
    if [ -f "package.json" ] && grep -q "test" package.json; then
        print_status "Running frontend tests..."
        npm test --if-present
    fi
    cd ../..
    
    print_success "Tests completed"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for deployments to be ready
    sleep 30
    
    # Check backend health
    if [ -f "apps/api/.env.railway" ]; then
        source apps/api/.env.railway
        print_status "Checking backend health at: $RAILWAY_URL/health"
        
        if curl -f "$RAILWAY_URL/health" > /dev/null 2>&1; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed"
        fi
    fi
    
    # Check frontend
    if [ -f "apps/web/.env.vercel" ]; then
        source apps/web/.env.vercel
        print_status "Checking frontend at: $VERCEL_URL"
        
        if curl -f "$VERCEL_URL" > /dev/null 2>&1; then
            print_success "Frontend health check passed"
        else
            print_warning "Frontend health check failed"
        fi
    fi
}

# Main deployment function
main() {
    print_status "Starting BuffrSign platform deployment..."
    
    # Check dependencies
    check_dependencies
    
    # Run security audit
    run_security_audit
    
    # Run tests
    run_tests
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Health check
    health_check
    
    print_success "🎉 BuffrSign platform deployment completed!"
    print_status "Frontend: $VERCEL_URL"
    print_status "Backend: $RAILWAY_URL"
    print_status "API Docs: $RAILWAY_URL/docs"
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure environment variables in Railway and Vercel"
    echo "2. Set up custom domains"
    echo "3. Configure SSL certificates"
    echo "4. Set up monitoring and alerting"
    echo "5. Test all functionality"
}

# Run main function
main "$@"
