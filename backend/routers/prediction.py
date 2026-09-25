from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.services.ml_service import (
    predict_health_risk,
    get_prediction_baseline,
    simulate_policy_intervention,
    get_model_diagnostics,
    get_explainability_data
)

router = APIRouter(prefix="/api", tags=["AI & Prediction"])

class PredictRequest(BaseModel):
    state: Optional[str] = "Bihar"
    city: Optional[str] = "CityA"
    horizon: Optional[str] = "Next-day (24h)"
    PM2_5: Optional[float] = 195.0
    PM10: Optional[float] = 336.0
    NO2: Optional[float] = 109.0
    SO2: Optional[float] = 9.0
    CO: Optional[float] = 2.86
    AQI: Optional[float] = 263.0
    O3: Optional[float] = 38.0
    temperature: Optional[float] = 28.0
    humidity: Optional[float] = 55.0
    wind_speed: Optional[float] = 3.0
    population_density: Optional[float] = 12500.0
    traffic_density: Optional[str] = "Medium"
    batch_predict: Optional[bool] = False

class PolicySimulationRequest(BaseModel):
    pm25_reduction: float = 20.0
    pm10_reduction: float = 10.0
    no2_reduction: float = 5.0
    so2_reduction: float = 5.0
    co_reduction: float = 5.0
    timeframe: str = "Short-term (3 months)"
    scenario_name: str = "Policy Mix 20-10"
    state: Optional[str] = "All"
    city: Optional[str] = "All"

@router.get("/prediction/baseline")
def prediction_baseline_endpoint(state: Optional[str] = "Bihar", city: Optional[str] = "CityA"):
    return get_prediction_baseline(state=state, city=city)

@router.post("/predict")
def predict_endpoint(req: PredictRequest):
    return predict_health_risk(req.dict())

@router.post("/prediction/infer")
def prediction_infer_endpoint(req: PredictRequest):
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

