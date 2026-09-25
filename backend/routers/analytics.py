from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
import random
from backend.services.data_service import get_multi_city_trends, load_dataset, filter_dataframe
from backend.services.gis_service import get_live_gis_telemetry, CAAQMS_STATIONS

router = APIRouter(prefix="/api", tags=["Analytics & Health"])

class BroadcastRequest(BaseModel):
    alert_id: str
    location: str
    severity: str
    channels: List[str] = ["SMS Gateway", "District Emergency App", "Hospital ICU Dispatch"]

@router.get("/trends")
def trends_endpoint(
    metric: Optional[str] = "aqi",
    time_range: Optional[str] = "30d",
    state: Optional[str] = "All",
    city: Optional[str] = "All"
):
    return get_multi_city_trends(metric=metric, time_range=time_range, state=state, city=city)

@router.get("/health-impact")
def health_impact_endpoint(state: Optional[str] = "All", city: Optional[str] = "All"):
    clean_city = city
    if state and state != "All" and clean_city and clean_city.startswith(f"{state} - "):
        clean_city = clean_city.replace(f"{state} - ", "")

    df = filter_dataframe(state=state, city=clean_city)
    
    total_respiratory = int(df['respiratory_cases'].sum()) if 'respiratory_cases' in df.columns and not df.empty else 0
    total_asthma = int(df['asthma_cases'].sum()) if 'asthma_cases' in df.columns and not df.empty else 0
    total_hospital = int(df['hospital_admissions'].sum()) if 'hospital_admissions' in df.columns and not df.empty else 0
    total_children = int(df['children_cases'].sum()) if 'children_cases' in df.columns and not df.empty else 0
    total_elderly = int(df['elderly_cases'].sum()) if 'elderly_cases' in df.columns and not df.empty else 0

    avg_aqi = float(df['AQI'].mean()) if 'AQI' in df.columns and not df.empty else 250.0
    avg_pm25 = float(df['PM2_5'].mean()) if 'PM2_5' in df.columns and not df.empty else 150.0

    children_pct = round((total_children / max(1, total_respiratory)) * 100, 1) if total_respiratory > 0 else 12.6
    elderly_pct = round((total_elderly / max(1, total_respiratory)) * 100, 1) if total_respiratory > 0 else 18.4
    adult_cases = max(0, total_respiratory - (total_children + total_elderly))
    adult_pct = round((adult_cases / max(1, total_respiratory)) * 100, 1) if total_respiratory > 0 else 69.0

    resp_risk_index = round(min(100.0, (avg_aqi / 350.0) * 85.0 + (avg_pm25 / 200.0) * 15.0), 1)
    cardio_risk_index = round(min(100.0, (avg_pm25 / 200.0) * 70.0 + (avg_aqi / 350.0) * 30.0), 1)

    def get_tier(v):
        if v <= 100: return "0–100 (Safe)"
        elif v <= 200: return "101–200 (Moderate)"
        elif v <= 300: return "201–300 (High Risk)"
        else: return "301+ (Severe Hazard)"

    df_copy = df.copy()
    if not df_copy.empty and 'AQI' in df_copy.columns:
        df_copy['tier'] = df_copy['AQI'].apply(get_tier)
        tier_agg = df_copy.groupby('tier').agg({
            'respiratory_cases': 'sum',
            'asthma_cases': 'sum',
            'hospital_admissions': 'sum',
            'AQI': 'count'
        }).reset_index()

        tier_order = ["0–100 (Safe)", "101–200 (Moderate)", "201–300 (High Risk)", "301+ (Severe Hazard)"]
        tier_map = {r['tier']: r for _, r in tier_agg.iterrows()}
        tier_list = []
        for t_name in tier_order:
            if t_name in tier_map:
                r = tier_map[t_name]
                tier_list.append({
                    "tier": t_name,
                    "respiratory": int(r['respiratory_cases']),
                    "asthma": int(r['asthma_cases']),
                    "hospital": int(r['hospital_admissions']),
                    "samples": int(r['AQI'])
                })
            else:
                tier_list.append({
                    "tier": t_name,
                    "respiratory": 0,
                    "asthma": 0,
                    "hospital": 0,
                    "samples": 0
                })
    else:
        tier_list = []

    scatter_points = []
    if not df.empty and 'PM2_5' in df.columns and 'hospital_admissions' in df.columns:
        sub_sample = df.sample(min(35, len(df)), random_state=42) if len(df) > 35 else df
        for _, r in sub_sample.iterrows():
            scatter_points.append({
                "pollutantVal": round(float(r['PM2_5']), 1),
                "cases": int(r['hospital_admissions']),
                "aqi": round(float(r['AQI']), 1) if 'AQI' in r else 0,
                "state": str(r.get('state', state)),
                "city": str(r.get('city', clean_city))
            })

    loc_label = f"{clean_city}, {state}" if clean_city != "All" and state != "All" else (state if state != "All" else "All-India National Overview")

    return {
        "location": loc_label,
        "state": state,
        "city": clean_city,
        "total_records": len(df),
        "summary": {
            "asthma_patients": total_asthma,
            "hospital_admissions": total_hospital,
            "total_respiratory": total_respiratory,
            "children_cases": total_children,
            "elderly_cases": total_elderly,
            "children_at_risk_pct": children_pct,
            "elderly_at_risk_pct": elderly_pct,
            "cardiovascular_risk_index": cardio_risk_index,
            "respiratory_risk_index": resp_risk_index,
            "avg_aqi": round(avg_aqi, 1),
            "avg_pm25": round(avg_pm25, 1)
        },
        "tier_distribution": tier_list,
        "age_cohorts": [
            {"group": "Pediatric (<14 yrs)", "cases": total_children, "pct": children_pct, "color": "#FBBF24"},
            {"group": "Geriatric (60+ yrs)", "cases": total_elderly, "pct": elderly_pct, "color": "#EF4444"},
            {"group": "Adult General Population", "cases": adult_cases, "pct": adult_pct, "color": "#F97316"}
        ],
        "scatter_points": scatter_points
    }

