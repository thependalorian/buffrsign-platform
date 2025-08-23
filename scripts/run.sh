#!/bin/bash
# BuffrSign Platform Development Runner
# Quick start script for local development

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

# Check if setup has been run
check_setup() {
    log "Checking if setup has been completed..."
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        error "Environment file not found. Please run './scripts/setup.sh' first."
        exit 1
    fi
    
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        error "Dependencies not installed. Please run './scripts/setup.sh' first."
        exit 1
    fi
    
    if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
        error "Frontend dependencies not installed. Please run './scripts/setup.sh' first."
        exit 1
    fi
    
    info "✓ Setup appears to be complete"
}

# Start services with Docker Compose
start_with_docker() {
    log "Starting BuffrSign platform with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        error "docker-compose.yml not found"
        exit 1
    fi
    
    # Start services
    info "Starting services..."
    docker-compose up -d postgres redis minio
    
    # Wait for services to be ready
    info "Waiting for services to be ready..."
    sleep 15
    
    # Start application services
    info "Starting application services..."
    docker-compose up -d api frontend
    
    info "Services started successfully!"
    print_service_urls
}

# Start services manually
start_manual() {
    log "Starting BuffrSign platform manually..."
    
    cd "$PROJECT_ROOT"
    
    # Check if services are running
    check_services
    
    # Build the project
    info "Building the project..."
    npm run build
    
    # Start backend in background
    info "Starting backend API..."
    npm run dev &
    BACKEND_PID=$!
    
    # Start frontend in background
    info "Starting frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    
    cd "$PROJECT_ROOT"
    
    # Wait a moment for services to start
    sleep 5
    
    info "Services started successfully!"
    print_service_urls
    
    # Handle shutdown
    trap 'cleanup_manual' INT TERM
    
    # Wait for user to stop
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    wait
}

# Check if required services are running
check_services() {
    info "Checking required services..."
    
    # Check PostgreSQL
    if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        warn "PostgreSQL not running on localhost:5432"
        info "You can start it with Docker: docker run -d --name postgres -e POSTGRES_DB=buffsign_dev -e POSTGRES_USER=buffsign -e POSTGRES_PASSWORD=buffsign_password_change_me -p 5432:5432 postgres:15-alpine"
    else
        info "✓ PostgreSQL is running"
    fi
    
    # Check Redis
    if ! redis-cli -h localhost -p 6379 ping >/dev/null 2>&1; then
        warn "Redis not running on localhost:6379"
        info "You can start it with Docker: docker run -d --name redis -p 6379:6379 redis:7-alpine"
    else
        info "✓ Redis is running"
    fi
    
    # Check MinIO (optional)
    if ! curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; then
        warn "MinIO not running on localhost:9000 (optional for development)"
        info "You can start it with Docker: docker run -d --name minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=buffsign -e MINIO_ROOT_PASSWORD=buffsign_minio_password_change_me minio/minio server /data --console-address ':9001'"
    else
        info "✓ MinIO is running"
    fi
}

# Cleanup manual processes
cleanup_manual() {
    echo ""
    log "Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        info "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        info "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    info "Services stopped"
    exit 0
}

# Print service URLs
print_service_urls() {
    echo ""
    echo -e "${GREEN}🚀 BuffrSign Platform is running!${NC}"
    echo ""
    echo -e "${BLUE}📱 Frontend (React):${NC} http://localhost:5173"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3000"
    echo -e "${BLUE}📖 API Docs:${NC} http://localhost:3000/api-docs"
    echo -e "${BLUE}💊 Health Check:${NC} http://localhost:3000/health"
    echo ""
    echo -e "${BLUE}🗄️  Database:${NC} postgresql://buffsign:buffsign_password_change_me@localhost:5432/buffsign_dev"
    echo -e "${BLUE}🚀 Redis:${NC} redis://localhost:6379"
    echo -e "${BLUE}📦 MinIO Console:${NC} http://localhost:9001 (buffsign / buffsign_minio_password_change_me)"
    echo ""
    echo -e "${YELLOW}⚡ Quick Test:${NC}"
    echo "   curl http://localhost:3000/health"
    echo ""
}

# Stop all services
stop_services() {
    log "Stopping all BuffrSign services..."
    
    if command_exists docker-compose; then
        cd "$PROJECT_ROOT"
        docker-compose down
        info "Docker services stopped"
    fi
    
    # Kill any running Node processes
    pkill -f "node.*buffsign" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    
    info "All services stopped"
}

# Show logs
show_logs() {
    if command_exists docker-compose; then
        cd "$PROJECT_ROOT"
        docker-compose logs -f
    else
        warn "Docker Compose not available. Check individual service logs in logs/ directory."
    fi
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    BuffrSign Platform Runner                 ║"
    echo "║          AI-Powered Digital Signatures for Namibia          ║"
    echo "║                     & SADC Region                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Parse command line arguments
    case "${1:-start}" in
        start)
            check_setup
            if command_exists docker-compose && [ "${USE_DOCKER:-true}" != "false" ]; then
                start_with_docker
            else
                start_manual
            fi
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            if command_exists docker-compose && [ "${USE_DOCKER:-true}" != "false" ]; then
                start_with_docker
            else
                start_manual
            fi
            ;;
        logs)
            show_logs
            ;;
        manual)
            check_setup
            start_manual
            ;;
        docker)
            check_setup
            start_with_docker
            ;;
        status)
            check_services
            ;;
        help|--help|-h)
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  start     Start the platform (default, auto-detect Docker)"
            echo "  stop      Stop all services"
            echo "  restart   Restart all services"
            echo "  logs      Show service logs (Docker only)"
            echo "  manual    Start services manually (without Docker)"
            echo "  docker    Start services with Docker Compose"
            echo "  status    Check status of required services"
            echo "  help      Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  USE_DOCKER=false    Force manual startup"
            echo ""
            echo "Examples:"
            echo "  $0                  # Start with auto-detection"
            echo "  $0 manual           # Start without Docker"
            echo "  USE_DOCKER=false $0 # Force manual startup"
            ;;
        *)
            error "Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"