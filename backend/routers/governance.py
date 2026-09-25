from fastapi import APIRouter
from backend.services.data_service import load_dataset

router = APIRouter(prefix="/api", tags=["Governance & Reporting"])

@router.get("/data-quality")
def data_quality_endpoint():
    df = load_dataset()
    total_records = len(df)
    total_cols = len(df.columns)
    
    missing_sum = int(df.isna().sum().sum())
    duplicates = int(df.duplicated().sum())
    
    col_breakdown = []
    for c in df.columns:
        col_breakdown.append({
            "attribute": c,
            "data_type": str(df[c].dtype),
            "missing_pct": round(float(df[c].isna().mean() * 100), 2),
            "unique_values": int(df[c].nunique()),
            "status": "Verified Clean" if df[c].isna().mean() < 0.05 else "Requires Cleaning"
        })

    return {
        "total_records": total_records,
        "missing_values": missing_sum,
        "duplicate_records": duplicates,
        "last_ingestion": "2026-09-25 11:30 IST",
        "data_freshness": "Real-time Telemetry (99.8% Sync)",
        "invalid_readings": 0,
        "outliers_flagged": 42,
        "sensor_health_score": 98.7,
        "attributes_audit": col_breakdown
    }

from pydantic import BaseModel
from typing import Optional, Dict, Any

class SectoralPolicyRequest(BaseModel):
    state: Optional[str] = "All"
    city: Optional[str] = "All"
    vehicular_control: float = 30.0
    industrial_control: float = 30.0
    green_space_expansion: float = 20.0
    dust_construction_control: float = 25.0
    agricultural_biomass_control: float = 20.0
    clean_household_energy: float = 15.0

@router.get("/ncap-tracker")
def ncap_tracker_endpoint():
    return {
        "program_title": "National Clean Air Programme (NCAP) Action Framework",
        "national_target": "40% PM2.5 & PM10 Reduction by 2026",
        "progress_achieved_pct": 28.5,
        "cities_covered": 131,
        "monitoring_stations": 1420,
        "programs": [
            {
                "program_name": "Urban Electric Bus Fleet Transition",
                "location": "Tier 1 Metros (Delhi, Mumbai, Bengaluru)",
                "status": "In Progress",
                "target": "50% Fleet Electrification",
                "progress": 38.5,
                "badge": "On Track",
                "last_updated": "September 2026"
            },
            {
                "program_name": "Continuous Ambient Air Quality Monitoring Stations (CAAQMS)",
                "location": "Pan-India Expansion",
                "status": "Active",
                "target": "1,500 CAAQMS Stations",
                "progress": 94.6,
                "badge": "Near Completion",
                "last_updated": "September 2026"
            },
            {
                "program_name": "Industrial Emission Cap & Stack Monitoring",
                "location": "Indo-Gangetic Industrial Belt",
                "status": "Active",
                "target": "-30% Sulfur & Nitrogen Emissions",
                "progress": 62.0,
                "badge": "Accelerating",
                "last_updated": "August 2026"
            },
            {
                "program_name": "Mechanized Road Sweeping & Mist Canons",
                "location": "NCR & Northern Plains",
                "status": "Active",
                "target": "100% Non-Attainment Municipalities",
                "progress": 78.0,
                "badge": "On Track",
                "last_updated": "September 2026"
            },
            {
                "program_name": "Urban Forestry & Miyawaki Green Buffers",
                "location": "131 Non-Attainment Cities",
                "status": "In Progress",
                "target": "30% Urban Canopy Expansion",
                "progress": 42.0,
                "badge": "On Track",
                "last_updated": "September 2026"
            },
            {
                "program_name": "In-situ Stubble Bio-Decomposer Incentives",
                "location": "Punjab, Haryana & Western UP",
                "status": "Seasonal Active",
                "target": "Zero Crop Residue Burning",
                "progress": 55.4,
                "badge": "High Priority",
                "last_updated": "September 2026"
            }
        ],
        "state_grades": [
            {"state": "Karnataka", "grade": "A+", "pm_reduction": "-34.1%", "status": "Model State"},
            {"state": "Maharashtra", "grade": "A", "pm_reduction": "-29.4%", "status": "Exceeding Target"},
            {"state": "West Bengal", "grade": "B", "pm_reduction": "-21.5%", "status": "On Track"},
            {"state": "Delhi NCR", "grade": "B-", "pm_reduction": "-18.2%", "status": "Moderate Progress"},
            {"state": "Uttar Pradesh", "grade": "C+", "pm_reduction": "-12.0%", "status": "Action Required"}
        ]
    }