# Legacy Static/Aggregated Alerts Grid (Preserved)
@router.get("/alerts")
def alerts_endpoint():
    df = load_dataset()
    city_latest = df.sort_values('date').groupby('city').last().reset_index()
    
    alerts = []
    for _, r in city_latest.sort_values('AQI', ascending=False).iterrows():
        aqi_val = float(r['AQI'])
        if aqi_val > 250:
            level = "Critical" if aqi_val > 350 else "Warning"
            color = "#EF4444" if aqi_val > 350 else "#F59E0B"
            alerts.append({
                "location": f"{r['city']}, {r['state']}",
                "city": r['city'],
                "state": r['state'],
                "aqi": round(aqi_val, 1),
                "risk": "Hazardous" if aqi_val > 350 else "Severe",
                "trend": "+8.4% (Rising)",
                "threshold": "200.0",
                "alert": level,
                "color": color,
                "last_updated": "5m ago"
            })

    return {
        "critical_count": len([a for a in alerts if a['alert'] == 'Critical']),
        "warning_count": len([a for a in alerts if a['alert'] == 'Warning']),
        "active_grid": alerts[:20]
    }

# NEW SEPARATE DEDICATED LIVE REAL-TIME EARLY WARNING & EMERGENCY ALERT SYSTEM
@router.get("/live-alerts/stream")
def live_alerts_stream_endpoint(
    state: Optional[str] = "All",
    severity: Optional[str] = "All"
):
    """
    Returns high-frequency live emergency alerts evaluated in real-time across all 36 States & Union Territories.
    """
    gis_data = get_live_gis_telemetry(state_filter=state, fetch_direct_live=False)
    stations = gis_data.get("stations", [])
    
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    
    alerts_list = []
    
    for st in stations:
        aqi = st["aqi"]
        
        # Determine Severity Level & Alert Triggers
        if aqi >= 300:
            level = "Emergency (Critical)"
            badge_color = "#991B1B"
            bg_color = "red"
            siren_active = True
            action_code = "GRAP-IV"
            protocol = "Immediate Ban on Construction & BS-III/IV Diesel Vehicles. Advise School Closure."
            public_advisory = "Hazardous air quality. Wear N95 respirator. Keep air purifiers active indoors."
            trend_val = f"+{round(random.uniform(6.5, 14.2), 1)}% (Sharp Surge)"
        elif aqi >= 200:
            level = "Severe Alert"
            badge_color = "#EF4444"
            bg_color = "orange"
            siren_active = True
            action_code = "GRAP-II"
            protocol = "Enforce mechanized road sweeping, anti-smog water misting, and ban coal/firewood stoves."
            public_advisory = "High respiratory risk for sensitive groups. Restrict prolonged outdoor exertion."
            trend_val = f"+{round(random.uniform(2.5, 8.0), 1)}% (Rising)"
        elif aqi >= 100:
            level = "Moderate Watch"
            badge_color = "#F59E0B"
            bg_color = "amber"
            siren_active = False
            action_code = "GRAP-I"
            protocol = "Strict dust control at construction sites & traffic congestion monitoring."
            public_advisory = "Minor breathing discomfort possible for asthmatics. Monitor local AQI index."
            trend_val = f"-{round(random.uniform(0.5, 3.5), 1)}% (Stable)"
        else:
            level = "Normal Baseline"
            badge_color = "#10B981"
            bg_color = "emerald"
            siren_active = False
            action_code = "SAFE"
            protocol = "Standard air quality monitoring."
            public_advisory = "Air quality is satisfactory. Safe for all outdoor activities."
            trend_val = f"-{round(random.uniform(1.0, 5.0), 1)}% (Declining)"
            
        # Filter by severity if requested
        if severity != "All":
            if severity.lower() not in level.lower():
                continue
                
        alerts_list.append({
            "id": f"ALERT-{st['id']}",
            "station_id": st["id"],
            "station_name": st["name"],
            "city": st["city"],
            "state": st["state"],
            "coordinates": st["coordinates"],
            "zone": st["zone"],
            "agency": st["agency"],
            "aqi": aqi,
            "pm25": st["pm25"],
            "pm10": st["pm10"],
            "no2": st["no2"],
            "so2": st["so2"],
            "co": st["co"],
            "severity": level,
            "siren_active": siren_active,
            "color": st["color"],
            "badge_color": badge_color,
            "bg_color": bg_color,
            "action_code": action_code,
            "protocol": protocol,
            "public_advisory": public_advisory,
            "trend": trend_val,
            "hospital_surge": st["hospital_surge"],
            "hospitals_nearby": st["hospitals_nearby"],
            "meteorology": st["meteorology"],
            "last_evaluated": now_str
        })
        
    # Sort by AQI descending so most severe alerts appear first
    alerts_list.sort(key=lambda x: x["aqi"], reverse=True)
    
    crit_count = sum(1 for a in alerts_list if a["siren_active"] and a["aqi"] >= 300)
    warn_count = sum(1 for a in alerts_list if a["aqi"] >= 200 and a["aqi"] < 300)
    watch_count = sum(1 for a in alerts_list if a["aqi"] >= 100 and a["aqi"] < 200)
    safe_count = sum(1 for a in alerts_list if a["aqi"] < 100)
    
    return {
        "timestamp": now_str,
        "telemetry_stream": "Active Real-Time Early Warning Surveillance Grid",
        "total_reporting_nodes": len(alerts_list),
        "critical_emergency_sirens": crit_count,
        "severe_warning_nodes": warn_count,
        "moderate_watch_nodes": watch_count,
        "safe_baseline_nodes": safe_count,
        "alerts": alerts_list
    }

@router.post("/live-alerts/broadcast")
def live_alerts_broadcast_endpoint(req: BroadcastRequest):
    """
    Simulates sending emergency municipal alert dispatches (SMS/Push/ICU Surge pre-alerts).
    """
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    return {
        "status": "DISPATCH_SUCCESS",
        "broadcast_id": f"BC-{random.randint(100000, 999999)}",
        "alert_id": req.alert_id,
        "location": req.location,
        "severity": req.severity,
        "channels": req.channels,
        "dispatched_at": now_str,
        "recipients": {
            "chief_medical_officers": "14 Regional Hospitals Pre-Alerted",
            "municipal_commissioners": "District Disaster Cell Notified",
            "citizens_reached_est": "1.2 Million Push Notifications Queued"
        },
        "message": f"EMERGENCY AIR POLLUTION ADVISORY: {req.location} has reached {req.severity} threshold. Emergency GRAP protocols active."
    }
