import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Car, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Hospital
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function CityDeepDiveView({ metadata, selectedCity, onSelectCity }) {
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCity, setActiveCity] = useState(selectedCity !== 'All' ? selectedCity : 'Delhi');

  useEffect(() => {
    if (selectedCity && selectedCity !== 'All') {
      setActiveCity(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchCityDetail(activeCity);
  }, [activeCity]);

  const fetchCityDetail = async (cityName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/city-detail?city=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      setCityData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityName) => {
    setActiveCity(cityName);
    if (onSelectCity) onSelectCity(cityName);
  };

  return (
    <div className="space-y-6">
      {/* City Selector Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <span>{activeCity} Urban Air Telemetry</span>
              <span className="text-xs font-mono font-bold bg-[#1e202c] text-zinc-400 px-2 py-0.5 rounded">
                {cityData?.state || 'India'}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Micro-climate diagnostics and local health load</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#090a0f] border border-[#262837] rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-zinc-400">Select City:</span>
          <select
            value={activeCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            {metadata.cities?.filter(c => c !== 'All').map(c => (
              <option key={c} value={c} className="bg-[#121319] text-white">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : cityData && !cityData.error ? (
        <>
          {/* City Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="City Mean AQI"
              value={cityData.avg_aqi}
              unit="AQI"
              subtitle={`Min: ${cityData.min_aqi} | Max: ${cityData.max_aqi}`}
              icon={Activity}
              color={cityData.avg_aqi > 200 ? "red" : "yellow"}
            />
            <MetricCard
              title="PM 2.5 Level"
              value={cityData.avg_pm25}
              unit="µg/m³"
              subtitle="Fine particulate density"
              icon={TrendingUp}
              color="yellow"
            />
            <MetricCard
              title="PM 10 Level"
              value={cityData.avg_pm10}
              unit="µg/m³"
              subtitle="Coarse particulate density"
              icon={Activity}
              color="yellow"
            />
            <MetricCard
              title="Hospital Admissions"
              value={cityData.total_admissions}
              unit="Patients"
              subtitle="Aggregated healthcare load"
              icon={Hospital}
              color="red"
            />
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Telemetry Progression for {activeCity}</span>
                </h3>
                <p className="text-xs text-zinc-400">AQI vs PM2.5 vs PM10 chronological readings</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cityData.daily_records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="aqi" stroke="#f59e0b" strokeWidth={2} fill="url(#aqiGrad)" name="AQI" />
                  <Area type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2} fill="url(#pm25Grad)" name="PM2.5" />
                  <Area type="monotone" dataKey="pm10" stroke="#facc15" strokeWidth={1.5} fill="none" name="PM10" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Micro-climate and Pollutants grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pollutants Breakdown */}
            <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Gas & Chemical Concentrations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#171922] rounded-xl border border-[#262837]">
                  <p className="text-[11px] text-zinc-400">Nitrogen Dioxide (NO₂)</p>
                  <p className="text-lg font-mono font-bold text-amber-400 mt-1">{cityData.avg_no2} <span className="text-xs font-normal text-zinc-400">µg/m³</span></p>
                </div>
                <div className="p-3 bg-[#171922] rounded-xl border border-[#262837]">
                  <p className="text-[11px] text-zinc-400">Sulphur Dioxide (SO₂)</p>
                  <p className="text-lg font-mono font-bold text-amber-400 mt-1">{cityData.avg_so2} <span className="text-xs font-normal text-zinc-400">µg/m³</span></p>
                </div>
                <div className="p-3 bg-[#171922] rounded-xl border border-[#262837]">
                  <p className="text-[11px] text-zinc-400">Carbon Monoxide (CO)</p>
                  <p className="text-lg font-mono font-bold text-red-400 mt-1">{cityData.avg_co} <span className="text-xs font-normal text-zinc-400">mg/m³</span></p>
                </div>
                <div className="p-3 bg-[#171922] rounded-xl border border-[#262837]">
                  <p className="text-[11px] text-zinc-400">Hospital Load Density</p>
                  <p className="text-lg font-mono font-bold text-red-400 mt-1">{cityData.total_admissions} <span className="text-xs font-normal text-zinc-400">pts</span></p>
                </div>
              </div>
            </div>

            {/* Micro-climate recent snapshot */}
            <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Recent Sensor Telemetry Log
              </h3>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {cityData.daily_records?.slice(-5).reverse().map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#161822] border border-[#232637] text-xs">
                    <span className="font-mono text-zinc-400">{r.date}</span>
                    <span className="font-bold text-amber-400">{r.aqi} AQI</span>
                    <span className="text-zinc-400">{r.temp}°C | {r.humidity}% RH</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.traffic === 'High' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      Traffic: {r.traffic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
