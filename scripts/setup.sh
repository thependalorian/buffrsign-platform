#!/bin/bash
# BuffrSign Platform Setup Script
# Comprehensive setup for AI-powered digital signatures platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

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

# Generate secure random string
generate_secret() {
    openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 32
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    local requirements_met=true
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)
        if [ "$major_version" -ge 18 ]; then
            info "✓ Node.js $node_version (required: 18+)"
        else
            error "✗ Node.js $node_version is too old (required: 18+)"
            requirements_met=false
        fi
    else
        error "✗ Node.js not found (required: 18+)"
        requirements_met=false
    fi
    
    # Check npm
    if command_exists npm; then
        info "✓ npm $(npm --version)"
    else
        error "✗ npm not found"
        requirements_met=false
    fi
    
    # Check Docker
    if command_exists docker; then
        info "✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
    else
        warn "✗ Docker not found (optional, but recommended)"
    fi
    
    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        info "✓ Docker Compose available"
    else
        warn "✗ Docker Compose not found (optional, but recommended)"
    fi
    
    # Check PostgreSQL (if not using Docker)
    if command_exists psql; then
        info "✓ PostgreSQL client available"
    else
        warn "✗ PostgreSQL client not found (will use Docker)"
    fi
    
    # Check Redis (if not using Docker)
    if command_exists redis-cli; then
        info "✓ Redis client available"
    else
        warn "✗ Redis client not found (will use Docker)"
    fi
    
    if [ "$requirements_met" = false ]; then
        error "Some requirements are not met. Please install the required dependencies."
        exit 1
    fi
}

# Create environment file
create_env_file() {
    log "Creating environment configuration..."
    
    if [ -f "$ENV_FILE" ]; then
        warn "Environment file already exists. Creating backup..."
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    cat > "$ENV_FILE" << EOF
# BuffrSign Platform Environment Configuration
# Generated on $(date)

# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Database Configuration
DATABASE_URL=postgresql://buffsign:buffsign_password_change_me@localhost:5432/buffsign_dev
DB_MAX_CONNECTIONS=20

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Storage Configuration (AWS S3)
STORAGE_PROVIDER=aws
STORAGE_BUCKET=buffsign-documents-dev
STORAGE_REGION=af-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# AI Configuration (OpenAI)
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4-turbo-preview

# Security Configuration
JWT_SECRET=$(generate_secret)
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Email Configuration (SendGrid)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@buffsign.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM=+1234567890

# Compliance Configuration
ETA_2019_ENABLED=true
ETA_2019_STRICT_MODE=false
SADC_ENABLED=true
SADC_COUNTRIES=NA,ZA,BW,ZM,ZW

# Application URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:3000/api

# Monitoring and Logging
LOG_LEVEL=debug
SENTRY_DSN=
DATADOG_API_KEY=

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_WORKFLOW_OPTIMIZATION=true
ENABLE_MULTI_LANGUAGE=true
ENABLE_SMS_NOTIFICATIONS=true

# Development Tools
ENABLE_API_DOCS=true
ENABLE_PLAYGROUND=true
EOF
    
    info "Environment file created at $ENV_FILE"
    warn "Please update the configuration values with your actual credentials"
}

# Install dependencies
install_dependencies() {
    log "Installing project dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Install backend dependencies
    info "Installing backend dependencies..."
    npm install
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        info "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    info "Dependencies installed successfully"
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Check if we should use Docker
    if command_exists docker && [ "$USE_DOCKER" != "false" ]; then
        info "Starting PostgreSQL with Docker..."
        docker run -d \
            --name buffsign-postgres \
            -e POSTGRES_DB=buffsign_dev \
            -e POSTGRES_USER=buffsign \
            -e POSTGRES_PASSWORD=buffsign_password_change_me \
            -p 5432:5432 \
            postgres:15-alpine
        
        # Wait for database to be ready
        info "Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        info "Running database migrations..."
        docker exec buffsign-postgres psql -U buffsign -d buffsign_dev -f /docker-entrypoint-initdb.d/schema.sql || true
    else
        # Use local PostgreSQL
        if command_exists createdb; then
            info "Creating local database..."
            createdb buffsign_dev 2>/dev/null || true
            
            if [ -f "$PROJECT_ROOT/src/database/schema.sql" ]; then
                info "Running database schema..."
                psql -d buffsign_dev -f "$PROJECT_ROOT/src/database/schema.sql"
            fi
        else
            warn "PostgreSQL not found locally. Please set up database manually or use Docker."
        fi
    fi
}

# Setup Redis
setup_redis() {
    log "Setting up Redis cache..."
    
    if command_exists docker && [ "$USE_DOCKER" != "false" ]; then
        info "Starting Redis with Docker..."
        docker run -d \
            --name buffsign-redis \
            -p 6379:6379 \
            redis:7-alpine
    else
        if command_exists redis-server; then
            info "Redis server available locally"
        else
            warn "Redis not found locally. Please install Redis or use Docker."
        fi
    fi
}

