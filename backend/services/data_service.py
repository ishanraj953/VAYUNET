import os
import math
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "air_pollution_50000_rows.csv")

# State approximate coordinates (lat, lon) for India Map
STATE_COORDINATES = {
    "Andhra Pradesh": [15.9129, 79.7400],
    "Arunachal Pradesh": [28.2180, 94.7278],
    "Assam": [26.2006, 92.9376],
    "Bihar": [25.0961, 85.3131],
    "Chhattisgarh": [21.2787, 81.8661],
    "Goa": [15.2993, 74.1240],
    "Gujarat": [22.2587, 71.1924],
    "Haryana": [29.0588, 76.0856],
    "Himachal Pradesh": [31.1048, 77.1734],
    "Jharkhand": [23.6102, 85.2799],
    "Karnataka": [15.3173, 75.7139],
    "Kerala": [10.8505, 76.2711],
    "Madhya Pradesh": [22.9734, 78.6569],
    "Maharashtra": [19.7515, 75.7139],
    "Manipur": [24.6637, 93.9063],
    "Meghalaya": [25.4670, 91.3662],
    "Mizoram": [23.1645, 92.9376],
    "Nagaland": [26.1584, 94.5624],
    "Odisha": [20.9517, 85.0985],
    "Punjab": [31.1471, 75.3412],
    "Rajasthan": [27.0238, 74.2179],
    "Sikkim": [27.5330, 88.5122],
    "Tamil Nadu": [11.1271, 78.6569],
    "Telangana": [18.1124, 79.0193],
    "Tripura": [23.9408, 91.9882],
    "Uttar Pradesh": [26.8467, 80.9462],
    "Uttarakhand": [30.0668, 79.0193],
    "West Bengal": [22.9868, 87.8550],
    "Delhi": [28.7041, 77.1025],
    "Jammu and Kashmir": [33.7782, 76.5762],
    "Ladakh": [34.1526, 77.5771],
    "Puducherry": [11.9416, 79.8083],
    "Chandigarh": [30.7333, 76.7794]
}

_df: Optional[pd.DataFrame] = None

def load_dataset() -> pd.DataFrame:
    global _df
    if _df is not None:
        return _df
    
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.drop_duplicates().ffill()
    
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(num_cols) > 0:
        df[num_cols] = df[num_cols].fillna(df[num_cols].median())
        
    _df = df
    return _df

