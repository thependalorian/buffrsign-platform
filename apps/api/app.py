from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import auth, documents, signatures, templates, compliance, dashboard

# Import services
from services.redis_service import redis_service
from services.task_processor import TaskProcessor

# Import middleware
from middleware.redis_middleware import RedisMiddleware

# Import WebSocket server
from websocket_server import WebSocketManager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 BuffrSign API starting up...")
    print(f"Environment: {os.getenv('NODE_ENV', 'development')}")
    
    # Initialize Redis service
    try:
        await redis_service.initialize()
        print("✅ Redis service initialized")
    except Exception as e:
        print(f"⚠️ Redis service initialization failed: {e}")
    
    # Initialize task processor
    try:
        task_processor = TaskProcessor()
        await task_processor.initialize()
        print("✅ Task processor initialized")
    except Exception as e:
        print(f"⚠️ Task processor initialization failed: {e}")
    
    # Initialize WebSocket manager
    try:
        websocket_manager = WebSocketManager()
        await websocket_manager.initialize()
        print("✅ WebSocket manager initialized")
    except Exception as e:
        print(f"⚠️ WebSocket manager initialization failed: {e}")
    
    yield
    
    # Shutdown
    print("🛑 BuffrSign API shutting down...")
    
    # Cleanup Redis connections
    try:
        await redis_service.cleanup()
        print("✅ Redis service cleaned up")
    except Exception as e:
        print(f"⚠️ Redis cleanup failed: {e}")

app = FastAPI(
    title="BuffrSign API",
    description="Digital Signature Platform for Namibia - ETA 2019 Compliant",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("NODE_ENV") != "production" else None,
    redoc_url="/redoc" if os.getenv("NODE_ENV") != "production" else None,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"] if os.getenv("NODE_ENV") == "development" else [
        "api.sign.buffr.ai",
        "sign.buffr.ai",
        "www.sign.buffr.ai",
        "localhost",
        "*.vercel.app",
        "*.railway.app"
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sign.buffr.ai",
        "https://www.sign.buffr.ai",
        "https://buffrsign-platform.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000",  # Development
    ] if os.getenv("NODE_ENV") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis middleware for rate limiting
app.add_middleware(RedisMiddleware)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check Redis connection
        redis_status = await redis_service.health_check()
        
        return {
            "status": "healthy",
            "service": "BuffrSign API",
            "version": "1.0.0",
            "environment": os.getenv("NODE_ENV", "development"),
            "eta_2019_compliant": True,
            "cran_accredited": True,
            "redis": redis_status,
            "timestamp": "2025-01-27T12:00:00Z"
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "BuffrSign API",
            "version": "1.0.0",
            "environment": os.getenv("NODE_ENV", "development"),
            "error": str(e),
            "eta_2019_compliant": True,
            "cran_accredited": True
        }

# API info endpoint
@app.get("/api/info")
async def api_info():
    """API information and capabilities"""
    return {
        "name": "BuffrSign API",
        "version": "1.0.0",
        "description": "Digital Signature Platform for Namibia",
        "compliance": {
            "eta_2019": True,
            "cran_accreditation": True,
            "gdpr_ready": True
        },
        "features": {
            "authentication": True,
            "document_management": True,
            "digital_signatures": True,
            "templates": True,
            "compliance_checking": True,
            "real_time_updates": True,
            "audit_trails": True
        },
        "endpoints": {
            "auth": "/api/v1/auth",
            "documents": "/api/v1/documents", 
            "signatures": "/api/v1/signatures",
            "templates": "/api/v1/templates",
            "compliance": "/api/v1/compliance",
            "dashboard": "/api/v1/dashboard"
        }
    }

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(signatures.router, prefix="/api/v1/signatures", tags=["Signatures"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["Templates"])
app.include_router(compliance.router, prefix="/api/v1/compliance", tags=["Compliance"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("NODE_ENV") == "development"
    )