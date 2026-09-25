import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, ShieldAlert, Radio, Flame, BellRing } from 'lucide-react';
import KpiCard from '../../components/KpiCard';
import api from '../../api/axios';

export default function EarlyWarningGridPage() {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Critical' | 'Warning' | 'Watch' | 'Normal'

  useEffect(() => {
    api.get('/alerts')
      .then(res => setAlertData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const alerts = alertData?.active_grid || [];
  const filteredAlerts = alerts.filter(a => {
    const matchSearch = a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.alert === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-stone-500">Automated sensor anomaly sirens, threshold breaches, and emergency advisories</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="All">All Severity Levels</option>
            <option value="Critical">Critical (Severe)</option>
            <option value="Warning">Warning</option>
            <option value="Watch">Watch</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* KPI Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Active Critical Sirens"
          value={alertData?.critical_count || 14}
          unit="Hotspots"
          subtitle="AQI > 350 Hazardous Zones"
          icon={Flame}
          color="red"
        />
        <KpiCard
          title="Elevated Warning Nodes"
          value={alertData?.warning_count || 28}
          unit="Stations"
          subtitle="AQI 250–350 Elevated Tier"
          icon={AlertTriangle}
          color="orange"
        />
        <KpiCard
          title="Telemetry Grid Health"
          value="OPERATIONAL"
          subtitle="100% Station Response Rate"
          icon={BellRing}
          color="green"
        />
      </div>

      {/* Alert Monitoring Table */}
      <div className="card-white rounded-2xl p-5 space-y-4 overflow-hidden">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          Live Sensor Siren Grid ({filteredAlerts.length} Active Records)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F2E8D5] text-stone-500 font-bold uppercase tracking-wider bg-[#FFFDF5]">
                <th className="p-3">Location</th>
                <th className="p-3">AQI Level</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3">Trajectory</th>
                <th className="p-3">Threshold Limit</th>
                <th className="p-3">Alert Status</th>
                <th className="p-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EEDC]">
              {filteredAlerts.map((row, idx) => {
                const isCrit = row.alert === 'Critical';
                return (
                  <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-bold text-stone-900 flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`}></span>
                      <span>{row.location}</span>
                    </td>
                    <td className="p-3 font-mono font-black text-stone-900 text-sm">{row.aqi}</td>
                    <td className="p-3">
                      <span className={`font-semibold ${isCrit ? 'text-red-700' : 'text-amber-800'}`}>
                        {row.risk}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-red-600 font-bold">{row.trend}</td>
                    <td className="p-3 font-mono text-stone-500">{row.threshold} AQI</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCrit ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {row.alert}
                      </span>
                    </td>
                    <td className="p-3 text-stone-400 font-mono text-[11px]">{row.last_updated}</td>
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
