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
  TrendingUp,
  Target,
  Sparkles,
  Clock,
  Play,
  MapPin,
  CheckCircle2,
  Cpu,
  Layers
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
  Line,
  Cell
} from 'recharts';
import api from '../../api/axios';
import { useFilters } from '../../context/FilterContext';

export default function PolicySimulatorPage() {
  const { filters, metadata } = useFilters();

  const [timeframe, setTimeframe] = useState('Short-term (3 months)');
  const [reductions, setReductions] = useState({
    pm25: 20,
    pm10: 10,
    no2: 5,
    so2: 5,
    co: 5
  });
  const [scenarioName, setScenarioName] = useState('Policy Mix 20-10');

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedState = filters.state || 'All';
  const selectedCity = filters.city || 'All';

  // Run simulation whenever sliders, timeframe, or location context change
  useEffect(() => {
    runSimulation();
  }, [reductions, timeframe, selectedState, selectedCity]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        pm25_reduction: reductions.pm25,
        pm10_reduction: reductions.pm10,
        no2_reduction: reductions.no2,
        so2_reduction: reductions.so2,
        co_reduction: reductions.co,
        timeframe: timeframe,
        scenario_name: scenarioName,
        state: selectedState,
        city: selectedCity
      };
      const res = await api.post('/policy/simulate', payload);
      setSimResult(res.data);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSlider = (key, val) => {
    const num = Number(val);
    setReductions(prev => {
      const next = { ...prev, [key]: num };
      if (key === 'pm25' || key === 'pm10') {
        setScenarioName(`Policy Mix ${key === 'pm25' ? num : next.pm25}-${key === 'pm10' ? num : next.pm10}`);
      }
      return next;
    });
  };

  const applyPreset = (pm25Val, pm10Val, no2Val, so2Val, coVal, name) => {
    setReductions({
      pm25: pm25Val,
      pm10: pm10Val,
      no2: no2Val,
      so2: so2Val,
      co: coVal
    });
    setScenarioName(name);
  };

  const resetAll = () => {
    setReductions({
      pm25: 0,
      pm10: 0,
      no2: 0,
      so2: 0,
      co: 0
    });
    setScenarioName('Baseline (Zero Reduction)');
  };

  const impact = simResult?.impact || {};
  const baseline = simResult?.baseline || {};
  const simulated = simResult?.simulated || {};
  const ml = simResult?.ml_model_prediction || {};
  const pollutantLevels = simResult?.pollutant_levels || [];
  const monthlyTrajectory = simResult?.monthly_trajectory || [];
  const locationLabel = simResult?.city !== 'All' && simResult?.city ? `${simResult.city}, ${simResult.state}` : (simResult?.state !== 'All' && simResult?.state ? simResult.state : 'All-India National Overview');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-[#F2E8D5] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Sliders className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                Evidence-Based Urban Policy &amp; Intervention Simulator
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                {timeframe}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Multi-pollutant reduction modeling, counterfactual concentration levels &amp; health economic ROI
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFDF5] border border-amber-200 rounded-xl text-xs font-bold text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>{locationLabel}</span>
          </div>

          <button
            onClick={resetAll}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FFFDF5] hover:bg-stone-100 border border-[#E2D6C0] text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>
      </div>

      {/* Design Policy Scenario Card (Clean White theme, matching exact user screenshot) */}
      <div className="card-white rounded-2xl p-6 border border-[#F2E8D5] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F2E8D5] pb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Design Policy Scenario
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-500">
            Set multi-pollutant abatement targets (%)
          </span>
        </div>

        {/* 1. Impact Timeframe Radio Pills */}
        <div className="space-y-2">
          <label className="text-xs font-black text-stone-800 uppercase tracking-tight block">
            Impact Timeframe:
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              'Short-term (3 months)',
              'Medium-term (1 year)',
              'Long-term (5 years)'
            ].map((tf) => (
              <label 
                key={tf}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  timeframe === tf
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                    : 'bg-[#FFFDF5] border-[#E9DFCB] text-stone-600 hover:border-amber-300'
                }`}
              >
                <input
                  type="radio"
                  name="timeframe"
                  checked={timeframe === tf}
                  onChange={() => setTimeframe(tf)}
                  className="accent-amber-600 w-3.5 h-3.5"
                />
                <span>{tf}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Reduction Targets (%) Multi-Pollutant Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-800 uppercase tracking-tight">
              Reduction Targets (%):
            </span>
            <span className="text-[11px] text-stone-500 italic">
              (All reductions apply uniformly across dataset for {locationLabel})
            </span>
          </div>

          {/* Sliders Grid Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PM2.5 Reduction */}
            <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#EAE0CA] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-stone-800">PM2.5 Reduction</span>
                <span className="font-mono text-rose-700 text-sm font-black">{reductions.pm25}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reductions.pm25}
                onChange={(e) => handleSlider('pm25', e.target.value)}
                className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* PM10 Reduction */}
            <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#EAE0CA] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-stone-800">PM10 Reduction</span>
                <span className="font-mono text-amber-700 text-sm font-black">{reductions.pm10}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reductions.pm10}
                onChange={(e) => handleSlider('pm10', e.target.value)}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* NO2 Reduction */}
            <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#EAE0CA] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-stone-800">NO2 Reduction</span>
                <span className="font-mono text-amber-800 text-sm font-black">{reductions.no2}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reductions.no2}
                onChange={(e) => handleSlider('no2', e.target.value)}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sliders Grid Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SO2 Reduction */}
            <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#EAE0CA] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-stone-800">SO2 Reduction</span>
                <span className="font-mono text-stone-800 text-sm font-black">{reductions.so2}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reductions.so2}
                onChange={(e) => handleSlider('so2', e.target.value)}
                className="w-full accent-stone-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* CO Reduction */}
            <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#EAE0CA] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-stone-800">CO Reduction</span>
                <span className="font-mono text-stone-800 text-sm font-black">{reductions.co}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reductions.co}
                onChange={(e) => handleSlider('co', e.target.value)}
                className="w-full accent-stone-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Policy Mix Presets */}
            <div className="bg-[#FFFDF5] p-3 rounded-xl border border-[#EAE0CA] flex flex-col justify-center space-y-1.5">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-tight">Quick Scenario Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => applyPreset(20, 10, 5, 5, 5, 'Policy Mix 20-10')}
                  className="px-2 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-md text-[10px] font-bold transition"
                >
                  Mix 20-10
                </button>
                <button
                  onClick={() => applyPreset(30, 20, 15, 10, 10, 'NCAP Target (30-20)')}
                  className="px-2 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-md text-[10px] font-bold transition"
                >
                  NCAP 30-20
                </button>
                <button
                  onClick={() => applyPreset(50, 35, 25, 20, 20, 'Aggressive Abatement (50-35)')}
                  className="px-2 py-1 bg-rose-100 text-rose-900 hover:bg-rose-200 rounded-md text-[10px] font-bold transition"
                >
                  Aggressive 50-35
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Scenario Name Field */}
        <div className="pt-2 border-t border-[#F2E8D5] flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px]">
            <label className="text-xs font-black text-stone-800 uppercase tracking-tight block mb-1">
              Scenario Name:
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g. Policy Mix 20-10"
              className="w-full px-3.5 py-2 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Section */}
      {simResult && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* 4 Headline After-Policy KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* After-Policy AQI */}
            <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-stone-600">
                  After-Policy AQI
                </span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  -{impact.aqi_reduction_pct || 0}% Drop
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {simulated.aqi || 0} <span className="text-xs text-stone-400 font-bold">AQI</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Baseline {baseline.aqi} &rarr; Policy {simulated.aqi} ({-impact.aqi_reduction} pts)
              </p>
            </div>

            {/* Health Cases Avoided */}
            <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-stone-600">
                  Health Cases Avoided
                </span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Prevented
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                +{impact.cases_prevented?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Admissions avoided over {timeframe}
              </p>
            </div>

            {/* PM2.5 Reduction Target */}
            <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-stone-600">
                  PM2.5 Reduction
                </span>
                <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                  -{reductions.pm25}% Target
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {impact.pm25_reduction_abs || 0} <span className="text-xs text-stone-400 font-bold">µg/m³</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Baseline {baseline.pm25} &rarr; Policy {simulated.pm25} µg/m³
              </p>
            </div>

            {/* PM10 Reduction Target */}
            <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-stone-600">
                  PM10 Reduction
                </span>
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  -{reductions.pm10}% Target
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {impact.pm10_reduction_abs || 0} <span className="text-xs text-stone-400 font-bold">µg/m³</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Baseline {baseline.pm10} &rarr; Policy {simulated.pm10} µg/m³
              </p>
            </div>
          </div>

          {/* Trained ML Model Prediction Card */}
          <div className="card-white rounded-2xl p-5 border border-[#F2E8D5] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F2E8D5] pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Trained Random Forest ML Model Simulation Output
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Ensemble Classifier Validated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Baseline ML Days */}
              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                <div className="text-[11px] font-bold text-stone-500 uppercase">Baseline ML Classification</div>
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-800">
                  <span className="text-rose-700 font-black">{ml.baseline_risk_counts?.High || 0} High</span>
                  <span>&bull;</span>
                  <span className="text-amber-700 font-black">{ml.baseline_risk_counts?.Medium || 0} Med</span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-black">{ml.baseline_risk_counts?.Low || 0} Low</span>
                </div>
                <div className="text-[10px] text-stone-400">ML Toxicity Score: {ml.baseline_risk_score || 0}/100</div>
              </div>

              {/* Simulated ML Days */}
              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="text-[11px] font-bold text-stone-500 uppercase">Simulated ML Classification</div>
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-800">
                  <span className="text-rose-700 font-black">{ml.simulated_risk_counts?.High || 0} High</span>
                  <span>&bull;</span>
                  <span className="text-amber-700 font-black">{ml.simulated_risk_counts?.Medium || 0} Med</span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-black">{ml.simulated_risk_counts?.Low || 0} Low</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">Simulated Score: {ml.simulated_risk_score || 0}/100 (-{ml.score_reduction || 0} pts)</div>
              </div>

              {/* Model Forecast */}
              <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-amber-200 flex flex-col justify-center space-y-1">
                <div className="text-[11px] font-bold text-amber-900 uppercase flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Policy Forecast</span>
                </div>
                <p className="text-xs text-stone-700 leading-snug">
                  {ml.ml_forecast || `Model projects significant toxic load reduction under ${scenarioName}.`}
                </p>
              </div>
            </div>
          </div>

          {/* Health Improvement Impact Summary (3 Metric Cards) */}
          <div className="card-white rounded-2xl p-5 border border-[#F2E8D5] space-y-3 shadow-xs">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Health Impact Summary ({timeframe})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              <div className="bg-[#FFFDF5] p-4 rounded-xl border border-emerald-200">
                <div className="text-[11px] font-bold text-stone-500 uppercase">Cases Avoided (Total)</div>
                <div className="text-xl font-black text-emerald-800 mt-1">
                  {impact.cases_prevented?.toLocaleString() || 0}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Over selected {timeframe}</div>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border border-emerald-200">
                <div className="text-[11px] font-bold text-stone-500 uppercase">Daily Cases Prevented</div>
                <div className="text-xl font-black text-emerald-800 mt-1">
                  {impact.daily_cases_prevented || 0}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Average per day</div>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border border-emerald-200">
                <div className="text-[11px] font-bold text-stone-500 uppercase">Annualized Impact</div>
                <div className="text-xl font-black text-emerald-800 mt-1">
                  {impact.annualized_cases_prevented?.toLocaleString() || 0}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Cases prevented per year</div>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-xl border border-amber-200">
                <div className="text-[11px] font-bold text-stone-500 uppercase">Public Health Savings</div>
                <div className="text-xl font-black text-amber-800 mt-1">
                  &rsquo;{impact.economic_benefit_crores || 0} <span className="text-xs text-stone-500 font-bold">Cr</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">ROI Ratio: {impact.benefit_cost_roi}x</div>
              </div>
            </div>
          </div>

          {/* Charts Row: Baseline vs Simulated Levels & 12-Month Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pollutant Distribution: Baseline vs Simulated */}
            <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Baseline vs Simulated Concentration Levels
                </h3>
                <span className="text-xs font-bold text-stone-500">Multi-Parameter Shift</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pollutantLevels} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                    <XAxis dataKey="metric" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10, fontWeight: 700 }} />
                    <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                      formatter={(val, name, item) => [`${val} ${item.payload.unit}`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="baseline" fill="#DC2626" radius={[6, 6, 0, 0]} name="Baseline Concentration" />
                    <Bar dataKey="simulated" fill="#059669" radius={[6, 6, 0, 0]} name="Simulated Intervention" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 12-Month Projected Trajectory: Baseline AQI vs Policy AQI */}
            <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  12-Month Projected Trajectory: Baseline AQI vs Policy AQI
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Counterfactual Curve
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                    <XAxis dataKey="month" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                    <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} domain={['dataMin - 20', 'dataMax + 20']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} 
                      formatter={(val) => [`${val} AQI`, 'Mean AQI']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="baseline" name="Baseline Trajectory" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="policy" name="Simulated Policy Trajectory" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
