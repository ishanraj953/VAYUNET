import React, { useState } from 'react';
import { 
  Wind, 
  Activity, 
  HeartPulse, 
  AlertOctagon, 
  TrendingUp, 
  Layers, 
  ShieldAlert, 
  Flame,
  Award,
  ArrowUpRight
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

export default function OverviewView({ data, loading }) {
  const [trendMetric, setTrendMetric] = useState('aqi'); // 'aqi' | 'pm25' | 'pm10' | 'cases'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-mono tracking-widest uppercase">Synthesizing Ambient Matrix...</p>
      </div>
    );
  }

  if (!data || !data.kpis) {
    return (
      <div className="p-8 text-center bg-[#121319] border border-[#222430] rounded-2xl">
        <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Sensor Telemetry Received</h3>
        <p className="text-xs text-zinc-400 mt-1">Adjust filters or verify connection to backend telemetry node.</p>
      </div>
    );
  }

  const { kpis, category_breakdown, trend_data, top_worst_cities, top_best_cities, pollutants } = data;

  const metricConfig = {
    aqi: { key: 'aqi', label: 'Air Quality Index (AQI)', stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },
    pm25: { key: 'pm25', label: 'PM2.5 (µg/m³)', stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
    pm10: { key: 'pm10', label: 'PM10 (µg/m³)', stroke: '#facc15', fill: 'rgba(250, 204, 21, 0.2)' },
    cases: { key: 'cases', label: 'Daily Hospital Cases', stroke: '#ff2a4d', fill: 'rgba(255, 42, 77, 0.2)' },
  };

  const currentMetric = metricConfig[trendMetric];

  return (
    <div className="space-y-6">
      {/* Hero Alert Banner if AQI is high */}
      {kpis.avg_aqi > 200 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-950/80 via-black to-amber-950/80 border border-red-600/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-red-600/30 rounded-xl border border-red-500/50 animate-pulse">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-red-400">
                CRITICAL POLLUTION WARNING ACTIVE
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                National average AQI is <span className="font-extrabold text-white">{kpis.avg_aqi}</span>. {kpis.high_risk_pct}% of population zones exceed safe thresholds.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono bg-red-900/60 border border-red-700/60 text-red-200 px-3 py-1.5 rounded-lg">
              {kpis.total_hospital?.toLocaleString()} Hospital Admissions
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average AQI"
          value={kpis.avg_aqi}
          unit="AQI"
          subtitle={kpis.avg_aqi > 200 ? "Severe Health Hazard" : "Moderate Risk"}
          icon={Wind}
          color={kpis.avg_aqi > 200 ? "red" : "yellow"}
        />
        <MetricCard
          title="PM 2.5 Density"
          value={kpis.avg_pm25}
          unit="µg/m³"
          subtitle="Safe limit: 60 µg/m³"
          icon={Activity}
          color="yellow"
          trend={kpis.avg_pm25 > 60 ? Math.round(((kpis.avg_pm25 - 60) / 60) * 100) : 0}
        />
        <MetricCard
          title="High Risk Zones"
          value={`${kpis.high_risk_pct}%`}
          subtitle={`${kpis.severe_risk_pct}% in Hazardous status`}
          icon={ShieldAlert}
          color="red"
        />
        <MetricCard
          title="Respiratory Cases"
          value={kpis.total_respiratory}
          subtitle={`${kpis.total_asthma?.toLocaleString()} Asthma patients`}
          icon={HeartPulse}
          color="red"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Interactive Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Ambient Pollution Timeline</span>
              </h3>
              <p className="text-xs text-zinc-400">Historical sequence & daily telemetry readings</p>
            </div>

            {/* Metric Toggle Pills */}
            <div className="flex items-center bg-[#090a0e] border border-[#222430] p-1 rounded-xl space-x-1">
              {Object.keys(metricConfig).map((key) => (
                <button
                  key={key}
                  onClick={() => setTrendMetric(key)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    trendMetric === key
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetric.stroke} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={currentMetric.stroke} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickFormatter={(v) => v ? v.slice(5) : ''}
                />
                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={currentMetric.key} 
                  stroke={currentMetric.stroke} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#metricGradient)" 
                  name={currentMetric.label}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AQI Breakdown Donut (1 col) */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>AQI Category Breakdown</span>
            </h3>
            <p className="text-xs text-zinc-400">Distribution of monitoring samples</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {category_breakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#090a0e" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1c1e28]">
            {category_breakdown?.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-zinc-300">{cat.name} ({cat.range})</span>
                </div>
                <span className="font-mono font-bold text-white">{cat.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pollutant Health Limits Table & Worst/Best Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pollutants Health Standards Bar */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center space-x-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Pollutant Safety Compliance</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Measured vs National Ambient Air Quality Standard (NAAQS)</p>

          <div className="space-y-4">
            {pollutants?.map((p) => {
              const ratio = Math.min(100, Math.round((p.value / p.safe_limit) * 50));
              const isExcess = p.value > p.safe_limit;
              return (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-zinc-400">
                      <span className={`font-mono font-bold ${isExcess ? 'text-red-400' : 'text-emerald-400'}`}>
                        {p.value} {p.unit}
                      </span> / Safe {p.safe_limit} {p.unit}
                    </span>
                  </div>
                  <div className="w-full bg-[#1e202c] h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isExcess ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${ratio}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 8 Worst Pollution Hotspots */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Top Pollution Hotspots</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-3">Highest average AQI zones</p>

          <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
            {top_worst_cities?.map((c, i) => (
              <div key={c.city} className="flex items-center justify-between p-2 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#232637] transition-all">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-lg bg-red-950/80 border border-red-800 text-red-400 text-[10px] font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{c.city}</p>
                    <p className="text-[10px] text-zinc-400">{c.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-red-400">{c.aqi} AQI</span>
                  <p className="text-[10px] text-zinc-400">{c.cases} cases</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 8 Cleanest Air Locations */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center space-x-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Cleanest Air Locations</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-3">Lowest average AQI zones</p>

          <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
            {top_best_cities?.map((c, i) => (
              <div key={c.city} className="flex items-center justify-between p-2 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#232637] transition-all">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{c.city}</p>
                    <p className="text-[10px] text-zinc-400">{c.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-emerald-400">{c.aqi} AQI</span>
                  <p className="text-[10px] text-zinc-400">PM2.5: {c.pm25}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
