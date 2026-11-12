
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="SAFETRACE API",
    description=(
        "AI-powered Cross-Channel Cyber Fraud Detection "
        "and Digital Threat Intelligence Platform."
    ),
    version="1.0.0",
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

ALLOWED_ORIGINS = [
    # Local Development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",

    # Production Frontend
    "https://safetrace-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# API ROUTES
# ==========================================

app.include_router(analyze_router)


# ==========================================
# ROOT ENDPOINT
# ==========================================

@app.get("/")
async def home():
    return {
        "app": "SAFETRACE API",
        "description": "Cross-Channel Cyber Fraud Intelligence Platform",
        "version": "1.0.0",
        "status": "running",
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "app": "SAFETRACE",
        "status": "healthy",
        "message": "SAFETRACE backend is running successfully.",
    }


@app.get("/api/v1/health")
async def versioned_health_check():
    return {
        "success": True,
        "app": "SAFETRACE",
        "version": "1.0.0",
        "status": "healthy",
    }
