import React from 'react';
import { ShieldAlert, Activity, RefreshCw, MapPin, Calendar, Sparkles } from 'lucide-react';

export default function Header({ 
  metadata, 
  filters, 
  onFilterChange, 
  onRefresh, 
  loading,
  alertCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0e14]/90 backdrop-blur-md border-b border-[#222430] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
          <Activity className="w-6 h-6 text-black font-bold" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent uppercase">
              VayuNet India
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-red-950/80 text-red-400 border border-red-800/60 rounded-full animate-pulse">
              Live AI Matrix
            </span>
          </div>
          <p className="text-xs text-zinc-400">All-India Air Pollution & Health Risk Intelligence</p>
        </div>
      </div>

      {/* Global Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* State Selector */}
        <div className="flex items-center space-x-1.5 bg-[#14161f] border border-[#262837] rounded-lg px-3 py-1.5 focus-within:border-amber-500 transition-colors">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-zinc-400">State:</span>
          <select 
            value={filters.state} 
            onChange={(e) => onFilterChange('state', e.target.value)}
            className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer pr-1"
          >
            {metadata.states?.map(st => (
              <option key={st} value={st} className="bg-[#14161f] text-white">
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div className="flex items-center space-x-1.5 bg-[#14161f] border border-[#262837] rounded-lg px-3 py-1.5 focus-within:border-amber-500 transition-colors">
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="text-xs text-zinc-400">City:</span>
          <select 
            value={filters.city} 
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer pr-1"
          >
            {metadata.availableCities?.map(ct => (
              <option key={ct} value={ct} className="bg-[#14161f] text-white">
                {ct}
              </option>
            ))}
          </select>
        </div>

        {/* Active Emergency Alert Badge */}
        {alertCount > 0 && (
          <div className="flex items-center space-x-2 bg-red-950/60 border border-red-600/50 text-red-400 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-siren">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold">{alertCount} Severe Alerts</span>
          </div>
        )}

        {/* Refresh button */}
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 bg-[#1a1c26] hover:bg-[#252838] border border-[#2d3042] text-zinc-300 hover:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
          title="Refresh dataset"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
}
