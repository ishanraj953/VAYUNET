import React from 'react';
import { Flame, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertBanner({ 
  avgAqi = 274.3, 
  highRiskPct = 66.4, 
  admissions = 7765652 
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-red-300 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Icon and Headline */}
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-600 animate-warm-pulse">
            <Flame className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                CRITICAL POLLUTION WARNING ACTIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            </div>
            <p className="text-xs text-stone-700 mt-1">
              National average AQI: <strong className="font-extrabold text-stone-900">{avgAqi} AQI</strong> &bull; Population zones exceeding safe thresholds: <strong className="font-extrabold text-red-700">{highRiskPct}%</strong> &bull; Estimated hospital admissions: <strong className="font-extrabold text-stone-900">{admissions.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to="/app/early-warning"
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <span>View Emergency Protocols</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