# Setup MinIO (S3-compatible storage)
setup_storage() {
    log "Setting up document storage..."
    
    if command_exists docker && [ "$USE_DOCKER" != "false" ]; then
        info "Starting MinIO with Docker..."
        docker run -d \
            --name buffsign-minio \
            -p 9000:9000 \
            -p 9001:9001 \
            -e MINIO_ROOT_USER=buffsign \
            -e MINIO_ROOT_PASSWORD=buffsign_minio_password_change_me \
            minio/minio server /data --console-address ":9001"
        
        # Wait for MinIO to start
        sleep 5
        
        # Create bucket
        info "Creating storage bucket..."
        docker exec buffsign-minio mc alias set local http://localhost:9000 buffsign buffsign_minio_password_change_me || true
        docker exec buffsign-minio mc mb local/buffsign-documents || true
    else
        warn "Using local file storage. For production, configure AWS S3 or compatible storage."
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "$PROJECT_ROOT/uploads"
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/temp"
    mkdir -p "$PROJECT_ROOT/legal-kb"
    
    info "Directories created successfully"
}

# Setup legal knowledge base
setup_legal_kb() {
    log "Setting up legal knowledge base..."
    
    local kb_dir="$PROJECT_ROOT/legal-kb"
    
    # Create ETA 2019 knowledge base
    cat > "$kb_dir/eta_2019.txt" << 'EOF'
Electronic Transactions Act 2019 (Namibia) - Core Requirements:

1. LEGAL RECOGNITION (Section 11):
- Electronic signatures have the same legal status as handwritten signatures
- Must be capable of identifying the signatory
- Must indicate signatory's approval of the information

2. RELIABILITY REQUIREMENTS (Section 13):
- Signature creation data linked to signatory and no other person
- Signature creation data under sole control of signatory
- Signature linked to data message to detect subsequent changes
- Technical reliability appropriate for purpose and circumstances

3. CONSUMER PROTECTION (Section 43):
- Clear disclosure of signature process
- Right to withdraw consent
- Access to signed documents in usable format

4. CERTIFICATE PROVIDERS (Section 30):
- Must be accredited by CRAN
- Maintain reliable systems and procedures
- Verify identity of certificate applicants

5. ADMISSIBILITY (Section 15):
- Electronic signatures admissible in legal proceedings
- Rebuttable presumption of authenticity
- Court may consider reliability of signature creation process
EOF
    
    # Create SADC knowledge base
    cat > "$kb_dir/sadc_model.txt" << 'EOF'
SADC Model Law on Electronic Transactions - Key Principles:

1. TECHNOLOGY NEUTRALITY:
- Law must not discriminate against electronic form
- Adaptable to current and future technologies
- Performance-based rather than technology-specific requirements

2. CROSS-BORDER RECOGNITION:
- Electronic signatures valid across SADC member states
- Mutual recognition of certification authorities
- Harmonized legal frameworks across region

3. FUNCTIONAL EQUIVALENCE:
- Electronic documents legally equivalent to paper
- Electronic signatures equivalent to handwritten signatures
- Same legal effect as traditional methods

4. LEGAL ADMISSIBILITY:
- Electronic evidence admissible in court proceedings
- Integrity and reliability standards apply
- Authentication requirements must be met

5. CONSUMER PROTECTION:
- Right to choose between electronic and paper
- Clear consent requirements
- Access and retention obligations
EOF
    
    info "Legal knowledge base created"
}

# Build the project
build_project() {
    log "Building the project..."
    
    cd "$PROJECT_ROOT"
    
    # Build backend
    info "Building backend..."
    npm run build
    
    # Build frontend
    if [ -d "frontend" ]; then
        info "Building frontend..."
        cd frontend
        npm run build
        cd ..
    fi
    
    info "Project built successfully"
}

# Setup development tools
setup_dev_tools() {
    log "Setting up development tools..."
    
    # Create logs directory structure
    mkdir -p "$PROJECT_ROOT/logs/app"
    mkdir -p "$PROJECT_ROOT/logs/error"
    mkdir -p "$PROJECT_ROOT/logs/audit"
    
    # Setup Git hooks (if .git exists)
    if [ -d "$PROJECT_ROOT/.git" ]; then
        info "Setting up Git hooks..."
        cat > "$PROJECT_ROOT/.git/hooks/pre-commit" << 'EOF'
#!/bin/bash
# BuffrSign pre-commit hook
npm run lint && npm run type-check
EOF
        chmod +x "$PROJECT_ROOT/.git/hooks/pre-commit"
    fi
    
    info "Development tools setup complete"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run backend tests
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        info "Running backend tests..."
        npm test || warn "Some backend tests failed"
    fi
    
    # Run frontend tests
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        cd frontend
        if grep -q '"test"' package.json; then
            info "Running frontend tests..."
            npm test || warn "Some frontend tests failed"
        fi
        cd ..
    fi
}

