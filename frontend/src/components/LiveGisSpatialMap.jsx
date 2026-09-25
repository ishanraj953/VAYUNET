import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip, useMap } from 'react-leaflet';
import { 
  MapPin, 
  Search, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Activity, 
  Wind, 
  HeartPulse, 
  ShieldAlert, 
  Radio, 
  Layers, 
  Sparkles, 
  Flame, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Clock,
  Thermometer,
  Droplets,
  ExternalLink,
  ChevronRight,
  Info,
  Filter
} from 'lucide-react';
import api from '../api/axios';

// Component to dynamically pan/zoom Leaflet map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Preset Regional Spatial Extents
const REGIONS = [
  { name: 'All India', center: [22.5937, 78.9629], zoom: 5 },
  { name: 'Delhi-NCR Hotspot', center: [28.6139, 77.2090], zoom: 10 },
  { name: 'Indo-Gangetic Plain', center: [26.4499, 81.3200], zoom: 7 },
  { name: 'Western Industrial', center: [19.7515, 73.8567], zoom: 7 },
  { name: 'Southern Tech Hubs', center: [13.0827, 77.5877], zoom: 7 },
  { name: 'Eastern Corridor', center: [22.9868, 87.8550], zoom: 7 },
  { name: 'Himalayan & North-East', center: [27.0844, 93.6053], zoom: 6 }
];

