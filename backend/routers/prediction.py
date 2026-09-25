from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.services.ml_service import (
    predict_health_risk,
    simulate_policy_intervention,
    get_model_diagnostics,
    get_explainability_data
)

router = APIRouter(prefix="/api", tags=["AI & Prediction"])

class PredictRequest(BaseModel):
    PM2_5: float = 145.0
    PM10: float = 210.0
    NO2: float = 65.0
    SO2: float = 40.0
    CO: float = 1.8
    O3: Optional[float] = 38.0
    temperature: float = 28.0
    humidity: float = 55.0
    wind_speed: float = 2.8
    population_density: Optional[float] = 12500.0
    traffic_density: str = "High"
    AQI: Optional[float] = None

class PolicySimulationRequest(BaseModel):
    traffic_reduction: float = 25.0
    industrial_reduction: float = 20.0
    construction_dust_reduction: float = 30.0
    green_cover_increase: float = 15.0
    odd_even_rule: bool = False

@router.post("/predict")
def predict_endpoint(req: PredictRequest):
    return predict_health_risk(req.dict())

@router.post("/policy/simulate")
def policy_simulate_endpoint(req: PolicySimulationRequest):
    return simulate_policy_intervention(req.dict())

@router.get("/model/performance")
def model_performance_endpoint():
    return get_model_diagnostics()

@router.get("/model/explainability")
def model_explainability_endpoint(city: Optional[str] = "Delhi"):
    return get_explainability_data(city=city)
