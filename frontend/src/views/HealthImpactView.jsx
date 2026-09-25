import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Baby, 
  UserCheck, 
  Hospital, 
  AlertTriangle, 
  Activity,
  ShieldAlert,
  Stethoscope
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function HealthImpactView({ filters }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/health-impact?state=${encodeURIComponent(filters.state)}&city=${encodeURIComponent(filters.city)}`)
      .then(res => res.json())
      .then(data => setHealthData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { tier_analysis = [], age_distribution = [], total_admissions = 0, total_respiratory = 0 } = healthData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <HeartPulse className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Epidemiological Health Risk & Vulnerability Matrix
            </h2>
            <p className="text-xs text-zinc-400">Respiratory complications, pediatric exposure, and hospital surges</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Hospital Surges"
          value={total_admissions}
          unit="Admissions"
          subtitle="Direct pollution attributable"
          icon={Hospital}
          color="red"
        />
        <MetricCard
          title="Total Respiratory Load"
          value={total_respiratory}
          unit="Patients"
          subtitle="Asthma, COPD, Bronchitis"
          icon={Stethoscope}
          color="red"
        />
        <MetricCard
          title="Pediatric Risk Load"
          value={age_distribution.find(a => a.group.includes('Children'))?.cases || 0}
          unit="Cases"
          subtitle="Vulnerable ages < 14 yrs"
          icon={Baby}
          color="yellow"
        />
        <MetricCard
          title="Geriatric Vulnerability"
          value={age_distribution.find(a => a.group.includes('Elderly'))?.cases || 0}
          unit="Cases"
          subtitle="Ages 60+ risk quotient"
          icon={UserCheck}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier-wise Hospital cases (2 cols) */}
        <div className="lg:col-span-2 bg-[#121319] border border-[#222430] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span>Hospital Cases Escalation Across AQI Severity Tiers</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Demonstrating exponential patient surges as AQI crosses 200 and 300 thresholds</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tier_analysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
                <XAxis dataKey="tier" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total_respiratory" fill="#ef4444" name="Respiratory Cases" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_asthma" fill="#f59e0b" name="Asthma Cases" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_hospital" fill="#facc15" name="Hospital Admissions" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Group Vulnerability Donut (1 col) */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Age Group Vulnerability</span>
            </h3>
            <p className="text-xs text-zinc-400">Proportion of compromised demographics</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={age_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="cases"
                >
                  {age_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#090a0e" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1c1e28]">
            {age_distribution.map(d => (
              <div key={d.group} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-zinc-300">{d.group}</span>
                </div>
                <span className="font-mono font-bold text-white">{d.cases.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
