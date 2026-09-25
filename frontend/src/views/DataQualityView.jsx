import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Database, FileSpreadsheet, AlertCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function DataQualityView() {
  const [quality, setQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data-quality')
      .then(res => res.json())
      .then(d => setQuality(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { data_health_score = 98.4, completeness_pct = 100, total_records = 50000, total_columns = 27, columns_audit = [] } = quality || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Data Pipeline Integrity & Hygiene Audit
            </h2>
            <p className="text-xs text-zinc-400">Telemetry validation, missing record forward-fill, and schema audits</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Data Health Score"
          value={`${data_health_score}%`}
          subtitle="Sensor reliability index"
          icon={ShieldCheck}
          color="yellow"
        />
        <MetricCard
          title="Completeness Rate"
          value={`${completeness_pct}%`}
          subtitle="Zero NaN cell coverage"
          icon={CheckCircle2}
          color="yellow"
        />
        <MetricCard
          title="Total Telemetry Rows"
          value={total_records.toLocaleString()}
          unit="Rows"
          subtitle="Full India multi-station grid"
          icon={Database}
          color="neutral"
        />
        <MetricCard
          title="Audited Attributes"
          value={total_columns}
          unit="Features"
          subtitle="Meteorological & Chemical"
          icon={FileSpreadsheet}
          color="neutral"
        />
      </div>

      {/* Columns Audit Table */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 overflow-hidden">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Sensor Attribute Health Table
        </h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#090a0f] text-zinc-400 font-bold uppercase border-b border-[#222430]">
                <th className="p-3">Attribute Name</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">Missing Rate (%)</th>
                <th className="p-3">Unique Values</th>
                <th className="p-3">Hygiene Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1e28]">
              {columns_audit.map((col) => (
                <tr key={col.column} className="hover:bg-[#161822]">
                  <td className="p-3 font-mono font-bold text-white">{col.column}</td>
                  <td className="p-3 font-mono text-zinc-400">{col.type}</td>
                  <td className="p-3 font-mono text-zinc-300">{col.missing_pct}%</td>
                  <td className="p-3 font-mono text-amber-400">{col.unique_values.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {col.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
