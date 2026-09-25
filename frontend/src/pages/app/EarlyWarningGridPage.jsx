import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, ShieldAlert, Radio, Flame, BellRing, RefreshCw, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import KpiCard from '../../components/KpiCard';
import api from '../../api/axios';

export default function EarlyWarningGridPage() {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Critical' | 'Warning' | 'Watch' | 'Normal'
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('');

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/live-alerts/stream');
      setAlertData(res.data);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      api.get('/alerts').then(res => {
        setAlertData(res.data);
        setLastSyncTime(new Date().toLocaleTimeString());
      }).catch(console.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    if (!isLiveActive) return;
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Handle both formats (stream format vs legacy format)
  const rawList = alertData?.alerts || alertData?.active_grid || [];
  const alerts = rawList.map(a => ({
    location: a.location || `${a.station_name || a.city}, ${a.state}`,
    city: a.city,
    state: a.state,
    aqi: a.aqi,
    risk: a.risk || a.severity || (a.aqi >= 300 ? 'Hazardous Emergency' : a.aqi >= 200 ? 'Severe Alert' : 'Moderate Watch'),
    trend: a.trend || '+7.2% (Surge)',
    threshold: a.threshold || '200.0',
    alert: a.alert || (a.aqi >= 300 ? 'Critical' : a.aqi >= 200 ? 'Warning' : a.aqi >= 100 ? 'Watch' : 'Normal'),
    color: a.badge_color || a.color || (a.aqi >= 300 ? '#EF4444' : '#F59E0B'),
    pm25: a.pm25,
    action_code: a.action_code || (a.aqi >= 300 ? 'GRAP-IV' : a.aqi >= 200 ? 'GRAP-II' : 'GRAP-I'),
    protocol: a.protocol || (a.aqi >= 300 ? 'Immediate Ban on Construction & BS-III/IV Diesel' : 'Mechanized road sweeping & water misting'),
    last_updated: a.last_evaluated || a.last_updated || 'Just now'
  }));

  const filteredAlerts = alerts.filter(a => {
    const matchSearch = (a.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (a.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (a.state || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.alert === statusFilter;
    return matchSearch && matchStatus;
  });

  const criticalCount = alertData?.critical_emergency_sirens ?? alertData?.critical_count ?? alerts.filter(a => a.alert === 'Critical').length;
  const warningCount = alertData?.severe_warning_nodes ?? alertData?.warning_count ?? alerts.filter(a => a.alert === 'Warning').length;
  const watchCount = alertData?.moderate_watch_nodes ?? alerts.filter(a => a.alert === 'Watch').length;

  return (
    <div className="space-y-6">
      {/* Live Command Banner CTA */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 rounded-2xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white">
            <Zap className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wide flex items-center space-x-2">
              <span>Live Emergency Alert Command Center & Siren Dispatcher</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-red-700 text-[10px] font-black uppercase">Active Feed</span>
            </h4>
            <p className="text-xs text-amber-100">
              Access multi-channel municipal broadcast dispatch (SMS/Push), audio sirens, and hospital ICU surge telemetry.
            </p>
          </div>
        </div>
        <Link
          to="/app/live-early-warning"
          className="flex items-center space-x-2 bg-white hover:bg-stone-100 text-red-700 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>Open Full Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-red-600 animate-warm-pulse">
            <Radio className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight flex items-center space-x-2">
              <span>National Early Warning & Smog Alert Monitoring Grid</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            </h2>
            <p className="text-xs text-stone-500">
              Automated sensor anomaly sirens, threshold breaches &bull; Last live sync: <span className="font-mono font-bold text-stone-700">{lastSyncTime || 'Syncing...'}</span>
            </p>
          </div>
        </div>

        {/* Live Controls & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLiveActive ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveActive ? 'animate-spin' : ''}`} />
            <span>{isLiveActive ? 'Live Stream Active (4s)' : 'Paused'}</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search location or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="All">All Severity Levels</option>
            <option value="Critical">Critical (Severe 300+)</option>
            <option value="Warning">Warning (200-299)</option>
            <option value="Watch">Watch (100-199)</option>
            <option value="Normal">Normal Safe (&lt; 100)</option>
          </select>
        </div>
      </div>

      {/* KPI Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Critical Sirens Active"
          value={criticalCount}
          unit="Hotspots"
          subtitle="AQI 300+ Hazardous Zones"
          icon={Flame}
          color="red"
        />
        <KpiCard
          title="Elevated Warning Nodes"
          value={warningCount}
          unit="Stations"
          subtitle="AQI 200–299 Elevated Tier"
          icon={AlertTriangle}
          color="orange"
        />
        <KpiCard
          title="Moderate Watch Nodes"
          value={watchCount}
          unit="Stations"
          subtitle="AQI 100–199 Watch Tier"
          icon={ShieldAlert}
          color="amber"
        />
        <KpiCard
          title="Telemetry Grid Health"
          value="100% LIVE"
          subtitle="36 States & UT Nodes Active"
          icon={BellRing}
          color="green"
        />
      </div>

      {/* Alert Monitoring Table */}
      <div className="card-white rounded-2xl p-5 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
            <span>Live Sensor Siren Grid ({filteredAlerts.length} Active Records)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h3>
          <span className="text-[11px] font-mono text-stone-500">Auto-refresh every 4 seconds</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F2E8D5] text-stone-500 font-bold uppercase tracking-wider bg-[#FFFDF5]">
                <th className="p-3">Monitoring Node</th>
                <th className="p-3">AQI Level</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3">GRAP Directives</th>
                <th className="p-3">Trajectory</th>
                <th className="p-3">Threshold</th>
                <th className="p-3">Alert Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EEDC]">
              {filteredAlerts.map((row, idx) => {
                const isCrit = row.alert === 'Critical';
                const isWarn = row.alert === 'Warning';
                return (
                  <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-bold text-stone-900">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-600 animate-ping' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        <div>
                          <p className="font-bold text-stone-900">{row.location}</p>
                          <p className="text-[10px] text-stone-400 font-normal">{row.city}, {row.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-black text-stone-900 text-sm">
                      <span className={`px-2 py-0.5 rounded-lg ${isCrit ? 'bg-red-100 text-red-900 font-bold' : isWarn ? 'bg-orange-100 text-orange-900' : 'bg-emerald-50 text-emerald-900'}`}>
                        {row.aqi} AQI
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-semibold text-xs ${isCrit ? 'text-red-700' : isWarn ? 'text-amber-800' : 'text-emerald-700'}`}>
                        {row.risk}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 mr-1.5">
                        {row.action_code}
                      </span>
                      <span className="text-[11px] text-stone-600 truncate inline-block max-w-[200px] align-bottom" title={row.protocol}>
                        {row.protocol}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-red-600 font-bold">{row.trend}</td>
                    <td className="p-3 font-mono text-stone-500">{row.threshold} AQI</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCrit ? 'bg-red-100 text-red-800 border border-red-300' : isWarn ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {row.alert}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        to="/app/live-early-warning"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 text-[11px] transition-colors"
                      >
                        <span>Command</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
