import os
import sys

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting VayuNet FastAPI server on {host}:{port}...")
    uvicorn.run("backend.main:app", host=host, port=port, log_level="info")
