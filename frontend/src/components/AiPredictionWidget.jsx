import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';

export default function AiPredictionWidget({
  deltaPct = "+12%",
  regions = ["Delhi", "Punjab", "Haryana", "Uttar Pradesh"],
  timeframe = "Next 24h"
}) {
  return (
    <div className="card-white rounded-2xl p-5 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 border border-amber-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl border border-amber-300">
              <BrainCircuit className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                AI Prediction ({timeframe})
              </h3>
              <p className="text-[11px] text-stone-500">Machine learning atmospheric dispersion forecast</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
            High Alert
          </span>
        </div>

        {/* Prediction Statement */}
        <div className="my-4 space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-stone-700">AQI Expected to Increase</span>
            <span className="text-2xl font-black text-red-600 font-mono flex items-center space-x-0.5">
              <TrendingUp className="w-5 h-5 inline stroke-[3]" />
              <span>{deltaPct}</span>
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Severe air stagnation and localized post-harvest emissions are projected to drive particulate concentrations upward across northern atmospheric corridors.
          </p>
        </div>

        {/* High Pollution Zones Tags */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            High Pollution Expected In:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {regions.map((reg) => (
              <span
                key={reg}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-amber-200 text-stone-800 shadow-2xs"
              >
                {reg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Button link to detailed prediction */}
      <div className="pt-4 mt-4 border-t border-[#F2E8D5]">
        <Link
          to="/app/predictive-insights"
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>View Detailed Forecast</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