# Generate documentation
generate_docs() {
    log "Generating documentation..."
    
    # Create API documentation
    cat > "$PROJECT_ROOT/API.md" << 'EOF'
# BuffrSign API Documentation

## Authentication
All API endpoints require authentication except for public signing links.

### Register
```
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure_password",
  "role": "individual"
}
```

### Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

## Document Management

### Upload Document
```
POST /api/documents/upload
Content-Type: multipart/form-data
file: [document file]
title: "Service Agreement"
autoAnalyze: true
```

### Get Document
```
GET /api/documents/:id
```

### Send for Signing
```
POST /api/documents/:id/send
{
  "parties": [
    {
      "email": "client@example.com",
      "name": "Client Name",
      "role": "Client"
    }
  ],
  "workflowType": "sequential",
  "message": "Please review and sign this document"
}
```

## AI Integration

### AI Chat
```
POST /api/ai/chat
{
  "message": "How do I add signature fields?",
  "context": {
    "documentId": "doc_123"
  }
}
```

### Workflow Optimization
```
POST /api/ai/optimize-workflow
{
  "documentId": "doc_123",
  "parties": [...]
}
```

For complete API documentation, visit: https://docs.buffsign.com/api
EOF
    
    info "Documentation generated"
}

# Print setup summary
print_summary() {
    log "Setup completed successfully!"
    
    echo ""
    echo -e "${GREEN}🚀 BuffrSign Platform Setup Complete${NC}"
    echo ""
    echo -e "${BLUE}📁 Project Structure:${NC}"
    echo "   • Backend API: $PROJECT_ROOT/src"
    echo "   • Frontend: $PROJECT_ROOT/frontend"
    echo "   • Database: PostgreSQL (localhost:5432)"
    echo "   • Cache: Redis (localhost:6379)"
    echo "   • Storage: MinIO (localhost:9000)"
    echo ""
    echo -e "${BLUE}🔧 Configuration:${NC}"
    echo "   • Environment: $ENV_FILE"
    echo "   • Legal KB: $PROJECT_ROOT/legal-kb"
    echo "   • Uploads: $PROJECT_ROOT/uploads"
    echo "   • Logs: $PROJECT_ROOT/logs"
    echo ""
    echo -e "${BLUE}🌐 URLs:${NC}"
    echo "   • API: http://localhost:3000"
    echo "   • Frontend: http://localhost:5173"
    echo "   • MinIO Console: http://localhost:9001"
    echo "   • Health Check: http://localhost:3000/health"
    echo ""
    echo -e "${YELLOW}⚡ Next Steps:${NC}"
    echo "   1. Update $ENV_FILE with your API keys"
    echo "   2. Configure OpenAI API key for AI features"
    echo "   3. Set up AWS S3 or keep MinIO for storage"
    echo "   4. Configure email/SMS providers"
    echo "   5. Run: npm run dev (backend) & cd frontend && npm run dev"
    echo ""
    echo -e "${GREEN}📚 Documentation:${NC}"
    echo "   • README: $PROJECT_ROOT/README.md"
    echo "   • API Docs: $PROJECT_ROOT/API.md"
    echo "   • Legal Compliance: $PROJECT_ROOT/legal-kb/"
    echo ""
    echo -e "${BLUE}🏛️ Compliance Features:${NC}"
    echo "   ✓ ETA 2019 (Namibia) compliance framework"
    echo "   ✓ SADC Model Law support"
    echo "   ✓ CRAN accreditation preparation"
    echo "   ✓ Comprehensive audit trails"
    echo "   ✓ PKI infrastructure ready"
    echo ""
    echo -e "${GREEN}Happy coding! 🇳🇦${NC}"
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    BuffrSign Platform Setup                  ║"
    echo "║          AI-Powered Digital Signatures for Namibia          ║"
    echo "║                     & SADC Region                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Parse command line arguments
    USE_DOCKER="true"
    SKIP_TESTS="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-docker)
                USE_DOCKER="false"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --no-docker    Don't use Docker for services"
                echo "  --skip-tests   Skip running tests"
                echo "  -h, --help     Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run setup steps
    check_requirements
    create_env_file
    create_directories
    setup_legal_kb
    install_dependencies
    
    if [ "$USE_DOCKER" = "true" ]; then
        setup_database
        setup_redis
        setup_storage
    fi
    
    build_project
    setup_dev_tools
    
    if [ "$SKIP_TESTS" = "false" ]; then
        run_tests
    fi
    
    generate_docs
    print_summary
}

# Run main function
main "$@"