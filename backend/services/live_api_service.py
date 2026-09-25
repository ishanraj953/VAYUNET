import os
import time
import urllib.request
import json
from typing import Dict, Any, Optional, List

# CPCB Sub-Index Mathematical Interpolation Functions
def calculate_subindex_pm25(c: float) -> float:
    if c <= 30: return c * (50 / 30)
    elif c <= 60: return 50 + (c - 30) * (50 / 30)
    elif c <= 90: return 100 + (c - 60) * (100 / 30)
    elif c <= 120: return 200 + (c - 90) * (100 / 30)
    elif c <= 250: return 300 + (c - 120) * (100 / 130)
    else: return min(500, 400 + (c - 250) * (100 / 130))

def calculate_subindex_pm10(c: float) -> float:
    if c <= 50: return c
    elif c <= 100: return 50 + (c - 50)
    elif c <= 250: return 100 + (c - 100) * (100 / 150)
    elif c <= 350: return 200 + (c - 250)
    elif c <= 430: return 300 + (c - 350) * (100 / 80)
    else: return min(500, 400 + (c - 430) * (100 / 80))

def calculate_subindex_no2(c: float) -> float:
    if c <= 40: return c * (50 / 40)
    elif c <= 80: return 50 + (c - 40) * (50 / 40)
    elif c <= 180: return 100 + (c - 80) * (100 / 100)
    elif c <= 280: return 200 + (c - 180) * (100 / 100)
    elif c <= 400: return 300 + (c - 280) * (100 / 120)
    else: return min(500, 400 + (c - 400) * (100 / 120))

def calculate_subindex_so2(c: float) -> float:
    if c <= 40: return c * (50 / 40)
    elif c <= 80: return 50 + (c - 40) * (50 / 40)
    elif c <= 380: return 100 + (c - 80) * (100 / 300)
    elif c <= 800: return 200 + (c - 380) * (100 / 420)
    elif c <= 1600: return 300 + (c - 800) * (100 / 800)
    else: return min(500, 400 + (c - 1600) * (100 / 800))

def calculate_subindex_co(c_mg: float) -> float:
    if c_mg <= 1.0: return c_mg * 50
    elif c_mg <= 2.0: return 50 + (c_mg - 1.0) * 50
    elif c_mg <= 10.0: return 100 + (c_mg - 2.0) * (100 / 8.0)
    elif c_mg <= 17.0: return 200 + (c_mg - 10.0) * (100 / 7.0)
    elif c_mg <= 34.0: return 300 + (c_mg - 17.0) * (100 / 17.0)
    else: return min(500, 400 + (c_mg - 34.0) * (100 / 17.0))

def calculate_cpcb_aqi(pm25: float, pm10: float, no2: float, so2: float, co: float) -> Dict[str, Any]:
    s_pm25 = calculate_subindex_pm25(pm25)
    s_pm10 = calculate_subindex_pm10(pm10)
    s_no2 = calculate_subindex_no2(no2)
    s_so2 = calculate_subindex_so2(so2)
    s_co = calculate_subindex_co(co)
    
    sub_indices = {
        "PM2.5": s_pm25,
        "PM10": s_pm10,
        "NO2": s_no2,
        "SO2": s_so2,
        "CO": s_co
    }
    dominant_pollutant = max(sub_indices, key=sub_indices.get)
    composite_aqi = round(sub_indices[dominant_pollutant], 1)
    
    if composite_aqi <= 50:
        category = "Good"
        color = "#10B981"
        risk_label = "Minimal Health Impact"
        grap_stage = "Normal Operations"
        hospital_surge = "Baseline"
    elif composite_aqi <= 100:
        category = "Satisfactory"
        color = "#FBBF24"
        risk_label = "Minor Breathing Discomfort"
        grap_stage = "Stage 0 (Advisory)"
        hospital_surge = "Normal"
    elif composite_aqi <= 200:
        category = "Moderate"
        color = "#F97316"
        risk_label = "Breathing Discomfort for Asthmatics"
        grap_stage = "Stage I (Poor)"
        hospital_surge = "Mild (+15%)"
    elif composite_aqi <= 300:
        category = "Poor"
        color = "#EF4444"
        risk_label = "Breathing Discomfort on Prolonged Exposure"
        grap_stage = "Stage II (Very Poor)"
        hospital_surge = "Moderate (+35%)"
    elif composite_aqi <= 400:
        category = "Very Poor"
        color = "#DC2626"
        risk_label = "Respiratory Illness on Prolonged Exposure"
        grap_stage = "Stage III (Severe)"
        hospital_surge = "High (+50%)"
    else:
        category = "Severe"
        color = "#991B1B"
        risk_label = "Severe Health Emergency Affecting All"
        grap_stage = "Stage IV (Severe+ Emergency)"
        hospital_surge = "Critical ICU (+70%)"
        
    return {
        "aqi": composite_aqi,
        "category": category,
        "color": color,
        "dominant_pollutant": dominant_pollutant,
        "risk_label": risk_label,
        "grap_stage": grap_stage,
        "hospital_surge": hospital_surge,
        "sub_indices": {k: round(v, 1) for k, v in sub_indices.items()}
    }

# Live coordinate fetcher using Open-Meteo Air Quality Global Feed
def fetch_live_coordinates_telemetry(lat: float, lng: float, timeout_sec: float = 4.0) -> Optional[Dict[str, Any]]:
    """
    Directly fetches live real-time air quality measurements from open meteorological & telemetry satellite/ground sensors.
    """
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,us_aqi"
    headers = {"User-Agent": "VayuNet-India-AirPollutionDashboard/2.5"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout_sec) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                curr = data.get("current", {})
                
                raw_pm25 = float(curr.get("pm2_5", 35.0) or 35.0)
                raw_pm10 = float(curr.get("pm10", 65.0) or 65.0)
                raw_no2 = float(curr.get("nitrogen_dioxide", 25.0) or 25.0)
                raw_so2 = float(curr.get("sulphur_dioxide", 15.0) or 15.0)
                
                # CO from API is in ug/m3, convert to mg/m3
                raw_co_ug = float(curr.get("carbon_monoxide", 600.0) or 600.0)
                co_mg = round(raw_co_ug / 1000.0, 2) if raw_co_ug > 10 else round(raw_co_ug, 2)
                
                cpcb_res = calculate_cpcb_aqi(raw_pm25, raw_pm10, raw_no2, raw_so2, co_mg)
                
                return {
                    "source": "Direct Live Telemetry (Open Global Feed)",
                    "timestamp": curr.get("time", time.strftime("%Y-%m-%d %H:%M:%S")),
                    "pm25": round(raw_pm25, 1),
                    "pm10": round(raw_pm10, 1),
                    "no2": round(raw_no2, 1),
                    "so2": round(raw_so2, 1),
                    "co": co_mg,
                    "aqi": cpcb_res["aqi"],
                    "category": cpcb_res["category"],
                    "color": cpcb_res["color"],
                    "risk_label": cpcb_res["risk_label"],
                    "grap_stage": cpcb_res["grap_stage"],
                    "hospital_surge": cpcb_res["hospital_surge"],
                    "dominant_pollutant": cpcb_res["dominant_pollutant"]
                }
    except Exception as e:
        return None
