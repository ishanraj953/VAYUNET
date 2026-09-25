import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, MapPin } from 'lucide-react';
import api from '../api/axios';
import { useFilters } from '../context/FilterContext';

export default function PollutionTrendChart() {
  const { filters } = useFilters();
  const [metric, setMetric] = useState('aqi'); // 'aqi' | 'pm25' | 'pm10' | 'cases'
  const [timeRange, setTimeRange] = useState('30d'); // '24h' | '7d' | '30d' | '6m' | '1y'
  const [trendData, setTrendData] = useState([]);
  const [chartLines, setChartLines] = useState([]);
  const [chartTitle, setChartTitle] = useState('Atmospheric Pollution Trajectory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [metric, timeRange, filters.state, filters.city]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/trends?metric=${metric}&time_range=${timeRange}&state=${encodeURIComponent(filters.state)}&city=${encodeURIComponent(filters.city)}`
      );
      setTrendData(res.data.series || []);
      setChartLines(res.data.lines || []);
      if (res.data.title) {
        setChartTitle(res.data.title);
      }
    } catch (e) {
      console.error('Failed to fetch trends:', e);
    } finally {
      setLoading(false);
    }
  };

  const metricLabels = {
    aqi: "Air Quality Index (AQI)",
    pm25: "PM2.5 Concentration (µg/m³)",
    pm10: "PM10 Concentration (µg/m³)",
    cases: "Respiratory Patients"
  };

  return (
    <div className="card-white rounded-2xl p-5 flex flex-col justify-between">
      {/* Chart Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F2E8D5]">
        <div>
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>{chartTitle}</span>
          </h3>
          <p className="text-xs text-stone-500 flex items-center space-x-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-amber-600 inline" />
            <span>Region: <strong className="text-stone-800">{filters.state === 'All' ? 'All-India Representative Metros' : filters.state}</strong></span>
            <span>&bull;</span>
            <span>{metricLabels[metric]}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Switcher */}
          <div className="flex items-center bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl p-1 space-x-1">
            {[
              { id: 'aqi', label: 'AQI' },
              { id: 'pm25', label: 'PM2.5' },
              { id: 'pm10', label: 'PM10' },
              { id: 'cases', label: 'Cases' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  metric === m.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl p-1 space-x-1">
            {['24h', '7d', '30d', '6m', '1y'].map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  timeRange === tr
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tr.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="h-72 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-stone-400">
            No telemetry data recorded for this selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#A8A29E" 
                tick={{ fill: '#78716C', fontSize: 10 }}
                tickFormatter={(v) => v ? v.slice(5) : ''}
              />
              <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#EAE0CA', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {chartLines.map((ln) => (
                <Line 
                  key={ln.key} 
                  type="monotone" 
                  dataKey={ln.key} 
                  stroke={ln.color} 
                  strokeWidth={ln.strokeWidth || 2} 
                  dot={false} 
                  name={ln.name} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
