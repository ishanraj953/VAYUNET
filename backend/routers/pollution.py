from fastapi import APIRouter, Query
from typing import Optional
from backend.services.data_service import (
    get_metadata,
    get_national_overview,
    get_map_states_data,
    get_city_analytics,
    filter_dataframe,
    load_dataset,
    get_state_comparison
)
from backend.services.gis_service import get_live_gis_telemetry

router = APIRouter(prefix="/api/pollution", tags=["Pollution Intelligence"])

@router.get("/compare")
def compare_states_endpoint(
    stateA: Optional[str] = "Delhi",
    stateB: Optional[str] = "Maharashtra",
    metric: Optional[str] = "AQI",
    time_range: Optional[str] = "30d"
):
    return get_state_comparison(stateA=stateA, stateB=stateB, metric=metric, time_range=time_range)

@router.get("/meta")
def meta_endpoint():
    return get_metadata()

@router.get("/national")
def national_endpoint(
    state: Optional[str] = "All",
    city: Optional[str] = "All",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    return get_national_overview(state=state, city=city, start_date=start_date, end_date=end_date)

@router.get("/states")
def states_endpoint(metric: Optional[str] = "AQI"):
    return get_map_states_data(metric=metric)

from backend.services.live_api_service import fetch_live_coordinates_telemetry

@router.get("/gis/live-stations")
def gis_live_stations_endpoint(
    state: Optional[str] = "All",
    city: Optional[str] = "All",
    metric: Optional[str] = "AQI",
    live_feed: Optional[bool] = False
):
    """
    Returns real-time geospatial telemetry for Pan-India CAAQMS monitoring stations across all 36 States and Union Territories.
    """
    return get_live_gis_telemetry(state_filter=state, city_filter=city, metric=metric, fetch_direct_live=bool(live_feed))

@router.get("/live-coordinate")
def live_coordinate_endpoint(lat: float = 28.6139, lng: float = 77.2090):
    """
    Directly queries real-time open satellite & station API over HTTP for any latitude & longitude in India.
    """
    res = fetch_live_coordinates_telemetry(lat, lng)
    if res:
        return res
    return {"error": "Could not fetch live telemetry for coordinates", "lat": lat, "lng": lng}

@router.get("/states/{state}")
def single_state_endpoint(state: str):
    df = filter_dataframe(state=state)
    if df.empty:
        return {"error": f"State '{state}' not found"}
    
    cities = sorted(df['city'].dropna().unique().tolist())
    avg_aqi = round(float(df['AQI'].mean()), 1)
    return {
        "state": state,
        "cities": cities,
        "avg_aqi": avg_aqi,
        "avg_pm25": round(float(df['PM2_5'].mean()), 1),
        "avg_pm10": round(float(df['PM10'].mean()), 1),
        "total_cases": int(df['respiratory_cases'].sum()),
        "population": int(df['population'].mean()) if 'population' in df.columns else 25000000
    }

@router.get("/cities")
def cities_list_endpoint():
    df = load_dataset()
    cities = []
    if 'city' in df.columns:
        agg = df.groupby('city').agg({
            'state': 'first',
            'AQI': 'mean',
            'PM2_5': 'mean',
            'PM10': 'mean',
            'respiratory_cases': 'sum'
        }).reset_index().sort_values('AQI', ascending=False)
        for _, r in agg.iterrows():
            cities.append({
                "city": r['city'],
                "state": r['state'],
                "aqi": round(float(r['AQI']), 1),
                "pm25": round(float(r['PM2_5']), 1),
                "pm10": round(float(r['PM10']), 1),
                "respiratory_cases": int(r['respiratory_cases'])
            })
    return cities

@router.get("/cities/{city}")
def single_city_endpoint(city: str, state: Optional[str] = Query(None)):
    return get_city_analytics(city=city, state=state)
