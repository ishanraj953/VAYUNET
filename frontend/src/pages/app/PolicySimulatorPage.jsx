import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  TrendingDown, 
  HeartHandshake, 
  ShieldCheck, 
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import api from '../../api/axios';

export default function PolicySimulatorPage() {
  const [params, setParams] = useState({
    traffic_reduction: 25,
    industrial_reduction: 20,
    construction_dust_reduction: 30,
    green_cover_increase: 15,
    odd_even_rule: false,
  });

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [params]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/policy/simulate', params);
      setSimResult(res.data);
    } catch (e) {
      console.error('Simulation error:', e);
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

  const resetAll = () => {
    setParams({
      traffic_reduction: 0,
      industrial_reduction: 0,
      construction_dust_reduction: 0,
      green_cover_increase: 0,
      odd_even_rule: false,
    });
  };

  const chartData = simResult ? [
    { pollutant: 'AQI Index', Baseline: simResult.baseline.aqi, Simulated: simResult.simulated.aqi },
    { pollutant: 'PM 2.5 (µg/m³)', Baseline: simResult.baseline.pm25, Simulated: simResult.simulated.pm25 }
  ] : [];

  // Counterfactual timeline simulation (Streamlit parity)
  const timelineComparison = simResult ? [
    { month: 'Month 1', BaselineAQI: simResult.baseline.aqi, PolicyAQI: simResult.simulated.aqi },
    { month: 'Month 3', BaselineAQI: Math.round(simResult.baseline.aqi * 1.05), PolicyAQI: Math.round(simResult.simulated.aqi * 0.96) },
    { month: 'Month 6', BaselineAQI: Math.round(simResult.baseline.aqi * 0.88), PolicyAQI: Math.round(simResult.simulated.aqi * 0.82) },
    { month: 'Month 9', BaselineAQI: Math.round(simResult.baseline.aqi * 0.72), PolicyAQI: Math.round(simResult.simulated.aqi * 0.68) },
    { month: 'Month 12', BaselineAQI: Math.round(simResult.baseline.aqi * 1.15), PolicyAQI: Math.round(simResult.simulated.aqi * 0.85) },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Sliders className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Evidence-Based Urban Policy & Intervention Simulator
            </h2>
            <p className="text-xs text-stone-500">Model real-time air quality mitigation scenarios, healthcare savings & ROI</p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFDF5] hover:bg-stone-100 border border-[#E2D6C0] text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Levers</span>
        </button>
      </div>

      {/* Main Grid: Left Controls, Right Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levers Panel (1 col) */}
        <div className="card-white rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Active Intervention Levers
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Dynamic Model
            </span>
          </div>

          {/* Traffic */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-stone-700">Vehicular Traffic Reduction</span>
              <span className="font-mono text-amber-800">{params.traffic_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.traffic_reduction}
              onChange={(e) => handleSlider('traffic_reduction', e.target.value)}
              className="w-full accent-amber-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Industrial */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-stone-700">Industrial Emission Curb</span>
              <span className="font-mono text-red-700">{params.industrial_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.industrial_reduction}
              onChange={(e) => handleSlider('industrial_reduction', e.target.value)}
              className="w-full accent-amber-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Construction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-stone-700">Construction Dust Suppression</span>
              <span className="font-mono text-amber-800">{params.construction_dust_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.construction_dust_reduction}
              onChange={(e) => handleSlider('construction_dust_reduction', e.target.value)}
              className="w-full accent-amber-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Green Cover */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-stone-700">Urban Afforestation & Green Buffers</span>
              <span className="font-mono text-emerald-700">+{params.green_cover_increase}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.green_cover_increase}
              onChange={(e) => handleSlider('green_cover_increase', e.target.value)}
              className="w-full accent-amber-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Odd-Even Toggle */}
          <div className="pt-2 border-t border-[#F2E8D5] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800">Odd-Even Vehicle Rationing</span>
              <p className="text-[10px] text-stone-500">Enforce alternate day private vehicle transit</p>
            </div>
            <button
              onClick={() => handleToggle('odd_even_rule')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                params.odd_even_rule
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {params.odd_even_rule ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            <strong>Simulation Note:</strong> Estimates are computed using standard environmental dispersion heuristics and CPCB 50,000-record baseline data.
          </div>
        </div>

        {/* Results Analytics (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {simResult && (
            <>
              {/* Impact KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-white rounded-2xl p-4 border border-amber-300 bg-gradient-to-br from-amber-50/60 to-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">ESTIMATED AQI DROP</span>
                  <p className="text-3xl font-black text-amber-800 font-mono mt-1">
                    -{simResult.impact.aqi_reduction_pct}%
                  </p>
                  <p className="text-xs text-stone-600 mt-1 font-medium">
                    {simResult.baseline.aqi} AQI &rarr; <strong className="text-stone-900">{simResult.simulated.aqi} AQI</strong>
                  </p>
                </div>

                <div className="card-white rounded-2xl p-4 border border-emerald-300 bg-gradient-to-br from-emerald-50/60 to-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">HOSPITAL SURGES PREVENTED</span>
                  <p className="text-3xl font-black text-emerald-800 font-mono mt-1">
                    +{simResult.impact.hospital_admissions_prevented?.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-600 mt-1 font-medium">
                    Admissions avoided annually
                  </p>
                </div>

                <div className="card-white rounded-2xl p-4 border border-orange-300 bg-gradient-to-br from-orange-50/60 to-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-800">PUBLIC HEALTH BENEFIT</span>
                  <p className="text-3xl font-black text-orange-800 font-mono mt-1">
                    ₹{simResult.impact.economic_benefit_crores} <span className="text-xs font-normal">Cr</span>
                  </p>
                  <p className="text-xs text-stone-600 mt-1 font-medium">
                    ROI Ratio: <strong className="text-stone-900">{simResult.impact.benefit_cost_roi}x</strong>
                  </p>
                </div>
              </div>

              {/* Baseline vs Simulated Pollutants Bar */}
              <div className="card-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Baseline vs Simulated Concentration Levels
                </h3>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                      <XAxis dataKey="pollutant" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11 }} />
                      <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Baseline" fill="#DC2626" radius={[6, 6, 0, 0]} name="Baseline Concentration" />
                      <Bar dataKey="Simulated" fill="#059669" radius={[6, 6, 0, 0]} name="Simulated Intervention" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Counterfactual Timeline Trendline (Streamlit Parity) */}
              <div className="card-white rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>12-Month Projected Trajectory: Baseline AQI vs Policy AQI</span>
                </h3>
                <p className="text-xs text-stone-500">Anticipated counterfactual divergence under active intervention regimen</p>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                      <XAxis dataKey="month" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                      <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="BaselineAQI" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="5 5" name="Baseline AQI (No Action)" />
                      <Line type="monotone" dataKey="PolicyAQI" stroke="#059669" strokeWidth={3} name="Policy AQI (With Interventions)" />
                    </LineChart>
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
