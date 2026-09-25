import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  TrendingDown, 
  DollarSign, 
  HeartHandshake, 
  Sparkles, 
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PolicySimulatorView() {
  const [params, setParams] = useState({
    traffic_reduction: 25,
    industrial_reduction: 20,
    green_cover_increase: 15,
    odd_even_rule: false,
    dust_control_enforcement: 30,
  });

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [params]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/policy-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSlider = (key, val) => {
    setParams(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleToggle = (key) => {
    setParams(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetParams = () => {
    setParams({
      traffic_reduction: 0,
      industrial_reduction: 0,
      green_cover_increase: 0,
      odd_even_rule: false,
      dust_control_enforcement: 0,
    });
  };

  const comparisonData = simResult ? [
    { pollutant: 'AQI', Baseline: simResult.baseline.aqi, Simulated: simResult.simulated.aqi },
    { pollutant: 'PM 2.5', Baseline: simResult.baseline.pm25, Simulated: simResult.simulated.pm25 },
    { pollutant: 'PM 10', Baseline: simResult.baseline.pm10, Simulated: simResult.simulated.pm10 },
    { pollutant: 'NO2', Baseline: simResult.baseline.no2, Simulated: simResult.simulated.no2 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Sliders className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Urban Policy & Intervention Simulator
            </h2>
            <p className="text-xs text-zinc-400">Model real-time air quality mitigation scenarios, healthcare savings & ROI</p>
          </div>
        </div>

        <button
          onClick={resetParams}
          className="flex items-center space-x-2 bg-[#1b1c26] hover:bg-[#252838] border border-[#2e3144] text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Levers</span>
        </button>
      </div>

      {/* Main Grid: Levers Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levers Panel (1 col) */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Active Policy Levers</span>
          </h3>

          {/* Traffic Reduction Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-semibold">Traffic Volume Curb</span>
              <span className="font-mono font-bold text-amber-400">{params.traffic_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.traffic_reduction}
              onChange={(e) => handleSlider('traffic_reduction', e.target.value)}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#1f2230] rounded-lg"
            />
          </div>

          {/* Industrial Emissions Reduction */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-semibold">Industrial Emission Cap</span>
              <span className="font-mono font-bold text-red-400">{params.industrial_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.industrial_reduction}
              onChange={(e) => handleSlider('industrial_reduction', e.target.value)}
              className="w-full accent-red-500 cursor-pointer h-1.5 bg-[#1f2230] rounded-lg"
            />
          </div>

          {/* Green Cover Expansion */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-semibold">Urban Green Canopy Expansion</span>
              <span className="font-mono font-bold text-emerald-400">{params.green_cover_increase}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.green_cover_increase}
              onChange={(e) => handleSlider('green_cover_increase', e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#1f2230] rounded-lg"
            />
          </div>

          {/* Construction Dust Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-semibold">Construction Dust Enforcement</span>
              <span className="font-mono font-bold text-yellow-300">{params.dust_control_enforcement}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.dust_control_enforcement}
              onChange={(e) => handleSlider('dust_control_enforcement', e.target.value)}
              className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-[#1f2230] rounded-lg"
            />
          </div>

          {/* Odd-Even Toggle */}
          <div className="pt-3 border-t border-[#1c1e28] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-300">Odd-Even Vehicle Rationing</p>
              <p className="text-[10px] text-zinc-500">Emergency vehicular restriction</p>
            </div>
            <button
              onClick={() => handleToggle('odd_even_rule')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                params.odd_even_rule
                  ? 'bg-red-600 text-black shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-[#1b1c26] text-zinc-400 border border-[#2e3144]'
              }`}
            >
              {params.odd_even_rule ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Results & ROI Analytics (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {simResult && (
            <>
              {/* Top Impact KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#121319] border border-amber-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">AQI REDUCTION</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-3xl font-black text-amber-400">-{simResult.impact.aqi_drop_pct}%</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    {simResult.baseline.aqi} AQI &rarr; <span className="font-bold text-white">{simResult.simulated.aqi} AQI</span>
                  </p>
                </div>

                <div className="bg-[#121319] border border-emerald-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">HOSPITAL SURGES PREVENTED</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-3xl font-black text-emerald-400">+{simResult.impact.cases_saved.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">Cases averted annually</p>
                </div>

                <div className="bg-[#121319] border border-red-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">ECONOMIC VALUE GENERATED</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-3xl font-black text-red-400">₹{simResult.impact.economic_benefit_cr}</span>
                    <span className="text-xs text-zinc-400 font-bold">Cr</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">ROI Ratio: <span className="font-bold text-amber-400">{simResult.impact.benefit_cost_roi}x</span></p>
                </div>
              </div>

              {/* Baseline vs Simulated Pollutant Chart */}
              <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Baseline vs Policy-Simulated Pollutant Loads
                </h3>
                <p className="text-xs text-zinc-400 mb-4">Before vs After policy implementation projection</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
                      <XAxis dataKey="pollutant" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Baseline" fill="#ef4444" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Simulated" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
