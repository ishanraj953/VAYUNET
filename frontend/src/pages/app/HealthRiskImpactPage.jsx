import React, { useState, useEffect } from 'react';
import { HeartPulse, Hospital, Baby, UserCheck, Activity, AlertTriangle, ShieldAlert, BarChart3, ScatterChart as ScatterIcon } from 'lucide-react';
import HealthImpactCards from '../../components/HealthImpactCards';
import KpiCard from '../../components/KpiCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import api from '../../api/axios';

export default function HealthRiskImpactPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');

  useEffect(() => {
    api.get('/health-impact')
      .then(res => setHealthData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = healthData?.summary || {
    asthma_patients: 5121555,
    hospital_admissions: 7765652,
    children_at_risk_pct: 12.6,
    elderly_at_risk_pct: 18.4,
    cardiovascular_risk_index: 73.4,
    respiratory_risk_index: 88.2
  };

  const tierData = healthData?.tier_distribution || [];
  const ageCohorts = healthData?.age_cohorts || [
    { group: 'Pediatric (<14 yrs)', cases: 3864680, color: '#FBBF24' },
    { group: 'Adult Population', cases: 4515364, color: '#F97316' },
    { group: 'Geriatric (60+ yrs)', cases: 4640339, color: '#EF4444' }
  ];

  // Scatter points: Pollutant vs Health cases simulation across states
  const scatterPoints = [
    { pollutantVal: 45, cases: 1420, state: 'Kerala' },
    { pollutantVal: 78, cases: 2850, state: 'Goa' },
    { pollutantVal: 110, cases: 4500, state: 'Tamil Nadu' },
    { pollutantVal: 145, cases: 6200, state: 'Karnataka' },
    { pollutantVal: 165, cases: 7800, state: 'Gujarat' },
    { pollutantVal: 195, cases: 9400, state: 'Maharashtra' },
    { pollutantVal: 220, cases: 11200, state: 'West Bengal' },
    { pollutantVal: 260, cases: 13800, state: 'Bihar' },
    { pollutantVal: 295, cases: 16200, state: 'Punjab' },
    { pollutantVal: 340, cases: 19500, state: 'Haryana' },
    { pollutantVal: 385, cases: 23400, state: 'Delhi' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-red-700">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Epidemiological Health Burden & Healthcare Capacity
            </h2>
            <p className="text-xs text-stone-500">Continuous disease incidence tracking & population vulnerability indices</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Note: Model-derived Epidemiological Estimates</span>
        </div>
      </div>

      {/* Main Health Impact Cards */}
      <HealthImpactCards
        asthmaPatients={summary.asthma_patients}
        hospitalAdmissions={summary.hospital_admissions}
        childrenRiskPct={summary.children_at_risk_pct}
        elderlyRiskPct={summary.elderly_at_risk_pct}
      />

      {/* Additional Risk Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-white rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Respiratory Complication Risk Index</span>
            <span className="text-xs font-bold text-red-700 font-mono">88.2 / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full" style={{ width: '88.2%' }}></div>
          </div>
          <p className="text-[11px] text-stone-500">High prevalence of bronchospasm, asthma attacks, and COPD flare-ups.</p>
        </div>

        <div className="card-white rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Cardiovascular Stress Exposure Index</span>
            <span className="text-xs font-bold text-orange-700 font-mono">73.4 / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: '73.4%' }}></div>
          </div>
          <p className="text-[11px] text-stone-500">Fine particulate translocation into bloodstream contributing to ischemic load.</p>
        </div>
      </div>

      {/* Tier-Wise Hospital Surges Chart */}
      <div className="card-white rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          Hospital Admissions Escalation Across AQI Severity Tiers
        </h3>
        <p className="text-xs text-stone-500">Exponential surge observed as ambient concentrations breach 200 and 300 AQI</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
              <XAxis dataKey="tier" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
              <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="respiratory" fill="#D97706" radius={[6, 6, 0, 0]} name="Respiratory Cases" />
              <Bar dataKey="hospital" fill="#DC2626" radius={[6, 6, 0, 0]} name="Hospital Admissions" />
              <Bar dataKey="asthma" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Asthma Consultations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streamlit Parity Row: Age Group Breakdown & Pollutant-vs-Health Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerable Age Groups Bar Chart */}
        <div className="card-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <Baby className="w-4 h-4 text-amber-600" />
              <span>Health Cases by Vulnerable Demographic</span>
            </h3>
            <span className="text-xs font-bold text-stone-500">Pediatric & Geriatric Burdens</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageCohorts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                <XAxis dataKey="group" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="cases" fill="#D97706" radius={[6, 6, 0, 0]} name="Cases Recorded" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pollutant vs Health Metric Scatter Plot */}
        <div className="card-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <ScatterIcon className="w-4 h-4 text-red-600" />
              <span>Pollutant vs Health Outcomes Scatter</span>
            </h3>
            <span className="text-xs text-stone-500">Linear Regression Gradient</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" />
                <XAxis dataKey="pollutantVal" name="Concentration" unit=" µg/m³" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <YAxis dataKey="cases" name="Cases" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <ZAxis range={[60, 140]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }}
                />
                <Scatter name="State Cohorts" data={scatterPoints} fill="#EA580C" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
