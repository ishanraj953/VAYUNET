import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  MapPin, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronDown,
  ShieldAlert,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilters } from '../context/FilterContext';

export default function AppNavbar({ alertCount = 14 }) {
  const { user, logout } = useAuth();
  const { filters, metadata, updateFilter, triggerSync, syncing } = useFilters();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF5]/95 backdrop-blur-md border-b border-[#F2E8D5] px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search state, city or location..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#E9DFCB] rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-xs"
        />
      </div>

      {/* Global Location Filters & Action Bar */}
      <div className="flex items-center space-x-3 ml-auto">
        {/* State Selector */}
        <div className="flex items-center space-x-1.5 bg-white border border-[#E9DFCB] rounded-xl px-3 py-1.5 shadow-xs text-xs font-medium text-stone-700">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-stone-400 font-normal hidden md:inline">State:</span>
          <select
            value={filters.state}
            onChange={(e) => updateFilter('state', e.target.value)}
            className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer pr-1"
          >
            {metadata.states?.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div className="flex items-center space-x-1.5 bg-white border border-[#E9DFCB] rounded-xl px-3 py-1.5 shadow-xs text-xs font-medium text-stone-700">
          <span className="text-stone-400 font-normal hidden md:inline">City:</span>
          <select
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer pr-1"
          >
            {metadata.availableCities?.map(ct => (
              <option key={ct} value={ct}>
                {ct === 'All' ? 'All Cities' : (filters.state !== 'All' ? `${filters.state} - ${ct}` : ct)}
              </option>
            ))}
          </select>
        </div>

        {/* Sync Live Data Button */}
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          title="Synchronize Live Environmental Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Sync Live Data</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 bg-white border border-[#E9DFCB] rounded-xl text-stone-600 hover:text-amber-700 hover:border-amber-300 transition-all cursor-pointer shadow-xs"
            title="Environmental Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-warm-pulse">
                {alertCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#F2E8D5] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Environmental Siren Feed</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {alertCount} Critical
                </span>
              </div>
              <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1 text-xs">
                <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200/60">
                  <p className="font-bold text-red-900">Delhi NCR: Severe AQI 384 Spike</p>
                  <p className="text-[11px] text-red-700 mt-0.5">PM2.5 exceeded 210 µg/m³. GRAP Stage IV alert recommended.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
                  <p className="font-bold text-amber-900">Kanpur & Lucknow: Inversion Warning</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Stagnant wind velocity (under 1.5 m/s) trapping particulate plumes.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="font-bold text-stone-800">CAAQMS Network Calibration</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">50,000 real-time records synchronized across 36 state nodes.</p>
                </div>
              </div>
              <Link
                to="/app/live-early-warning"
                onClick={() => setNotifOpen(false)}
                className="block text-center mt-3 pt-2 text-xs font-bold text-amber-700 hover:text-amber-800 border-t border-stone-100"
              >
                View Live Emergency Command &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1.5 pl-2 bg-white border border-[#E9DFCB] rounded-xl hover:border-amber-300 transition-all cursor-pointer shadow-xs"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt="Avatar"
              className="w-6 h-6 rounded-lg object-cover border border-amber-200"
            />
            <span className="text-xs font-bold text-stone-800 max-w-[100px] truncate hidden sm:inline">
              {user?.name || 'Administrator'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#F2E8D5] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 duration-200">
              <div className="px-4 py-2.5 border-b border-stone-100">
                <p className="text-xs font-bold text-stone-900">{user?.name || 'VayuNet Officer'}</p>
                <p className="text-[11px] text-stone-500 truncate">{user?.email || 'admin@vayunet.gov.in'}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                  {user?.role || 'Officer'}
                </span>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-stone-400" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-stone-100">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
