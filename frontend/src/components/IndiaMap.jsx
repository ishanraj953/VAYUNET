import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Wind, 
  Activity, 
  Users, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import api from '../api/axios';

export default function IndiaMap({ onSelectState }) {
  const [statesData, setStatesData] = useState([]);
  const [activeMetric, setActiveMetric] = useState('AQI'); // 'AQI' | 'PM2.5' | 'PM10' | 'Risk'
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetchStates();
  }, [activeMetric]);

  const fetchStates = async () => {
    try {
      const res = await api.get('/pollution/states');
      setStatesData(res.data);
    } catch (e) {
      console.error('Failed to load state map data:', e);
    }
  };

  const getMetricVal = (stateObj) => {
    if (!stateObj) return 0;
    if (activeMetric === 'PM2.5') return stateObj.pm25;
    if (activeMetric === 'PM10') return stateObj.pm10;
    return stateObj.aqi;
  };

  const filteredStates = statesData.filter(s =>
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card-white rounded-2xl p-5 space-y-4">
      {/* Top Map Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F2E8D5]">
        <div>
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Interactive All-India Geospatial Pollution Matrix</span>
          </h3>
          <p className="text-xs text-stone-500">Live regional particulate distribution & population exposure</p>
        </div>

        {/* Metric Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-32"
            />
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl p-1 space-x-1">
            {['AQI', 'PM2.5', 'PM10', 'Risk'].map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeMetric === m
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Zoom & Reset Controls */}
          <div className="flex items-center space-x-1 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl p-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
              className="p-1 text-stone-600 hover:text-amber-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="p-1 text-stone-600 hover:text-amber-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setSearchTerm(''); }}
              className="p-1 text-stone-600 hover:text-amber-700 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Layout Area: Interactive State Grid Matrix + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive State Cluster Grid (3 cols) */}
        <div className="lg:col-span-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl p-4 min-h-[420px] relative overflow-hidden flex flex-col justify-between">
          {/* Zoom Wrapper */}
          <div 
            className="transition-transform duration-300 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredStates.map((st) => {
                const val = getMetricVal(st);
                return (
                  <div
                    key={st.state}
                    onMouseEnter={() => setHoveredState(st)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => {
                      setSelectedState(st);
                      if (onSelectState) onSelectState(st.state);
                    }}
                    className="p-3 bg-white border border-[#EBE1CD] hover:border-amber-400 hover:shadow-md rounded-xl cursor-pointer transition-all duration-200 relative group"
                    style={{ borderLeftWidth: '4px', borderLeftColor: st.color }}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-stone-800 group-hover:text-amber-700 truncate pr-1">
                        {st.state}
                      </h4>
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded" style={{ backgroundColor: `${st.color}20`, color: st.color }}>
                        {st.risk_level}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-lg font-black text-stone-900 font-mono">
                        {val}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {activeMetric === 'AQI' ? 'AQI' : 'µg/m³'}
                      </span>
                    </div>

                    <div className="mt-1 text-[10px] text-stone-500 flex justify-between">
                      <span>PM2.5: {st.pm25}</span>
                      <span>PM10: {st.pm10}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hovered State Tooltip Overlay if active */}
          {hoveredState && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md border border-amber-300 rounded-xl p-3 shadow-lg text-xs space-y-1 z-20 pointer-events-none animate-in fade-in-50 duration-150">
              <p className="font-extrabold text-stone-900 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredState.color }}></span>
                <span>{hoveredState.state}</span>
              </p>
              <div className="grid grid-cols-2 gap-x-3 text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                <span>AQI: <strong className="text-stone-900">{hoveredState.aqi}</strong></span>
                <span>PM2.5: <strong className="text-stone-900">{hoveredState.pm25} µg/m³</strong></span>
                <span>PM10: <strong className="text-stone-900">{hoveredState.pm10} µg/m³</strong></span>
                <span>Pop: <strong className="text-stone-900">{(hoveredState.population / 1000000).toFixed(1)}M</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Legend & Categories Side Panel (1 col) */}
        <div className="bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              Standard AQI Health Tiers
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EBE1CD]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                  <span className="font-medium text-stone-700">Good</span>
                </div>
                <span className="font-mono text-stone-500 font-bold">0–50</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EBE1CD]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#FBBF24]"></span>
                  <span className="font-medium text-stone-700">Moderate</span>
                </div>
                <span className="font-mono text-stone-500 font-bold">51–100</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EBE1CD]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#F97316]"></span>
                  <span className="font-medium text-stone-700">Unhealthy</span>
                </div>
                <span className="font-mono text-stone-500 font-bold">101–200</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EBE1CD]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                  <span className="font-medium text-stone-700">Very Unhealthy</span>
                </div>
                <span className="font-mono text-stone-500 font-bold">201–300</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EBE1CD]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#991B1B]"></span>
                  <span className="font-medium text-stone-700">Hazardous</span>
                </div>
                <span className="font-mono text-stone-500 font-bold">301+</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
            <span className="font-bold text-amber-900 block">Quick Tip:</span>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Click on any state card to open the dedicated diagnostic dossier and city pollution rankings.
            </p>
          </div>
        </div>
      </div>

      {/* Selected State Modal Dialog */}
      {selectedState && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE0CA] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedState.color }}></span>
                <h3 className="text-base font-extrabold text-stone-900">
                  {selectedState.state} State Intelligence Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedState(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <p className="text-stone-500">Average State AQI</p>
                <p className="text-2xl font-black text-stone-900 mt-1">{selectedState.aqi}</p>
                <span className="text-[10px] font-bold text-red-600">{selectedState.risk_level}</span>
              </div>
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <p className="text-stone-500">PM 2.5 Concentration</p>
                <p className="text-2xl font-black text-stone-900 mt-1">{selectedState.pm25} <span className="text-xs font-normal">µg/m³</span></p>
                <span className="text-[10px] text-stone-500">Safe Limit: 60 µg/m³</span>
              </div>
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <p className="text-stone-500">Attributed Hospital Surges</p>
                <p className="text-xl font-black text-stone-900 mt-1">{selectedState.admissions?.toLocaleString()}</p>
                <span className="text-[10px] text-stone-500">Admissions recorded</span>
              </div>
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <p className="text-stone-500">Population Exposed</p>
                <p className="text-xl font-black text-stone-900 mt-1">{(selectedState.population / 1000000).toFixed(1)} Million</p>
                <span className="text-[10px] text-stone-500">Citizens monitored</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedState(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
