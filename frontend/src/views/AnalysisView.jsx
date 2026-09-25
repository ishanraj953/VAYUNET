import React, { useState, useEffect } from 'react';
import { 
  LineChart as LineChartIcon, 
  Layers, 
  Calendar, 
  Activity,
  GitCommit,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function AnalysisView({ filters }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analysis?state=${encodeURIComponent(filters.state)}&city=${encodeURIComponent(filters.city)}`)
      .then(res => res.json())
      .then(data => setAnalysisData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { monthly = [], correlation = {}, scatter = [] } = analysisData || {};
  const corrKeys = Object.keys(correlation);

  const getHeatmapColor = (val) => {
    if (val === 1) return 'bg-amber-500 text-black font-bold';
    if (val > 0.6) return 'bg-red-600/80 text-white font-bold';
    if (val > 0.3) return 'bg-amber-600/60 text-white';
    if (val > 0) return 'bg-amber-950/40 text-amber-300';
    if (val > -0.3) return 'bg-zinc-800 text-zinc-400';
    return 'bg-blue-950 text-blue-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <LineChartIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Multivariate Pollution & Seasonal Analytics
            </h2>
            <p className="text-xs text-zinc-400">Statistical correlations, temporal patterns, and particulate interactions</p>
          </div>
        </div>
      </div>

      {/* Monthly Seasonality Trend */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Annual Seasonality Progression (Monthly Means)</span>
        </h3>
        <p className="text-xs text-zinc-400 mb-4">Tracking winter smog spikes vs monsoon cleansing phases</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="aqi" fill="#f59e0b" name="Mean AQI" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pm25" fill="#ef4444" name="PM 2.5 (µg/m³)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Inter-Pollutant Correlation Matrix Heatmap</span>
        </h3>
        <p className="text-xs text-zinc-400 mb-4">Pearson correlation coefficients between chemical agents and hospital admissions</p>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-zinc-400 font-bold uppercase text-[10px]">Variables</th>
                {corrKeys.map(k => (
                  <th key={k} className="p-2 text-zinc-300 font-bold uppercase text-[10px]">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corrKeys.map(rowKey => (
                <tr key={rowKey} className="border-t border-[#1c1e28]">
                  <td className="p-2 text-left font-bold text-zinc-300 uppercase text-[10px]">{rowKey}</td>
                  {corrKeys.map(colKey => {
                    const val = correlation[rowKey]?.[colKey] ?? 0;
                    return (
                      <td key={colKey} className="p-1">
                        <div className={`py-1.5 px-2 rounded font-mono text-[11px] transition-transform hover:scale-105 ${getHeatmapColor(val)}`}>
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scatter plot: PM2.5 vs AQI */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-red-500" />
          <span>PM 2.5 Concentration vs Calculated AQI Dispersion</span>
        </h3>
        <p className="text-xs text-zinc-400 mb-4">Sampled observation cluster demonstrating linear regression slope</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" />
              <XAxis type="number" dataKey="pm25" name="PM 2.5" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} unit=" µg/m³" />
              <YAxis type="number" dataKey="aqi" name="AQI" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
              <Scatter name="Sensors" data={scatter} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