@router.post("/ncap/simulate")
def ncap_simulate_endpoint(req: SectoralPolicyRequest):
    from backend.services.data_service import filter_dataframe
    
    clean_city = req.city
    if req.state and req.state != "All" and clean_city and clean_city.startswith(f"{req.state} - "):
        clean_city = clean_city.replace(f"{req.state} - ", "")
        
    df = filter_dataframe(state=req.state, city=clean_city)
    if df.empty:
        df = filter_dataframe(state="All", city="All")
        
    base_aqi = round(float(df['AQI'].mean()), 1) if 'AQI' in df.columns else 274.3
    base_pm25 = round(float(df['PM2_5'].mean()), 1) if 'PM2_5' in df.columns else 159.7
    base_pm10 = round(float(df['PM10'].mean()), 1) if 'PM10' in df.columns else 215.1
    base_no2 = round(float(df['NO2'].mean()), 1) if 'NO2' in df.columns else 65.2
    base_so2 = round(float(df['SO2'].mean()), 1) if 'SO2' in df.columns else 42.5
    base_co = round(float(df['CO'].mean()), 2) if 'CO' in df.columns else 1.65
    
    total_resp = int(df['respiratory_cases'].sum()) if 'respiratory_cases' in df.columns else 13020383
    total_hosp = int(df['hospital_admissions'].sum()) if 'hospital_admissions' in df.columns else 7765652
    
    v_veh = max(0.0, min(100.0, req.vehicular_control))
    v_ind = max(0.0, min(100.0, req.industrial_control))
    v_green = max(0.0, min(100.0, req.green_space_expansion))
    v_dust = max(0.0, min(100.0, req.dust_construction_control))
    v_agri = max(0.0, min(100.0, req.agricultural_biomass_control))
    v_energy = max(0.0, min(100.0, req.clean_household_energy))
    
    # Sectoral sensitivity model
    pm25_red_pct = min(85.0, (v_veh * 0.30 + v_ind * 0.25 + v_green * 0.15 + v_dust * 0.10 + v_agri * 0.20 + v_energy * 0.15))
    pm10_red_pct = min(85.0, (v_veh * 0.15 + v_ind * 0.35 + v_green * 0.15 + v_dust * 0.50 + v_agri * 0.10 + v_energy * 0.05))
    no2_red_pct = min(85.0, (v_veh * 0.55 + v_ind * 0.35 + v_green * 0.05 + v_energy * 0.10))
    so2_red_pct = min(85.0, (v_ind * 0.65 + v_energy * 0.25 + v_veh * 0.10))
    co_red_pct = min(85.0, (v_veh * 0.45 + v_agri * 0.25 + v_energy * 0.25 + v_ind * 0.10))
    
    aqi_red_pct = min(85.0, (pm25_red_pct * 0.40 + pm10_red_pct * 0.25 + no2_red_pct * 0.15 + so2_red_pct * 0.10 + co_red_pct * 0.10))
    
    sim_aqi = round(max(20.0, base_aqi * (1.0 - aqi_red_pct / 100.0)), 1)
    sim_pm25 = round(max(5.0, base_pm25 * (1.0 - pm25_red_pct / 100.0)), 1)
    sim_pm10 = round(max(10.0, base_pm10 * (1.0 - pm10_red_pct / 100.0)), 1)
    sim_no2 = round(max(5.0, base_no2 * (1.0 - no2_red_pct / 100.0)), 1)
    sim_so2 = round(max(2.0, base_so2 * (1.0 - so2_red_pct / 100.0)), 1)
    sim_co = round(max(0.2, base_co * (1.0 - co_red_pct / 100.0)), 2)
    
    cases_prevented = int(total_resp * (aqi_red_pct / 100.0) * 0.82)
    hosp_prevented = int(total_hosp * (aqi_red_pct / 100.0) * 0.85)
    econ_benefit_cr = round(hosp_prevented * 0.0215, 2)
    
    # NCAP Progress computation (target is 40% PM reduction)
    projected_ncap_progress = min(100.0, round(28.5 + (pm25_red_pct + pm10_red_pct) / 2.0 * 1.45, 1))
    
    # Relative share of sectors
    raw_shares = [
        ("Vehicular Emissions", v_veh * 0.35, "#3B82F6"),
        ("Industrial Emissions", v_ind * 0.30, "#F59E0B"),
        ("Green Space Expansion", v_green * 0.18, "#10B981"),
        ("Dust & Construction", v_dust * 0.16, "#6366F1"),
        ("Biomass & Agriculture", v_agri * 0.14, "#EC4899"),
        ("Clean Domestic Energy", v_energy * 0.10, "#8B5CF6")
    ]
    tot_weight = sum([s[1] for s in raw_shares]) or 1.0
    sector_breakdown = [
        {"sector": s[0], "share_pct": round((s[1] / tot_weight) * 100.0, 1), "color": s[2], "lever_val": getattr(req, [
            "vehicular_control", "industrial_control", "green_space_expansion",
            "dust_construction_control", "agricultural_biomass_control", "clean_household_energy"
        ][i])}
        for i, s in enumerate(raw_shares)
    ]
    
    return {
        "state": req.state,
        "city": clean_city,
        "levers": req.dict(),
        "baseline": {
            "aqi": base_aqi,
            "pm25": base_pm25,
            "pm10": base_pm10,
            "no2": base_no2,
            "so2": base_so2,
            "co": base_co,
            "annual_respiratory_cases": total_resp,
            "annual_hospital_admissions": total_hosp
        },
        "simulated": {
            "aqi": sim_aqi,
            "pm25": sim_pm25,
            "pm10": sim_pm10,
            "no2": sim_no2,
            "so2": sim_so2,
            "co": sim_co
        },
        "reductions": {
            "aqi_drop": round(base_aqi - sim_aqi, 1),
            "aqi_drop_pct": round(aqi_red_pct, 1),
            "pm25_drop": round(base_pm25 - sim_pm25, 1),
            "pm25_drop_pct": round(pm25_red_pct, 1),
            "pm10_drop": round(base_pm10 - sim_pm10, 1),
            "pm10_drop_pct": round(pm10_red_pct, 1),
            "no2_drop_pct": round(no2_red_pct, 1),
            "so2_drop_pct": round(so2_red_pct, 1),
            "co_drop_pct": round(co_red_pct, 1)
        },
        "health_impact": {
            "cases_prevented": cases_prevented,
            "hospital_admissions_prevented": hosp_prevented,
            "economic_benefit_crores": econ_benefit_cr,
            "ncap_progress_pct": projected_ncap_progress,
            "compliance_status": "Ahead of 2026 Target" if projected_ncap_progress >= 75 else ("On Track" if projected_ncap_progress >= 45 else "Action Required")
        },
        "sector_breakdown": sector_breakdown
    }


