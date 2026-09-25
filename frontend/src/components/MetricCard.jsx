import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  subtitle = '', 
  icon: Icon, 
  color = 'yellow', // 'yellow' | 'red' | 'neutral'
  trend = null 
}) {
  const colorStyles = {
    yellow: {
      border: 'hover:border-amber-500/50',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      valColor: 'text-amber-400'
    },
    red: {
      border: 'hover:border-red-500/50',
      badge: 'bg-red-500/10 text-red-400 border-red-500/30',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      valColor: 'text-red-400'
    },
    neutral: {
      border: 'hover:border-zinc-500/50',
      badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      iconBg: 'bg-zinc-800 text-zinc-300',
      glow: 'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
      valColor: 'text-white'
    }
  }[color] || colorStyles.yellow;

  return (
    <div className={`group relative bg-[#121319] border border-[#222430] rounded-xl p-5 transition-all duration-300 ${colorStyles.border} ${colorStyles.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className={`text-3xl font-extrabold tracking-tight ${colorStyles.valColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs font-medium text-zinc-400">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1c1e28] text-xs text-zinc-400">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
