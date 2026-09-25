import React, { useState, useEffect } from 'react';
import { AlertTriangle, Flame, ShieldAlert, Radio, Clock, MapPin, BellRing } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function EarlyWarningView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/early-warning')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { critical_count = 0, warning_count = 0, active_alerts = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <span>National Early Warning & Smog Alert Grid</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            </h2>
            <p className="text-xs text-zinc-400">Automated sensor anomaly sirens and emergency emergency triggers</p>
          </div>
        </div>
      </div>

      {/* KPI Alert Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Critical Red Smog Alerts"
          value={critical_count}
          unit="Active Hotspots"
          subtitle="AQI > 350 Hazardous Zones"
          icon={Flame}
          color="red"
        />
        <MetricCard
          title="Elevated Warning Sirens"
          value={warning_count}
          unit="Monitored Cities"
          subtitle="AQI 250 - 350 Alert Band"
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard
          title="Telemetry Grid Status"
          value="OPERATIONAL"
          subtitle="100% Station Response Rate"
          icon={BellRing}
          color="neutral"
        />
      </div>

      {/* Active Siren Grid */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>Active Urban Threshold Breaches ({active_alerts.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active_alerts.map((al, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                al.urgency === 'Red'
                  ? 'bg-[#181116] border-red-600/50 hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'bg-[#181511] border-amber-600/50 hover:border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className={`p-2 rounded-lg ${al.urgency === 'Red' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{al.city}, {al.state}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${al.urgency === 'Red' ? 'text-red-400' : 'text-amber-400'}`}>
                      {al.level}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-lg font-black text-white">{al.aqi}</span>
                  <span className="text-xs text-zinc-400"> AQI</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 text-xs text-zinc-300">
                <p>{al.advisory}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