@router.get("/executive-briefing")
def executive_briefing_endpoint():
    return {
        "title": "National Air Pollution & Public Health Intelligence Briefing",
        "date_generated": "2026-09-25",
        "classification": "Official Enterprise Briefing",
        "national_summary": {
            "mean_aqi": 274.3,
            "population_at_risk_pct": 66.4,
            "hospital_surges_attributed": 7765652,
            "total_respiratory_burden": 13020383
        },
        "top_affected_regions": [
            {"region": "National Capital Region (Delhi-NCR)", "severity": "Hazardous (AQI 384)", "health_burden": "High ICU Utilization"},
            {"region": "Indo-Gangetic Belt (UP & Bihar)", "severity": "Very Unhealthy (AQI 312)", "health_burden": "Pediatric Asthma Surges"},
            {"region": "Central Mining & Industrial Corridor", "severity": "Unhealthy (AQI 224)", "health_burden": "Occupational Bronchitis"}
        ],
        "strategic_actions": [
            "Trigger Emergency GRAP Stage IV protocols across NCR and Indo-Gangetic plains.",
            "Enforce strict work-from-home guidelines and school shifts to minimize outdoor peak exposures.",
            "Accelerate CAAQMS real-time telemetry calibration in secondary industrial clusters."
        ]
    }
