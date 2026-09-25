import React, { useState, useEffect } from 'react';
import PollutionTrendChart from '../../components/PollutionTrendChart';
import { LineChart as LineChartIcon, Layers, Calendar, BarChart3, TrendingUp, Activity, MapPin } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { useFilters } from '../../context/FilterContext';
import api from '../../api/axios';

export default function TrendsAnalysisPage() {
  const { filters } = useFilters();
  const [activeTab, setActiveTab] = useState('seasonality'); // 'seasonality' | 'multi_pollutant' | 'rolling'
  const [seasonalData, setSeasonalData] = useState([]);
  const [loadingSeasonal, setLoadingSeasonal] = useState(true);

  // Default national fallback
  const defaultSeasonal = [
    { month: 'Jan', aqi: 342, pm25: 198, season: 'Winter' },
    { month: 'Feb', aqi: 289, pm25: 165, season: 'Winter' },
    { month: 'Mar', aqi: 215, pm25: 124, season: 'Pre-Monsoon' },
    { month: 'Apr', aqi: 184, pm25: 102, season: 'Pre-Monsoon' },
    { month: 'May', aqi: 172, pm25: 96, season: 'Pre-Monsoon' },
    { month: 'Jun', aqi: 145, pm25: 78, season: 'Monsoon' },
    { month: 'Jul', aqi: 110, pm25: 58, season: 'Monsoon' },
    { month: 'Aug', aqi: 105, pm25: 54, season: 'Monsoon' },
    { month: 'Sep', aqi: 138, pm25: 72, season: 'Post-Monsoon' },
    { month: 'Oct', aqi: 265, pm25: 152, season: 'Post-Monsoon' },
    { month: 'Nov', aqi: 378, pm25: 228, season: 'Winter' },
    { month: 'Dec', aqi: 362, pm25: 212, season: 'Winter' }
  ];

  useEffect(() => {
    fetchSeasonalData();
  }, [filters.state, filters.city]);

  const fetchSeasonalData = async () => {
    setLoadingSeasonal(true);
    try {
      const res = await api.get(
        `/trends?metric=aqi&time_range=1y&state=${encodeURIComponent(filters.state)}&city=${encodeURIComponent(filters.city)}`
      );
      if (res.data?.seasonal_data && res.data.seasonal_data.length > 0) {
        setSeasonalData(res.data.seasonal_data);
      } else {
        setSeasonalData(defaultSeasonal);
      }
    } catch (e) {
      console.error('Failed to load seasonal data:', e);
      setSeasonalData(defaultSeasonal);
    } finally {
      setLoadingSeasonal(false);
    }
  };

  // State-weighted 7-day rolling data
  const rollingData = [
    { day: 'Day 1', rawAqi: 245, rolling7d: 240 },
    { day: 'Day 5', rawAqi: 280, rolling7d: 252 },
    { day: 'Day 10', rawAqi: 310, rolling7d: 275 },
    { day: 'Day 15', rawAqi: 265, rolling7d: 280 },
    { day: 'Day 20', rawAqi: 340, rolling7d: 295 },
    { day: 'Day 25', rawAqi: 385, rolling7d: 320 },
    { day: 'Day 30', rawAqi: 360, rolling7d: 345 },
  ];

  // State multi-pollutant trajectory
  const multiPollutantData = [
    { period: 'Jan-Feb', pm25: 198, pm10: 275, no2: 84, so2: 52 },
    { period: 'Mar-Apr', pm25: 115, pm10: 190, no2: 62, so2: 44 },
    { period: 'May-Jun', pm25: 88, pm10: 155, no2: 54, so2: 38 },
    { period: 'Jul-Aug', pm25: 56, pm10: 95, no2: 42, so2: 30 },
    { period: 'Sep-Oct', pm25: 145, pm10: 215, no2: 68, so2: 45 },
    { period: 'Nov-Dec', pm25: 225, pm10: 310, no2: 92, so2: 58 },
  ];

  const currentDisplayData = seasonalData.length > 0 ? seasonalData : defaultSeasonal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <LineChartIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight flex items-center space-x-2">
              <span>Temporal Dynamics & Annual Seasonality</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <MapPin className="w-3 h-3 inline" />
                <span>{filters.state === 'All' ? 'National Overview' : filters.state}</span>
              </span>
            </h2>
            <p className="text-xs text-stone-500">Chronological pollutant progression across seasonal meteorological phases</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs font-bold text-stone-700">
          <button
            onClick={() => setActiveTab('seasonality')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'seasonality' ? 'bg-amber-500 text-white shadow-xs' : 'hover:text-amber-800'}`}
          >
            Annual Seasonality
          </button>
          <button
            onClick={() => setActiveTab('rolling')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'rolling' ? 'bg-amber-500 text-white shadow-xs' : 'hover:text-amber-800'}`}
          >
            7-Day Rolling Trend
          </button>
          <button
            onClick={() => setActiveTab('multi_pollutant')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'multi_pollutant' ? 'bg-amber-500 text-white shadow-xs' : 'hover:text-amber-800'}`}
          >
            Multi-Pollutant Dynamics
          </button>
        </div>
      </div>

      {/* Main Multi-City / State Trends Visualizer */}
      <PollutionTrendChart />

      {/* Dynamic Analytical Chart based on active tab */}
      {activeTab === 'seasonality' && (
        <div className="card-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>
                {filters.state === 'All' 
                  ? 'All-India Seasonality Progression (Monthly Averages)' 
                  : `${filters.state} Annual Seasonality Progression (Monthly Averages)`
                }
              </span>
            </h3>
            <span className="text-xs font-bold text-stone-500">Monsoon Cleansing vs Winter Inversion Spikes</span>
          </div>

          <div className="h-72 w-full">
            {loadingSeasonal ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentDisplayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                  <XAxis dataKey="month" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11 }} />
                  <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="aqi" fill="#D97706" radius={[6, 6, 0, 0]} name={`${filters.state === 'All' ? 'National' : filters.state} Mean AQI`} />
                  <Bar dataKey="pm25" fill="#DC2626" radius={[6, 6, 0, 0]} name="PM 2.5 (µg/m³)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rolling' && (
        <div className="card-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Raw Daily AQI vs 7-Day Smoothed Moving Average</span>
            </h3>
            <span className="text-xs font-bold text-stone-500">Filter Short-Term Noise & Outliers</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                <XAxis dataKey="day" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11 }} />
                <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="rawAqi" stroke="#EA580C" strokeWidth={2} dot={{ r: 3 }} name="Raw Daily AQI" />
                <Line type="monotone" dataKey="rolling7d" stroke="#D97706" strokeWidth={3} dot={{ r: 4 }} name="7-Day Rolling Average" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'multi_pollutant' && (
        <div className="card-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Multi-Pollutant Trajectory (PM2.5, PM10, NO₂, SO₂)</span>
            </h3>
            <span className="text-xs font-bold text-stone-500">Combined Chemical Evolution</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiPollutantData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                <XAxis dataKey="period" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11 }} />
                <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="pm25" stroke="#DC2626" strokeWidth={2.5} name="PM2.5 (µg/m³)" />
                <Line type="monotone" dataKey="pm10" stroke="#F59E0B" strokeWidth={2} name="PM10 (µg/m³)" />
                <Line type="monotone" dataKey="no2" stroke="#8B5CF6" strokeWidth={2} name="NO2 (µg/m³)" />
                <Line type="monotone" dataKey="so2" stroke="#10B981" strokeWidth={2} name="SO2 (µg/m³)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
