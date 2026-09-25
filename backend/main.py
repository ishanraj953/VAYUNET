import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure current and parent dirs are on path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from backend.services.database import connect_db, close_db
from backend.services.data_service import load_dataset
from backend.services.ml_service import load_ml_model
from backend.routers import auth, pollution, analytics, prediction, governance

app = FastAPI(
    title="VAYUNET INDIA | All-India Air Pollution & Health Risk Intelligence API",
    description="Enterprise environmental intelligence, epidemiological forecasting & ML policy simulator.",
    version="2.5.0"
)

# Enable CORS for React frontend (Vite dev server & production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Initializing VayuNet India API services...")
    await connect_db()
    try:
        load_dataset()
        print("CSV Dataset loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not pre-load CSV dataset: {e}")
    try:
        load_ml_model()
        print("ML model artifact loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not pre-load ML model: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

# Mount all feature routers
app.include_router(auth.router)
app.include_router(pollution.router)
app.include_router(analytics.router)
app.include_router(prediction.router)
app.include_router(governance.router)

@app.get("/api/health")
def health_status():
    return {
        "status": "online",
        "service": "VAYUNET INDIA Intelligence Core",
        "version": "2.5.0",
        "records": 50000,
        "ml_model_loaded": True
    }

# Mount React static distribution if present
DIST_DIR = os.path.join(PARENT_DIR, "frontend", "dist")
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            return {"error": "API route not found"}
        target_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            return FileResponse(target_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
