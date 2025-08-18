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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(" BuffrSign API starting up...")
    print(f"Environment: {os.getenv('NODE_ENV', 'development')}")
    yield
    # Shutdown
    print(" BuffrSign API shutting down...")

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
    allowed_hosts=["*"], # if os.getenv("NODE_ENV") == "development" else [
    #     "api.sign.buffr.ai",
    #     "sign.buffr.ai",
    #     "www.sign.buffr.ai",
    #     "localhost"
    # ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sign.buffr.ai",
        "https://www.sign.buffr.ai",
        "http://localhost:3000",  # Development
    ] if os.getenv("NODE_ENV") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "BuffrSign API",
        "version": "1.0.0",
        "environment": os.getenv("NODE_ENV", "development"),
        "eta_2019_compliant": True,
        "cran_accredited": True
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