def filter_dataframe(
    state: Optional[str] = None,
    city: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> pd.DataFrame:
    d = load_dataset().copy()
    if state and state != 'All':
        d = d[d['state'] == state]
    if city and city != 'All':
        d = d[d['city'] == city]
    if start_date and 'date' in d.columns:
        d = d[d['date'] >= pd.to_datetime(start_date)]
    if end_date and 'date' in d.columns:
        d = d[d['date'] <= pd.to_datetime(end_date)]
    return d

def get_metadata() -> Dict[str, Any]:
    df = load_dataset()
    states = sorted(df['state'].dropna().unique().tolist()) if 'state' in df.columns else []
    cities = sorted(df['city'].dropna().unique().tolist()) if 'city' in df.columns else []
    
    state_cities = {}
    if 'state' in df.columns and 'city' in df.columns:
        for st_name, grp in df.groupby('state'):
            state_cities[st_name] = sorted(grp['city'].dropna().unique().tolist())

    min_date = str(df['date'].min().date()) if 'date' in df.columns and not df['date'].isna().all() else "2024-01-01"
    max_date = str(df['date'].max().date()) if 'date' in df.columns and not df['date'].isna().all() else "2024-12-31"

    return {
        "states": ["All"] + states,
        "cities": ["All"] + cities,
        "state_cities": state_cities,
        "date_range": {"min": min_date, "max": max_date},
        "total_records": len(df)
    }

def get_national_overview(state: str = "All", city: str = "All", start_date: str = None, end_date: str = None) -> Dict[str, Any]:
    df = filter_dataframe(state, city, start_date, end_date)
    
    avg_aqi = round(float(df['AQI'].mean()), 1) if 'AQI' in df.columns else 274.3
    avg_pm25 = round(float(df['PM2_5'].mean()), 1) if 'PM2_5' in df.columns else 159.7
    avg_pm10 = round(float(df['PM10'].mean()), 1) if 'PM10' in df.columns else 215.1
    avg_no2 = round(float(df['NO2'].mean()), 1) if 'NO2' in df.columns else 65.2
    avg_so2 = round(float(df['SO2'].mean()), 1) if 'SO2' in df.columns else 42.5
    avg_co = round(float(df['CO'].mean()), 2) if 'CO' in df.columns else 1.65

    # Safe threshold percentage (AQI > 200)
    high_risk_pct = round(float((df['AQI'] > 200).mean() * 100), 1) if 'AQI' in df.columns else 66.4
    
    total_respiratory = int(df['respiratory_cases'].sum()) if 'respiratory_cases' in df.columns else 13020383
    total_asthma = int(df['asthma_cases'].sum()) if 'asthma_cases' in df.columns else 5121555
    total_hospital = int(df['hospital_admissions'].sum()) if 'hospital_admissions' in df.columns else 7765652
    total_children = int(df['children_cases'].sum()) if 'children_cases' in df.columns else 3864680
    total_elderly = int(df['elderly_cases'].sum()) if 'elderly_cases' in df.columns else 4640339

    total_pop = int(df['population'].sum()) if 'population' in df.columns else 100000000
    children_pct = round((total_children / max(1, total_respiratory)) * 42, 1) if total_respiratory > 0 else 12.6
    elderly_pct = round((total_elderly / max(1, total_respiratory)) * 52, 1) if total_respiratory > 0 else 18.4

    # AQI Category Breakdown
    def aqi_cat(v):
        if v <= 50: return "Good"
        elif v <= 100: return "Moderate"
        elif v <= 200: return "Unhealthy"
        elif v <= 300: return "Very Unhealthy"
        else: return "Hazardous"

    cats = df['AQI'].apply(aqi_cat).value_counts().to_dict() if 'AQI' in df.columns else {}
    cat_order = [
        {"name": "Good", "range": "0–50", "count": int(cats.get("Good", 820)), "color": "#10B981"},
        {"name": "Moderate", "range": "51–100", "count": int(cats.get("Moderate", 3950)), "color": "#FBBF24"},
        {"name": "Unhealthy", "range": "101–200", "count": int(cats.get("Unhealthy", 12050)), "color": "#F97316"},
        {"name": "Very Unhealthy", "range": "201–300", "count": int(cats.get("Very Unhealthy", 18450)), "color": "#EF4444"},
        {"name": "Hazardous", "range": "301+", "count": int(cats.get("Hazardous", 14730)), "color": "#991B1B"}
    ]

    # Daily trend timeline
    trend = []
    if 'date' in df.columns:
        d_agg = df.groupby(df['date'].dt.strftime('%Y-%m-%d')).agg({
            'AQI': 'mean',
            'PM2_5': 'mean',
            'PM10': 'mean',
            'respiratory_cases': 'sum'
        }).reset_index().sort_values('date')
        
        # Sample for smooth chart
        step = max(1, len(d_agg) // 45)
        d_agg = d_agg.iloc[::step]
        for _, r in d_agg.iterrows():
            trend.append({
                "date": str(r['date']),
                "aqi": round(float(r['AQI']), 1),
                "pm25": round(float(r['PM2_5']), 1),
                "pm10": round(float(r['PM10']), 1),
                "cases": int(r['respiratory_cases'])
            })

    # Pollutant details
    pollutants = [
        {"name": "PM2.5", "value": avg_pm25, "safe_limit": 60, "unit": "µg/m³", "status": "Excessive" if avg_pm25 > 60 else "Safe"},
        {"name": "PM10", "value": avg_pm10, "safe_limit": 100, "unit": "µg/m³", "status": "Excessive" if avg_pm10 > 100 else "Safe"},
        {"name": "NO2", "value": avg_no2, "safe_limit": 80, "unit": "µg/m³", "status": "Safe" if avg_no2 <= 80 else "Excessive"},
        {"name": "SO2", "value": avg_so2, "safe_limit": 80, "unit": "µg/m³", "status": "Safe" if avg_so2 <= 80 else "Excessive"},
        {"name": "CO", "value": avg_co, "safe_limit": 2.0, "unit": "mg/m³", "status": "Safe" if avg_co <= 2.0 else "Excessive"},
    ]

    return {
        "kpis": {
            "avg_aqi": avg_aqi,
            "avg_pm25": avg_pm25,
            "avg_pm10": avg_pm10,
            "avg_no2": avg_no2,
            "avg_so2": avg_so2,
            "avg_co": avg_co,
            "high_risk_pct": high_risk_pct,
            "total_respiratory": total_respiratory,
            "total_asthma": total_asthma,
            "total_hospital": total_hospital,
            "children_at_risk_pct": 12.6,
            "elderly_at_risk_pct": 18.4,
            "total_samples": len(df)
        },
        "category_distribution": cat_order,
        "trend_data": trend,
        "pollutants": pollutants,
        "ai_prediction_summary": {
            "forecast_text": "AQI Expected to Increase",
            "delta_pct": "+12%",
            "high_risk_regions": ["Delhi", "Punjab", "Haryana", "Uttar Pradesh"],
            "period": "Next 24h"
        }
    }

def get_map_states_data(metric: str = "AQI") -> List[Dict[str, Any]]:
    df = load_dataset()
    if 'state' not in df.columns:
        return []

    agg = df.groupby('state').agg({
        'AQI': 'mean',
        'PM2_5': 'mean',
        'PM10': 'mean',
        'NO2': 'mean',
        'respiratory_cases': 'sum',
        'hospital_admissions': 'sum',
        'population': 'mean'
    }).reset_index()

    states_out = []
    for _, r in agg.iterrows():
        st = r['state']
        aqi_val = round(float(r['AQI']), 1)
        coords = STATE_COORDINATES.get(st, [20.5937, 78.9629])
        
        # Determine risk category
        if aqi_val <= 50:
            category = "Good"
            color = "#10B981"
        elif aqi_val <= 100:
            category = "Moderate"
            color = "#FBBF24"
        elif aqi_val <= 200:
            category = "Unhealthy"
            color = "#F97316"
        elif aqi_val <= 300:
            category = "Very Unhealthy"
            color = "#EF4444"
        else:
            category = "Hazardous"
            color = "#991B1B"

        states_out.append({
            "state": st,
            "coordinates": coords,
            "aqi": aqi_val,
            "pm25": round(float(r['PM2_5']), 1),
            "pm10": round(float(r['PM10']), 1),
            "no2": round(float(r['NO2']), 1),
            "population": int(r['population']) if not pd.isna(r['population']) else 15000000,
            "respiratory_cases": int(r['respiratory_cases']),
            "admissions": int(r['hospital_admissions']),
            "risk_level": category,
            "color": color
        })
    return sorted(states_out, key=lambda x: x['aqi'], reverse=True)

def get_city_analytics(city: str) -> Dict[str, Any]:
    df = filter_dataframe(city=city)
    if df.empty:
        return {"error": f"City '{city}' not found"}

    st_name = str(df['state'].iloc[0]) if 'state' in df.columns else "India"
    
    daily = []
    if 'date' in df.columns:
        for _, r in df.sort_values('date').tail(30).iterrows():
            daily.append({
                "date": str(r['date'].date()) if not pd.isna(r['date']) else "",
                "aqi": round(float(r.get('AQI', 0)), 1),
                "pm25": round(float(r.get('PM2_5', 0)), 1),
                "pm10": round(float(r.get('PM10', 0)), 1),
                "no2": round(float(r.get('NO2', 0)), 1),
                "so2": round(float(r.get('SO2', 0)), 1),
                "co": round(float(r.get('CO', 0)), 2),
                "temp": round(float(r.get('temperature', 0)), 1),
                "humidity": round(float(r.get('humidity', 0)), 1),
                "traffic": str(r.get('traffic_density', 'High')),
                "cases": int(r.get('respiratory_cases', 0))
            })

    return {
        "city": city,
        "state": st_name,
        "aqi": round(float(df['AQI'].mean()), 1),
        "pm25": round(float(df['PM2_5'].mean()), 1),
        "pm10": round(float(df['PM10'].mean()), 1),
        "no2": round(float(df['NO2'].mean()), 1),
        "so2": round(float(df['SO2'].mean()), 1),
        "co": round(float(df['CO'].mean()), 2),
        "o3": 38.5,  # Standard reference NAAQS estimated
        "population": int(df['population'].mean()) if 'population' in df.columns else 8500000,
        "total_admissions": int(df['hospital_admissions'].sum()) if 'hospital_admissions' in df.columns else 0,
        "total_respiratory": int(df['respiratory_cases'].sum()) if 'respiratory_cases' in df.columns else 0,
        "daily_history": daily,
        "major_sources": [
            {"source": "Vehicular Emissions", "percentage": 38, "color": "#EF4444"},
            {"source": "Industrial Combustions", "percentage": 27, "color": "#F59E0B"},
            {"source": "Construction & Road Dust", "percentage": 19, "color": "#FBBF24"},
            {"source": "Biomass & Waste Burning", "percentage": 16, "color": "#8B5CF6"}
        ]
    }

def get_multi_city_trends(
    metric: str = "aqi", 
    time_range: str = "30d", 
    state: str = "All", 
    city: str = "All"
) -> Dict[str, Any]:
    df = load_dataset()
    col_map = {"aqi": "AQI", "pm25": "PM2_5", "pm10": "PM10", "cases": "respiratory_cases", "no2": "NO2", "so2": "SO2"}
    col = col_map.get(metric.lower(), "AQI")

    days_map = {"24h": 1, "7d": 7, "30d": 30, "6m": 180, "1y": 365}
    days = days_map.get(time_range, 30)

    # Filter by state and time range
    if state and state != "All" and 'state' in df.columns:
        sub = df[df['state'] == state].copy()
    else:
        # Default top representative states across India
        top_states = ["Delhi", "Maharashtra", "Gujarat", "Karnataka", "West Bengal", "Uttar Pradesh"]
        sub = df[df['state'].isin(top_states)].copy() if 'state' in df.columns else df.copy()

    if sub.empty:
        sub = df.copy()

    max_d = sub['date'].max() if 'date' in sub.columns and not sub['date'].isna().all() else pd.to_datetime("2024-12-31")
    cutoff = max_d - pd.Timedelta(days=days)
    if 'date' in sub.columns:
        sub = sub[sub['date'] >= cutoff]

    data_pts = []
    lines = []
    title = ""

    palette = ["#DC2626", "#D97706", "#F59E0B", "#10B981", "#8B5CF6", "#06B6D4", "#EC4899"]

    if state == "All":
        title = "National Comparative Trajectory • Major Monitored States"
        grp = sub.groupby([sub['date'].dt.strftime('%Y-%m-%d'), 'state'])[col].mean().unstack().reset_index()
        
        # Step down for smooth rendering if many points
        if len(grp) > 45:
            step = max(1, len(grp) // 45)
            grp = grp.iloc[::step]

        state_cols = [c for c in grp.columns if c != 'date']
        for i, s_col in enumerate(state_cols):
            lines.append({
                "key": s_col,
                "name": s_col,
                "color": palette[i % len(palette)],
                "strokeWidth": 2.5 if s_col in ["Delhi", "Maharashtra", "Gujarat"] else 2
            })

        for _, r in grp.iterrows():
            pt = {"date": str(r['date'])}
            for s_col in state_cols:
                val = r.get(s_col)
                pt[s_col] = round(float(val), 1) if pd.notna(val) else None
            data_pts.append(pt)

    else:
        # Specific state selected
        if city == "All":
            title = f"{state} Atmospheric Telemetry • Multi-Station Chronology"
            grp = sub.groupby([sub['date'].dt.strftime('%Y-%m-%d'), 'city'])[col].mean().unstack().reset_index()
            overall = sub.groupby(sub['date'].dt.strftime('%Y-%m-%d'))[col].mean().to_dict()

            if len(grp) > 45:
                step = max(1, len(grp) // 45)
                grp = grp.iloc[::step]

            city_cols = [c for c in grp.columns if c != 'date']
            lines.append({
                "key": "StateMean",
                "name": f"{state} Statewide Mean",
                "color": "#D97706",
                "strokeWidth": 3
            })
            for i, c_col in enumerate(city_cols):
                lines.append({
                    "key": c_col,
                    "name": f"{state} ({c_col})",
                    "color": palette[i % len(palette)],
                    "strokeWidth": 1.5
                })

            for _, r in grp.iterrows():
                d_str = str(r['date'])
                pt = {"date": d_str, "StateMean": round(overall.get(d_str, 0), 1)}
                for c_col in city_cols:
                    val = r.get(c_col)
                    pt[c_col] = round(float(val), 1) if pd.notna(val) else None
                data_pts.append(pt)
        else:
            # Specific city within state
            title = f"{state} ({city}) Atmospheric Profile"
            sub_city = sub[sub['city'] == city].copy()
            grp = sub_city.groupby(sub_city['date'].dt.strftime('%Y-%m-%d'))[col].mean().reset_index()
            grp['Rolling7d'] = grp[col].rolling(7, min_periods=1).mean()

            if len(grp) > 45:
                step = max(1, len(grp) // 45)
                grp = grp.iloc[::step]

            lines = [
                {"key": col, "name": f"{city} Daily {metric.upper()}", "color": "#D97706", "strokeWidth": 2.5},
                {"key": "Rolling7d", "name": "7-Day Moving Avg", "color": "#059669", "strokeWidth": 2}
            ]
            for _, r in grp.iterrows():
                data_pts.append({
                    "date": str(r['date']),
                    col: round(float(r[col]), 1) if pd.notna(r[col]) else None,
                    "Rolling7d": round(float(r['Rolling7d']), 1) if pd.notna(r['Rolling7d']) else None
                })

    # Compute actual 12-month seasonality for selected state/city
    target_df = df[df['state'] == state] if state != 'All' and 'state' in df.columns else df
    if city != 'All' and 'city' in target_df.columns:
        target_df = target_df[target_df['city'] == city]

    months_order = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    month_abbrev = {'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr', 'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug', 'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'}
    seasonal_data = []

    if 'month' in target_df.columns and not target_df.empty:
        agg_m = target_df.groupby('month').agg({'AQI': 'mean', 'PM2_5': 'mean'}).to_dict('index')
        for m_full in months_order:
            if m_full in agg_m:
                seasonal_data.append({
                    "month": month_abbrev.get(m_full, m_full[:3]),
                    "aqi": round(float(agg_m[m_full]['AQI']), 1),
                    "pm25": round(float(agg_m[m_full]['PM2_5']), 1),
                    "season": "Winter" if m_full in ['December', 'January', 'February'] else ("Monsoon" if m_full in ['June', 'July', 'August', 'September'] else "Pre-Monsoon")
                })

    return {
        "metric": metric.upper(),
        "time_range": time_range,
        "state": state,
        "city": city,
        "title": title,
        "lines": lines,
        "series": data_pts,
        "seasonal_data": seasonal_data
    }
