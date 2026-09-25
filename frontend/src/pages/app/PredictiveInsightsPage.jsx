import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BrainCircuit, 
  AlertTriangle, 
  ArrowRight, 
  Wind, 
  Thermometer, 
  Droplets,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import AiPredictionWidget from '../../components/AiPredictionWidget';

export default function PredictiveInsightsPage() {
  const regionalForecasts = [
    {
      region: "Delhi-NCR & Northern Plains",
      delta: "+14.5%",
      forecast_aqi: 385,
      status: "Severe Smog Inversion",
      risk_color: "text-red-700 bg-red-100 border-red-200",
      reason: "Atmospheric thermal inversion locking vehicular particulate below 200m altitude."
    },
    {
      region: "Indo-Gangetic Basin (UP & Bihar)",
      delta: "+9.2%",
      forecast_aqi: 310,
      status: "Very Unhealthy",
      risk_color: "text-red-600 bg-red-50 border-red-200",
      reason: "Stagnant horizontal wind speed (<1.2 m/s) with elevated background biomass emissions."
    },
    {
      region: "Western Coastal Zone (Mumbai & Gujarat)",
      delta: "-4.1%",
      forecast_aqi: 165,
      status: "Moderate / Unhealthy",
      risk_color: "text-amber-800 bg-amber-100 border-amber-200",
      reason: "Active maritime sea-breeze circulation aiding particulate dispersion."
    },
    {
      region: "Deccan Plateau (Bengaluru & Hyderabad)",
      delta: "+2.3%",
      forecast_aqi: 98,
      status: "Moderate",
      risk_color: "text-emerald-800 bg-emerald-100 border-emerald-200",
      reason: "Stable boundary layer dynamics with localized vehicular congestion."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <BrainCircuit className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              AI Atmospheric & Epidemiological Predictive Insights
            </h2>
            <p className="text-xs text-stone-500">24-to-72 hour prospective particulate forecasts & dispersion trajectory</p>
          </div>
        </div>

        <Link
          to="/app/ai-predictor"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <span>Run Custom Risk Simulation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AiPredictionWidget
            deltaPct="+12%"
            regions={["Delhi", "Punjab", "Haryana", "Uttar Pradesh"]}
            timeframe="Next 24h"
          />
        </div>

        {/* 72h Extended Synopsis */}
        <div className="lg:col-span-2 card-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-1 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>72-Hour National Dispersal Forecast Summary</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">Multi-model ensemble forecast derived from meteorological and chemical sensor inputs</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Day 1 (Immediate)</span>
                <p className="text-xl font-black text-red-700 font-mono mt-1">294 AQI</p>
                <span className="text-[10px] text-red-600 font-semibold">+7.2% Spike expected</span>
              </div>
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Day 2 (Peak Load)</span>
                <p className="text-xl font-black text-red-800 font-mono mt-1">315 AQI</p>
                <span className="text-[10px] text-red-700 font-semibold">Hazardous inversion</span>
              </div>
              <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Day 3 (Clearing)</span>
                <p className="text-xl font-black text-amber-800 font-mono mt-1">260 AQI</p>
                <span className="text-[10px] text-emerald-700 font-semibold">Wind speeds improving</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Scientific Advisory Notice:</span>
            <p className="text-[11px] leading-relaxed">
              Model forecasts indicate low boundary mixing height throughout northern administrative districts. Sensitive demographics should prepare preventative inhaler regimens and avoid non-essential morning transit.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Trajectories */}
      <div className="card-white rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          Regional Dispersion Corridors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regionalForecasts.map((rf, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{rf.region}</h4>
                  <span className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${rf.risk_color}`}>
                    {rf.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-stone-900">{rf.forecast_aqi} AQI</span>
                  <span className={`block text-xs font-bold ${rf.delta.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {rf.delta}
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-600 pt-2 border-t border-stone-200/50">{rf.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
