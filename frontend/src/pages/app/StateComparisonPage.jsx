import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  ArrowLeftRight, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart3, 
  LineChart as LineChartIcon, 
  Compass, 
  Zap, 
  AlertTriangle,
  Award,
  Clock,
  Layers,
  Cpu,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ReferenceLine
} from 'recharts';
import api from '../../api/axios';

export default function StateComparisonPage() {
  const [statesList, setStatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateA, setStateA] = useState('Delhi');
  const [stateB, setStateB] = useState('Maharashtra');
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState('AQI');
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'ml_prediction' | 'variance' | 'radar' | 'risk_dist'
  const [comparisonData, setComparisonData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch full state list for dropdowns and leaderboard
  useEffect(() => {
    api.get('/pollution/states')
      .then(res => {
        setStatesList(res.data);
        if (res.data.length > 1) {
          if (!stateA) setStateA(res.data[0].state);
          if (!stateB) setStateB(res.data[1].state);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch dynamic comparison payload whenever stateA, stateB, timeRange, or metric changes
  useEffect(() => {
    if (!stateA || !stateB) return;
    setLoading(true);
    api.get(`/pollution/compare?stateA=${encodeURIComponent(stateA)}&stateB=${encodeURIComponent(stateB)}&metric=${metric}&time_range=${timeRange}`)
      .then(res => {
        setComparisonData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [stateA, stateB, timeRange, metric]);

  const handleSwapStates = () => {
    const temp = stateA;
    setStateA(stateB);
    setStateB(temp);
  };

  const kpis = comparisonData?.kpis || {};
  const ml = comparisonData?.ml_model_prediction || {};
  const timeline = comparisonData?.timeline || [];
  const deltaBreakdown = comparisonData?.delta_breakdown || [];
  const radarData = comparisonData?.radar || [];
  const riskDistData = comparisonData?.risk_dist || [];
  const explainability = comparisonData?.explainability || {};

  // Format ML probability comparison for charts
  const mlProbsChart = ml.stateA_probs && ml.stateB_probs ? [
    { tier: 'High Risk', [stateA]: ml.stateA_probs.High || 0, [stateB]: ml.stateB_probs.High || 0 },
    { tier: 'Moderate Risk', [stateA]: ml.stateA_probs.Medium || 0, [stateB]: ml.stateB_probs.Medium || 0 },
    { tier: 'Low Risk', [stateA]: ml.stateA_probs.Low || 0, [stateB]: ml.stateB_probs.Low || 0 },
  ] : [];

  // Top 10 Most Polluted States Bar
  const top10States = [...statesList]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 10);

  const filteredStates = statesList.filter(s =>
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Control Bar */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-[#F2E8D5] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Scale className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                State-to-State Pollution &amp; Exposure Benchmarking
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                {timeRange} Horizon
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Real-time comparative analytics powered by Random Forest ML inference across historical observation windows
            </p>
          </div>
        </div>

        {/* Head-to-Head Selectors & Horizon Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* State A Picker */}
          <div className="flex items-center space-x-1.5 bg-[#FFFDF5] border border-amber-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-[10px] font-black uppercase text-amber-800">Primary:</span>
            <select
              value={stateA}
              onChange={(e) => setStateA(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer pr-1"
            >
              {statesList.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapStates}
            title="Swap Primary & Compare States"
            className="p-2 bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-600 rounded-xl transition border border-[#E8DFC8] active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* State B Picker */}
          <div className="flex items-center space-x-1.5 bg-[#FFFDF5] border border-rose-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-[10px] font-black uppercase text-rose-800">Compare:</span>
            <select
              value={stateB}
              onChange={(e) => setStateB(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer pr-1"
            >
              {statesList.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
            </select>
          </div>

          {/* Dynamic Time Range Horizon Selector */}
          <div className="flex items-center bg-[#F7F2E6] p-1 rounded-xl border border-[#E9DFCB]">
            {['7d', '30d', '60d', '90d', '1y'].map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg uppercase transition ${
                  timeRange === tr
                    ? 'bg-amber-600 text-white shadow-2xs scale-102'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Model Forecast Projection Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white rounded-2xl p-4 shadow-sm border border-amber-900/40 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-amber-300">
                  Trained ML Model Inference &bull; {timeRange.toUpperCase()} Horizon Forecast
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Random Forest Active
                </span>
              </div>
              <p className="text-xs text-stone-200 mt-0.5 font-medium leading-relaxed max-w-4xl">
                {ml.forecast_text || `Model evaluating ${timeRange} historical particulate indicators for ${stateA} vs ${stateB}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-right">
              <div className="text-[10px] text-stone-300 font-bold uppercase">{stateA} ML Score</div>
              <div className="text-sm font-black text-amber-400">{ml.stateA_risk_score || 0}<span className="text-[10px] text-stone-400">/100</span></div>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="text-right">
              <div className="text-[10px] text-stone-300 font-bold uppercase">{stateB} ML Score</div>
              <div className="text-sm font-black text-rose-400">{ml.stateB_risk_score || 0}<span className="text-[10px] text-stone-400">/100</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparative Metric Badges (Dynamically Recalculated for Active Horizon) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cleaner Air Winner Badge */}
        <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black tracking-wider uppercase text-emerald-800 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Cleaner Atmosphere ({timeRange.toUpperCase()})</span>
            </span>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              +{kpis.cleaner_pct || 0}% Better
            </span>
          </div>
          <div className="text-lg font-black text-stone-900">
            {kpis.cleaner_state || stateA}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Maintains {kpis.cleaner_margin || 0} pts lower mean AQI load than {kpis.cleaner_state === stateA ? stateB : stateA} during this {timeRange} window.
          </p>
        </div>

        {/* Mean AQI Differential */}
        <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black tracking-wider uppercase text-stone-600 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Mean AQI ({timeRange.toUpperCase()})</span>
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              (kpis.delta_aqi || 0) > 0 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              {(kpis.delta_aqi || 0) > 0 ? `+${kpis.delta_aqi}` : kpis.delta_aqi} AQI ({kpis.delta_aqi_pct > 0 ? `+${kpis.delta_aqi_pct}%` : `${kpis.delta_aqi_pct}%`})
            </span>
          </div>
          <div className="flex items-baseline space-x-3">
            <div>
              <span className="text-xs font-bold text-amber-700">{stateA}: </span>
              <span className="text-lg font-black text-stone-900">{kpis.aqiA || 0}</span>
            </div>
            <span className="text-stone-300 font-bold">vs</span>
            <div>
              <span className="text-xs font-bold text-rose-700">{stateB}: </span>
              <span className="text-lg font-black text-stone-900">{kpis.aqiB || 0}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {kpis.delta_aqi > 0 ? `${stateB} is higher by ${kpis.delta_aqi} AQI points` : `${stateA} is higher by ${Math.abs(kpis.delta_aqi || 0)} AQI points`}
          </p>
        </div>

        {/* Severe Exposure Days (>250 AQI) */}
        <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black tracking-wider uppercase text-stone-600 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Severe Days ({timeRange.toUpperCase()})</span>
            </span>
            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
              {kpis.sev_pctA}% vs {kpis.sev_pctB}%
            </span>
          </div>
          <div className="flex items-baseline space-x-3">
            <div>
              <span className="text-xs font-bold text-amber-700">{stateA}: </span>
              <span className="text-lg font-black text-stone-900">{kpis.sevA?.toLocaleString() || 0}</span>
            </div>
            <span className="text-stone-300 font-bold">vs</span>
            <div>
              <span className="text-xs font-bold text-rose-700">{stateB}: </span>
              <span className="text-lg font-black text-stone-900">{kpis.sevB?.toLocaleString() || 0}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Hazardous threshold breaches (&gt;250 AQI) in past {timeRange}
          </p>
        </div>

        {/* Hospital Admissions Burden */}
        <div className="card-white rounded-2xl p-4 border border-[#F2E8D5] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black tracking-wider uppercase text-stone-600 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Admissions Burden ({timeRange.toUpperCase()})</span>
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              (kpis.delta_hosp || 0) > 0 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              {(kpis.delta_hosp || 0) > 0 ? `+${(kpis.delta_hosp || 0).toLocaleString()}` : (kpis.delta_hosp || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline space-x-3">
            <div>
              <span className="text-xs font-bold text-amber-700">{stateA}: </span>
              <span className="text-lg font-black text-stone-900">{(kpis.hospA)?.toLocaleString() || 0}</span>
            </div>
            <span className="text-stone-300 font-bold">vs</span>
            <div>
              <span className="text-xs font-bold text-rose-700">{stateB}: </span>
              <span className="text-lg font-black text-stone-900">{(kpis.hospB)?.toLocaleString() || 0}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Recorded respiratory admissions during this {timeRange} window
          </p>
        </div>
      </div>

      {/* Main Dynamic Comparison Visualizer Card */}
      <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
        {/* Navigation Tabs and Metric Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2E8D5] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                activeTab === 'timeline'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[#FFFDF5] text-stone-600 hover:bg-amber-50 border border-[#E9DFCB]'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Day-by-Day Trajectory Divergence</span>
            </button>

            <button
              onClick={() => setActiveTab('ml_prediction')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                activeTab === 'ml_prediction'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[#FFFDF5] text-stone-600 hover:bg-amber-50 border border-[#E9DFCB]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Trained ML Risk Predictions</span>
            </button>

            <button
              onClick={() => setActiveTab('variance')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                activeTab === 'variance'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[#FFFDF5] text-stone-600 hover:bg-amber-50 border border-[#E9DFCB]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Percentage Variance Gap</span>
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                activeTab === 'radar'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[#FFFDF5] text-stone-600 hover:bg-amber-50 border border-[#E9DFCB]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Multi-Axis Risk Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('risk_dist')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition ${
                activeTab === 'risk_dist'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[#FFFDF5] text-stone-600 hover:bg-amber-50 border border-[#E9DFCB]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Risk Tier Counts</span>
            </button>
          </div>

          {/* Metric Selector for Timeline */}
          {activeTab === 'timeline' && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Metric:</span>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="p-1.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="AQI">Air Quality Index (AQI)</option>
                <option value="PM2_5">PM2.5 Concentration (µg/m³)</option>
                <option value="PM10">PM10 Particulate Load (µg/m³)</option>
                <option value="NO2">NO₂ Toxic Gas (µg/m³)</option>
                <option value="hospital_admissions">Hospital Admissions</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Day-by-Day Timeline Trajectory Line Chart */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                Daily comparative trajectory for past <strong className="text-stone-800 font-bold">{timeRange.toUpperCase()}</strong> showing peaks, spikes, and crossovers between 
                <strong className="text-amber-700 ml-1 font-bold">{stateA}</strong> (Amber) and 
                <strong className="text-rose-700 ml-1 font-bold">{stateB}</strong> (Rose).
              </span>
              <span className="font-mono text-[11px] text-stone-400">{timeline.length} observation points</span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#A8A29E" 
                    tick={{ fill: '#78716C', fontSize: 10 }} 
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#A8A29E" 
                    tick={{ fill: '#78716C', fontSize: 10 }}
                    domain={['dataMin - 15', 'dataMax + 15']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#EAE0CA', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                    }}
                    formatter={(val, name) => [`${val} ${metric === 'AQI' ? 'AQI' : ''}`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <ReferenceLine y={274} stroke="#CBD5E1" strokeDasharray="4 4" label={{ value: 'National Baseline (274)', fill: '#94A3B8', fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey={stateA} 
                    name={stateA} 
                    stroke="#D97706" 
                    strokeWidth={3} 
                    dot={{ r: 2, fill: '#D97706' }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey={stateB} 
                    name={stateB} 
                    stroke="#E11D48" 
                    strokeWidth={3} 
                    dot={{ r: 2, fill: '#E11D48' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Trained ML Model Risk Predictions & Confidence Probabilities */}
        {activeTab === 'ml_prediction' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                Random Forest ML multi-class prediction probabilities evaluated on all telemetry observations in the <strong>{timeRange.toUpperCase()}</strong> horizon.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State A ML Card */}
              <div className="bg-[#FFFDF5] p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-black text-stone-900">{stateA}</span>
                  </div>
                  <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {ml.stateA_pred_class || 'Moderate Risk'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-600">
                    <span>High Risk Probability</span>
                    <span className="text-rose-700">{ml.stateA_probs?.High || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${ml.stateA_probs?.High || 0}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-stone-600">
                    <span>Moderate Risk Probability</span>
                    <span className="text-amber-700">{ml.stateA_probs?.Medium || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${ml.stateA_probs?.Medium || 0}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-stone-600">
                    <span>Low Risk Probability</span>
                    <span className="text-emerald-700">{ml.stateA_probs?.Low || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${ml.stateA_probs?.Low || 0}%` }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-100 flex justify-between text-xs text-stone-500">
                  <span>ML Predicted Days:</span>
                  <span className="font-mono font-bold text-stone-800">
                    {ml.stateA_ml_counts?.High || 0} High &bull; {ml.stateA_ml_counts?.Medium || 0} Med &bull; {ml.stateA_ml_counts?.Low || 0} Low
                  </span>
                </div>
              </div>

              {/* State B ML Card */}
              <div className="bg-[#FFFDF5] p-4 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="text-sm font-black text-stone-900">{stateB}</span>
                  </div>
                  <span className="text-xs font-black bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full">
                    {ml.stateB_pred_class || 'Moderate Risk'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-600">
                    <span>High Risk Probability</span>
                    <span className="text-rose-700">{ml.stateB_probs?.High || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${ml.stateB_probs?.High || 0}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-stone-600">
                    <span>Moderate Risk Probability</span>
                    <span className="text-amber-700">{ml.stateB_probs?.Medium || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${ml.stateB_probs?.Medium || 0}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-stone-600">
                    <span>Low Risk Probability</span>
                    <span className="text-emerald-700">{ml.stateB_probs?.Low || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${ml.stateB_probs?.Low || 0}%` }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-100 flex justify-between text-xs text-stone-500">
                  <span>ML Predicted Days:</span>
                  <span className="font-mono font-bold text-stone-800">
                    {ml.stateB_ml_counts?.High || 0} High &bull; {ml.stateB_ml_counts?.Medium || 0} Med &bull; {ml.stateB_ml_counts?.Low || 0} Low
                  </span>
                </div>
              </div>
            </div>

            {/* Side by side probability grouped bar chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mlProbsChart} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                  <XAxis dataKey="tier" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11, fontWeight: 700 }} />
                  <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} unit="%" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#EAE0CA', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}
                    formatter={(val) => [`${val}%`, 'Confidence']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey={stateA} fill="#D97706" radius={[6, 6, 0, 0]} name={`${stateA} Probability`} />
                  <Bar dataKey={stateB} fill="#E11D48" radius={[6, 6, 0, 0]} name={`${stateB} Probability`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Percentage Variance & Gap Breakdown Bar Chart */}
        {activeTab === 'variance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                Net Percentage Variance of <strong className="text-rose-700">{stateB}</strong> relative to <strong className="text-amber-700">{stateA}</strong> (0% Baseline) for the <strong>{timeRange.toUpperCase()}</strong> window.
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deltaBreakdown} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#A8A29E" 
                    tick={{ fill: '#78716C', fontSize: 10 }}
                    unit="%"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="metric" 
                    stroke="#A8A29E" 
                    tick={{ fill: '#44403C', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#EAE0CA', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                    }}
                    formatter={(val, name, item) => [
                      `${val > 0 ? '+' : ''}${val}% (Δ ${item.payload.delta} ${item.payload.unit})`, 
                      `Gap (${stateB} vs ${stateA})`
                    ]}
                  />
                  <ReferenceLine x={0} stroke="#78716C" strokeWidth={1.5} />
                  <Bar dataKey="delta_pct" name="Percentage Gap (%)" radius={[4, 4, 4, 4]}>
                    {deltaBreakdown.map((entry, idx) => (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={entry.delta_pct > 0 ? '#E11D48' : '#059669'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: Multi-Axis Risk Radar Chart */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                Standardized 6-Dimensional Risk Matrix during the <strong>{timeRange.toUpperCase()}</strong> horizon.
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span>{stateA}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-xs font-bold text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span>{stateB}</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E6DCC8" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#44403C', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#EAE0CA', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }} 
                  />
                  <Radar name={stateA} dataKey={stateA} stroke="#D97706" fill="#D97706" fillOpacity={0.35} />
                  <Radar name={stateB} dataKey={stateB} stroke="#E11D48" fill="#E11D48" fillOpacity={0.35} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 5: Risk Tier Counts */}
        {activeTab === 'risk_dist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                Jurisdictional distribution of historical days classified under High, Medium, and Low risk tiers in the past <strong>{timeRange.toUpperCase()}</strong>.
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                  <XAxis dataKey="level" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11, fontWeight: 700 }} />
                  <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#EAE0CA', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey={stateA} fill="#D97706" radius={[6, 6, 0, 0]} name={stateA} />
                  <Bar dataKey={stateB} fill="#E11D48" radius={[6, 6, 0, 0]} name={stateB} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Why Different? AI Diagnostic & Explainability Card */}
      <div className="card-white rounded-2xl p-5 border border-[#F2E8D5] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            Diagnostic Disparity Analysis ({timeRange.toUpperCase()}): Why {stateA} &amp; {stateB} Differ
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#F2E8D5] space-y-2">
            <h4 className="text-xs font-black text-stone-800 uppercase tracking-tight">Key Disparity Drivers ({timeRange}):</h4>
            <ul className="space-y-1 text-xs text-stone-600">
              {explainability.contributors && explainability.contributors.length > 0 ? (
                explainability.contributors.map((c, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">&bull;</span>
                    <span>{c}</span>
                  </li>
                ))
              ) : (
                <li>Detailed particulate metrics are closely matched with seasonal baseline fluctuations.</li>
              )}
            </ul>
          </div>

          <div className="bg-[#FFFDF5] p-3.5 rounded-xl border border-[#F2E8D5] space-y-2">
            <h4 className="text-xs font-black text-stone-800 uppercase tracking-tight">Inter-State Policy Recommendation:</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              {explainability.recommendation || `Target particulate emission controls in ${stateB} to achieve ambient equality with ${stateA}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Top 10 States Ranking Bar Chart with Scaled Y-Axis */}
      <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>Top 10 Most Critical States by Mean AQI (Tight Contrast Scale)</span>
          </h3>
          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
            Critical Hotspots
          </span>
        </div>

        <div className="h-68 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10States} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
              <XAxis dataKey="state" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
              <YAxis 
                stroke="#A8A29E" 
                tick={{ fill: '#78716C', fontSize: 10 }} 
                domain={['dataMin - 3', 'dataMax + 2']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} 
                formatter={(val) => [`${val} AQI`, 'Mean AQI']}
              />
              <Bar dataKey="aqi" radius={[6, 6, 0, 0]} name="Mean AQI">
                {top10States.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.state === stateA ? '#D97706' : (entry.state === stateB ? '#E11D48' : '#78716C')} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive State Data Table */}
      <div className="card-white rounded-2xl p-5 space-y-4 overflow-hidden border border-[#F2E8D5] shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            All-India Jurisdiction Leaderboard ({filteredStates.length} States)
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#FFFDF5] border-b border-[#F2E8D5] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">State / UT</th>
                <th className="p-3">Mean AQI</th>
                <th className="p-3">PM 2.5 (&micro;g/m&sup3;)</th>
                <th className="p-3">PM 10 (&micro;g/m&sup3;)</th>
                <th className="p-3">NO&#8322; (&micro;g/m&sup3;)</th>
                <th className="p-3">Health Admissions</th>
                <th className="p-3">Quick Compare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EEDC]">
              {filteredStates.map((s) => (
                <tr 
                  key={s.state} 
                  className={`hover:bg-amber-50/50 transition-colors ${
                    s.state === stateA ? 'bg-amber-50/40 font-bold' : (s.state === stateB ? 'bg-rose-50/40 font-bold' : '')
                  }`}
                >
                  <td className="p-3 font-bold text-stone-900 flex items-center space-x-2">
                    {s.state === stateA && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                    {s.state === stateB && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                    <span>{s.state}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-800">{s.aqi}</td>
                  <td className="p-3 font-mono">{s.pm25}</td>
                  <td className="p-3 font-mono">{s.pm10}</td>
                  <td className="p-3 font-mono">{s.no2}</td>
                  <td className="p-3 font-mono text-red-600">{s.respiratory_cases?.toLocaleString() || 'N/A'}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setStateA(s.state)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          stateA === s.state 
                            ? 'bg-amber-600 text-white border-amber-600' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        Set Primary
                      </button>
                      <button
                        onClick={() => setStateB(s.state)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          stateB === s.state 
                            ? 'bg-rose-600 text-white border-rose-600' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-rose-400'
                        }`}
                      >
                        Set Compare
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