export default function LiveGisSpatialMap({ onSelectStation }) {
  const [gisData, setGisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveStreaming, setLiveStreaming] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('');
  
  // State & City Live Filters
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // View controls
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedRegion, setSelectedRegion] = useState('All India');
  const [activeMetric, setActiveMetric] = useState('AQI'); // 'AQI' | 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'CO'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Layer toggles
  const [showHeatCircles, setShowHeatCircles] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showSevereOnly, setShowSevereOnly] = useState(false);
  
  const [directLiveMode, setDirectLiveMode] = useState(true);

  // Selected station drawer state
  const [selectedStation, setSelectedStation] = useState(null);

  // Fetch GIS telemetry from API
  const fetchGisTelemetry = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/pollution/gis/live-stations', {
        params: {
          state: selectedState,
          city: selectedCity,
          metric: activeMetric,
          live_feed: directLiveMode
        }
      });
      setGisData(res.data);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch GIS live stations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGisTelemetry();
  }, [selectedState, selectedCity, directLiveMode]);

  // Real-time live polling every 5 seconds if liveStreaming is active
  useEffect(() => {
    let interval = null;
    if (liveStreaming) {
      interval = setInterval(() => {
        fetchGisTelemetry(true);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveStreaming, selectedState, selectedCity, activeMetric, directLiveMode]);

  const handleRegionChange = (region) => {
    setSelectedRegion(region.name);
    setSelectedState('All');
    setSelectedCity('All');
    setMapCenter(region.center);
    setMapZoom(region.zoom);
  };

  const handleStateChange = (st) => {
    setSelectedState(st);
    setSelectedCity('All');
    setSelectedRegion('Custom');
    
    // Auto center on selected state if stations available
    if (st !== 'All' && gisData?.stations) {
      const stObj = gisData.stations.find(s => s.state === st);
      if (stObj) {
        setMapCenter([stObj.lat, stObj.lng]);
        setMapZoom(7);
      }
    } else if (st === 'All') {
      setMapCenter([22.5937, 78.9629]);
      setMapZoom(5);
    }
  };

  const handleCityChange = (c) => {
    setSelectedCity(c);
    if (c !== 'All' && gisData?.stations) {
      const cityObj = gisData.stations.find(s => s.city === c);
      if (cityObj) {
        setMapCenter([cityObj.lat, cityObj.lng]);
        setMapZoom(11);
        setSelectedStation(cityObj);
      }
    }
  };

  const getMetricValue = (st) => {
    if (activeMetric === 'PM2.5') return `${st.pm25} µg/m³`;
    if (activeMetric === 'PM10') return `${st.pm10} µg/m³`;
    if (activeMetric === 'NO2') return `${st.no2} µg/m³`;
    if (activeMetric === 'SO2') return `${st.so2} µg/m³`;
    if (activeMetric === 'CO') return `${st.co} mg/m³`;
    return st.aqi;
  };

  const stations = gisData?.stations || [];
  const availableStates = gisData?.available_states || [];
  const availableCities = gisData?.available_cities || [];

  // Filter cities corresponding to current state
  const stateFilteredCities = selectedState === 'All' 
    ? availableCities 
    : Array.from(new Set(stations.filter(s => s.state === selectedState).map(s => s.city)));

  const filteredStations = stations.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSevere = showSevereOnly ? st.aqi >= 201 : true;
    return matchesSearch && matchesSevere;
  });

  return (
    <div className="space-y-4">
      {/* Top GIS Control & Live Telemetry Bar */}
      <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F2E8D5]">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-200">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-stone-900 uppercase tracking-tight">
                  All-India Live Geospatial Pollution Surveillance Grid
                </h3>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Telemetry (36 States & UTs)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time CAAQMS environmental monitoring stations, micro-meteorology, and public health risk corridors across all Indian states and cities.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Live Polling Switch */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setLiveStreaming(!liveStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                liveStreaming 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-stone-100 text-stone-600 border-stone-300'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${liveStreaming ? 'text-emerald-600 animate-spin' : ''}`} />
              {liveStreaming ? 'Live Stream Active (5s)' : 'Stream Paused'}
            </button>

            <button
              onClick={() => fetchGisTelemetry(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 bg-[#FFFDF5] hover:bg-amber-50 border border-[#E0D5BE] transition cursor-pointer"
              title="Manual Sync"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sync Now
            </button>

            {lastSyncTime && (
              <span className="text-[11px] font-mono text-stone-400">
                Last: {lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* State & City Live Selector Dropdowns + Regional Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* State Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> Select State / UT ({availableStates.length}):
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All 36 States & Union Territories</option>
              {availableStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" /> Select City / Node ({stateFilteredCities.length}):
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Monitored Cities</option>
              {stateFilteredCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector Pills */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-600" /> Active Map Metric:
            </label>
            <div className="flex items-center bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl p-0.5 space-x-0.5">
              {['AQI', 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO'].map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer flex-1 text-center ${
                    activeMetric === m
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Live Search Box */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
              <Search className="w-3 h-3 text-stone-400" /> Quick Search:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search station or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Regional Quick Zoom Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-black text-stone-400 uppercase tracking-wider mr-1">Hotspot Zones:</span>
          {REGIONS.map((r) => (
            <button
              key={r.name}
              onClick={() => handleRegionChange(r)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                selectedRegion === r.name
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-[#FFFDF5] text-stone-600 border border-[#EBE1CD] hover:border-amber-300 hover:text-stone-900'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Layer Toggles and National Quick Stat Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-[#F5EEDC]">
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <span className="font-bold text-stone-900">Map Layers:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showHeatCircles}
                onChange={(e) => setShowHeatCircles(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Spatial AQI Heat Zones</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showStations}
                onChange={(e) => setShowStations(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>CAAQMS Sensor Nodes ({filteredStations.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSevereOnly}
                onChange={(e) => setShowSevereOnly(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-red-700 font-bold">Severe Hotspots Only</span>
            </label>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-stone-500">
              Active Monitored Stations: <strong className="text-stone-900">{gisData?.total_active_stations || 50}</strong>
            </span>
            <span className="text-stone-500">
              Mean Ambient AQI: <strong className="text-amber-700">{gisData?.national_mean_aqi || 215.0}</strong>
            </span>
            <span className="text-red-600 font-bold">
              Critical Emergency Hotspots: {gisData?.severe_emergency_hotspots || 12}
            </span>
          </div>
        </div>
      </div>

      {/* Main Map & Live Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet GIS Interactive Map Area (3 Cols) */}
        <div className="lg:col-span-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl p-2 relative overflow-hidden shadow-sm h-[600px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 bg-[#FFFDF5]">
              <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-stone-600">Syncing Pan-India Real-Time CAAQMS Telemetry...</p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="h-full w-full rounded-xl"
              style={{ minHeight: '580px', background: '#F8F6F0' }}
            >
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* High-contrast Clean Map Tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Spatial AQI Heat Circles */}
              {showHeatCircles && filteredStations.map((st) => (
                <Circle
                  key={`heat-${st.id}`}
                  center={st.coordinates}
                  radius={st.heat_radius_meters || 25000}
                  pathOptions={{
                    fillColor: st.color,
                    fillOpacity: st.aqi > 300 ? 0.35 : 0.22,
                    color: st.color,
                    weight: 1,
                    opacity: 0.6
                  }}
                />
              ))}

              {/* Point CAAQMS Monitoring Station Nodes */}
              {showStations && filteredStations.map((st) => {
                const isSevere = st.aqi > 300;
                const isSelected = selectedStation?.id === st.id;
                const metricVal = getMetricValue(st);

                return (
                  <CircleMarker
                    key={st.id}
                    center={st.coordinates}
                    radius={isSelected ? 11 : (isSevere ? 9 : 7)}
                    pathOptions={{
                      fillColor: st.color,
                      fillOpacity: 0.95,
                      color: isSelected ? '#1E293B' : (isSevere ? '#FFFFFF' : '#334155'),
                      weight: isSelected ? 3 : 2,
                      opacity: 1
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedStation(st);
                        if (onSelectStation) onSelectStation(st);
                      }
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                      <div className="p-1 font-sans text-xs">
                        <div className="font-extrabold text-stone-900">{st.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-amber-700">{activeMetric}: {metricVal}</span>
                          <span className="text-[10px] px-1 py-0.5 rounded text-white font-black" style={{ backgroundColor: st.color }}>
                            {st.category}
                          </span>
                        </div>
                      </div>
                    </Tooltip>

                    <Popup>
                      <div className="p-3.5 space-y-3 font-sans w-72 text-stone-900">
                        {/* Popup Header */}
                        <div className="flex items-start justify-between border-b border-stone-200 pb-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">{st.id} • {st.agency}</span>
                            <h4 className="text-sm font-extrabold text-stone-900 leading-tight">{st.name}</h4>
                            <p className="text-[11px] text-stone-500">{st.city}, {st.state} ({st.zone})</p>
                          </div>
                          <span 
                            className="px-2 py-1 rounded-lg text-[11px] font-black text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: st.color }}
                          >
                            AQI {st.aqi}
                          </span>
                        </div>

                        {/* Pollutants Matrix */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                            <span className="text-stone-400 block font-bold">PM2.5</span>
                            <strong className="text-stone-900 font-mono text-xs">{st.pm25}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                            <span className="text-stone-400 block font-bold">PM10</span>
                            <strong className="text-stone-900 font-mono text-xs">{st.pm10}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                            <span className="text-stone-400 block font-bold">NO2</span>
                            <strong className="text-stone-900 font-mono text-xs">{st.no2}</strong>
                          </div>
                        </div>

                        {/* Meteorology & Hospital Surge Alert */}
                        <div className="text-[11px] space-y-1.5 pt-1 border-t border-stone-100">
                          <div className="flex items-center justify-between text-stone-600">
                            <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-blue-500" /> Wind Speed:</span>
                            <strong className="font-mono text-stone-900">{st.meteorology?.wind_speed_kmh} km/h</strong>
                          </div>
                          <div className="flex items-center justify-between text-stone-600">
                            <span className="flex items-center gap-1"><HeartPulse className="w-3 h-3 text-red-500" /> Hospital Surge:</span>
                            <strong className="text-red-700 font-bold">{st.hospital_surge}</strong>
                          </div>
                          <div className="flex items-center justify-between text-stone-600">
                            <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-amber-500" /> GRAP Status:</span>
                            <span className="font-bold text-amber-900">{st.grap_stage}</span>
                          </div>
                        </div>

                        {/* Button to view full dossier */}
                        <button
                          onClick={() => setSelectedStation(st)}
                          className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          Open Detailed Sensor Telemetry
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}

          {/* Floating AQI Scale Legend on Map */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-[#EAE0CA] rounded-xl p-3 shadow-lg z-20 text-[11px] space-y-1.5 pointer-events-auto">
            <span className="font-black text-stone-800 uppercase tracking-wider block">AQI Risk Tier</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
              <span className="text-stone-700">Good (0–50)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FBBF24]"></span>
              <span className="text-stone-700">Moderate (51–100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F97316]"></span>
              <span className="text-stone-700">Unhealthy (101–200)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
              <span className="text-stone-700">Very Unhealthy (201–300)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#991B1B]"></span>
              <span className="text-stone-700">Hazardous (301+)</span>
            </div>
          </div>
        </div>

        {/* Live Station Telemetry & Emergency Hotspots Side Panel (1 Col) */}
        <div className="bg-[#FFFDF5] border border-[#F2E8D5] rounded-2xl p-4 flex flex-col justify-between space-y-4 h-[600px] overflow-hidden">
          <div className="space-y-3 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-[#F2E8D5] pb-2">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                Live Reporting Stream
              </h4>
              <span className="text-[10px] font-mono text-stone-400 font-bold">{filteredStations.length} nodes</span>
            </div>

            {/* List of active stations */}
            <div className="space-y-2">
              {filteredStations.slice(0, 8).map((st) => (
                <div
                  key={st.id}
                  onClick={() => {
                    setSelectedStation(st);
                    setMapCenter(st.coordinates);
                    setMapZoom(12);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedStation?.id === st.id
                      ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-white border-[#EBE1CD] hover:border-amber-300 hover:bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="pr-1 truncate">
                      <h5 className="text-xs font-bold text-stone-900 truncate">{st.name}</h5>
                      <span className="text-[10px] text-stone-500">{st.city}, {st.state}</span>
                    </div>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-black text-white shrink-0 font-mono"
                      style={{ backgroundColor: st.color }}
                    >
                      {st.aqi}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>PM2.5: {st.pm25}</span>
                    <span>PM10: {st.pm10}</span>
                    <span className="text-red-600 font-bold">{st.grap_stage.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Selected Station Brief Footer */}
          {selectedStation ? (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-1.5 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-950 truncate">{selectedStation.name}</span>
                <span className="text-[10px] font-mono font-bold text-amber-800">AQI {selectedStation.aqi}</span>
              </div>
              <p className="text-[11px] text-amber-800 line-clamp-1">
                Hospital: {selectedStation.hospitals_nearby?.[0] || 'District Civil Hospital'}
              </p>
              <div className="text-[10px] text-amber-900 font-bold flex justify-between">
                <span>{selectedStation.risk_label}</span>
                <span className="text-emerald-700">{selectedStation.status.split(' ')[0]}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 text-center">
              Click any node on the map to inspect live CAAQMS sensor telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Full Station Diagnostic Modal Dialog */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE0CA] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl text-white shadow-sm" style={{ backgroundColor: selectedStation.color }}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    {selectedStation.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedStation.id} • {selectedStation.city}, {selectedStation.state} ({selectedStation.zone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Main AQI & Health Severity Banner */}
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: `${selectedStation.color}15`, border: `1px solid ${selectedStation.color}40` }}>
              <div>
                <span className="text-xs font-bold text-stone-600">Current Ambient AQI Reading</span>
                <div className="text-3xl font-black font-mono text-stone-900 mt-0.5">
                  {selectedStation.aqi} <span className="text-xs font-bold" style={{ color: selectedStation.color }}>({selectedStation.category})</span>
                </div>
                <p className="text-xs font-medium text-stone-700 mt-1">{selectedStation.risk_label}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black text-white uppercase shadow-xs" style={{ backgroundColor: selectedStation.color }}>
                  {selectedStation.grap_stage}
                </span>
                <p className="text-[11px] text-stone-500 mt-2 font-mono">{selectedStation.last_sync}</p>
              </div>
            </div>

            {/* Pollutant Sensor Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Live Chemical Telemetry</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
                <div className="p-2.5 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                  <span className="text-stone-400 block font-bold text-[10px]">PM2.5</span>
                  <strong className="text-base font-mono text-stone-900">{selectedStation.pm25}</strong>
                  <span className="text-[9px] text-stone-400 block">µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                  <span className="text-stone-400 block font-bold text-[10px]">PM10</span>
                  <strong className="text-base font-mono text-stone-900">{selectedStation.pm10}</strong>
                  <span className="text-[9px] text-stone-400 block">µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                  <span className="text-stone-400 block font-bold text-[10px]">NO2</span>
                  <strong className="text-base font-mono text-stone-900">{selectedStation.no2}</strong>
                  <span className="text-[9px] text-stone-400 block">µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                  <span className="text-stone-400 block font-bold text-[10px]">SO2</span>
                  <strong className="text-base font-mono text-stone-900">{selectedStation.so2}</strong>
                  <span className="text-[9px] text-stone-400 block">µg/m³</span>
                </div>
                <div className="p-2.5 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                  <span className="text-stone-400 block font-bold text-[10px]">CO</span>
                  <strong className="text-base font-mono text-stone-900">{selectedStation.co}</strong>
                  <span className="text-[9px] text-stone-400 block">mg/m³</span>
                </div>
              </div>
            </div>

            {/* Meteorology & Hospital Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl space-y-1.5">
                <span className="font-bold text-stone-800 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-blue-500" /> Atmospheric Telemetry
                </span>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Wind Speed:</span> <strong className="text-stone-900">{selectedStation.meteorology?.wind_speed_kmh} km/h</strong>
                </div>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Temperature:</span> <strong className="text-stone-900">{selectedStation.meteorology?.temperature_c} °C</strong>
                </div>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Relative Humidity:</span> <strong className="text-stone-900">{selectedStation.meteorology?.humidity_pct} %</strong>
                </div>
              </div>

              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl space-y-1.5">
                <span className="font-bold text-stone-800 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-red-500" /> Hospital Surveillance
                </span>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Surge Level:</span> <strong className="text-red-700">{selectedStation.hospital_surge}</strong>
                </div>
                <div className="text-[11px] text-stone-600">
                  <span>Emergency Facilities:</span>
                  <ul className="list-disc list-inside text-[10px] text-stone-700 mt-1 font-medium">
                    {selectedStation.hospitals_nearby?.map((h, i) => (
                      <li key={i} className="truncate">{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedStation(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close Station Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
