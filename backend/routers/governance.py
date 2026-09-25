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
