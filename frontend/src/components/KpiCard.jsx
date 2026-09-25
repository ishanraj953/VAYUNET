import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  trend = null,
  trendText = '',
  sparklineData = [210, 230, 245, 240, 260, 274],
  color = 'gold' // 'gold' | 'red' | 'orange' | 'green'
}) {
  const colorStyles = {
    gold: {
      iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      spark: '#D97706',
      valColor: 'text-amber-800'
    },
    red: {
      iconBg: 'bg-red-100 text-red-700 border-red-200',
      badge: 'bg-red-50 text-red-800 border-red-200',
      spark: '#DC2626',
      valColor: 'text-red-800'
    },
    orange: {
      iconBg: 'bg-orange-100 text-orange-700 border-orange-200',
      badge: 'bg-orange-50 text-orange-800 border-orange-200',
      spark: '#EA580C',
      valColor: 'text-orange-800'
    },
    green: {
      iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      spark: '#059669',
      valColor: 'text-emerald-800'
    }
  }[color] || colorStyles.gold;

  // Simple SVG sparkline points
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 24;
  const points = sparklineData.map((v, i) => {
    const x = (i / (sparklineData.length - 1)) * width;
    const y = height - ((v - minVal) / range) * (height - 4);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card-white card-white-hover rounded-2xl p-5 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg} shadow-xs`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      {/* Main Value & Sparkline */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-3xl font-black tracking-tight ${colorStyles.valColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-xs font-semibold text-stone-500">{unit}</span>}
        </div>

        {/* Mini Sparkline Chart */}
        <div className="w-20 h-6 shrink-0 ml-2">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={colorStyles.spark}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Subtitle / Comparison */}
      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3E8D2] text-xs">
          <span className="text-stone-600 font-medium truncate">{subtitle}</span>
          {trend && (
            <div className={`flex items-center space-x-1 font-bold ${
              trend > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
