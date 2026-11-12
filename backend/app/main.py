
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router


app = FastAPI(
    title="SAFETRACE API",
    description=(
        "AI-powered cross-channel cyber fraud detection "
        "and digital threat intelligence platform."
    ),
    version="1.0.0",
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# API Routes
app.include_router(analyze_router)


@app.get("/")
async def home():
    return {
        "app": "SAFETRACE API",
        "description": "Cross-Channel Cyber Fraud Intelligence Platform",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "app": "SAFETRACE",
        "status": "healthy",
        "message": "SAFETRACE backend is running successfully.",
    }
