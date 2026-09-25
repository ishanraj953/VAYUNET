import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Palette, Clock, MapPin, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

export default function SettingsPage() {
  const { metadata } = useFilters();
  const [refreshInterval, setRefreshInterval] = useState('1m');
  const [defaultState, setDefaultState] = useState('Delhi');
  const [defaultCity, setDefaultCity] = useState('Delhi');
  const [alertSound, setAlertSound] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <SettingsIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Platform Configurations & Operational Settings
            </h2>
            <p className="text-xs text-stone-500">Customize telemetry streams, alert thresholds, and dashboard preferences</p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Telemetry Stream & Location Defaults */}
        <div className="card-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#F2E8D5]">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Telemetry Synchronization & Defaults
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Auto-Refresh Interval</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-stone-900 font-semibold focus:outline-none"
              >
                <option value="30s">Every 30 Seconds</option>
                <option value="1m">Every 1 Minute (Recommended)</option>
                <option value="5m">Every 5 Minutes</option>
                <option value="manual">Manual Refresh Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Default Focus State</label>
              <select
                value={defaultState}
                onChange={(e) => setDefaultState(e.target.value)}
                className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-stone-900 font-semibold focus:outline-none"
              >
                {metadata.states?.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Display Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-stone-900 font-semibold focus:outline-none"
              >
                <option value="en">English (Official)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="bn">Bengali (বাংলা)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Siren Notifications & Alerts */}
        <div className="card-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#F2E8D5]">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Emergency Siren & Threshold Alerts
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
              <div>
                <strong className="text-stone-900 block font-bold">Audio Siren for Critical Spikes (AQI &gt; 350)</strong>
                <span className="text-stone-500 text-[11px]">Play audio alert when stations breach hazardous thresholds</span>
              </div>
              <input
                type="checkbox"
                checked={alertSound}
                onChange={(e) => setAlertSound(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
              <div>
                <strong className="text-stone-900 block font-bold">Automated Email Flash Bulletins</strong>
                <span className="text-stone-500 text-[11px]">Dispatch GRAP Stage alerts directly to registered officer inbox</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Visual Theme Info */}
        <div className="card-white rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#F2E8D5]">
            <Palette className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Enterprise Dashboard Theme
            </h3>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <strong>Active Interface:</strong> Sovereign Government Environmental Aesthetic (Warm Cream Canvas `#FFFDF5`, Pure White Cards, Golden Yellow Primary Accent).
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
