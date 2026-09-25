import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Hospital, 
  Baby, 
  UserCheck, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  BarChart3, 
  ScatterChart as ScatterIcon,
  MapPin,
  TrendingUp,
  FileText,
  Sliders
} from 'lucide-react';
import HealthImpactCards from '../../components/HealthImpactCards';
import KpiCard from '../../components/KpiCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  Cell
} from 'recharts';
import api from '../../api/axios';
import { useFilters } from '../../context/FilterContext';

export default function HealthRiskImpactPage() {
  const { filters, metadata, updateFilter } = useFilters();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');

  const selectedState = filters.state || 'All';
  const selectedCity = filters.city || 'All';

  // Available cities for the selected state
  const stateCities = selectedState === 'All'
    ? metadata.cities || ['All']
    : ['All', ...(metadata.state_cities[selectedState] || [])];

  useEffect(() => {
    setLoading(true);
    api.get('/health-impact', {
      params: {
        state: selectedState,
        city: selectedCity
      }
    })
      .then(res => {
        setHealthData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedState, selectedCity]);

  const summary = healthData?.summary || {
    asthma_patients: 5121555,
    hospital_admissions: 7765652,
    total_respiratory: 13020383,
    children_cases: 3864680,
    elderly_cases: 4640339,
    children_at_risk_pct: 29.7,
    elderly_at_risk_pct: 35.6,
    cardiovascular_risk_index: 73.4,
    respiratory_risk_index: 88.2,
    avg_aqi: 274.3,
    avg_pm25: 159.7
  };

  const tierData = healthData?.tier_distribution || [];
  const ageCohorts = healthData?.age_cohorts || [
    { group: 'Pediatric (<14 yrs)', cases: 3864680, pct: 29.7, color: '#FBBF24' },
    { group: 'Geriatric (60+ yrs)', cases: 4640339, pct: 35.6, color: '#EF4444' },
    { group: 'Adult General Population', cases: 4515364, pct: 34.7, color: '#F97316' }
  ];

  const scatterPoints = healthData?.scatter_points || [];
  const locationLabel = healthData?.location || (selectedCity !== 'All' ? `${selectedCity}, ${selectedState}` : (selectedState !== 'All' ? selectedState : 'All-India National Overview'));
  const totalRecords = healthData?.total_records || 0;

  return (
    <div className="space-y-6">
      {/* Header & Location Context Bar */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-[#F2E8D5] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-red-700">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                Epidemiological Health Burden &amp; Healthcare Capacity
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                Live Data Scoped
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Disease incidence tracking, pediatric &amp; geriatric vulnerability, and hospital surge analysis
            </p>
          </div>
        </div>

        {/* In-Page Quick Location Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-[#FFFDF5] border border-amber-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[10px] font-black uppercase text-amber-800">State:</span>
            <select
              value={selectedState}
              onChange={(e) => updateFilter('state', e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer pr-1"
            >
              {metadata.states?.map(st => (
                <option key={st} value={st}>{st === 'All' ? 'All States' : st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#FFFDF5] border border-amber-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-amber-800">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer pr-1"
            >
              {stateCities.map(ct => (
                <option key={ct} value={ct}>
                  {ct === 'All' ? 'All Cities' : (selectedState !== 'All' ? `${selectedState} - ${ct}` : ct)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{totalRecords.toLocaleString()} Records</span>
          </div>
        </div>
      </div>

      {/* Active Jurisdiction Status Badge */}
      <div className="bg-[#FFFDF5] border border-amber-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-amber-950 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Displaying epidemiological metrics scoped to: <strong className="font-black text-amber-900">{locationLabel}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px] text-amber-800 font-bold">
          <span>Mean AQI: {summary.avg_aqi}</span>
          <span>Mean PM2.5: {summary.avg_pm25} µg/m³</span>
          <span>Total Cases: {summary.total_respiratory?.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Dynamic Health Impact Cards */}
      <HealthImpactCards
        asthmaPatients={summary.asthma_patients}
        hospitalAdmissions={summary.hospital_admissions}
        childrenRiskPct={summary.children_at_risk_pct}
        elderlyRiskPct={summary.elderly_at_risk_pct}
      />

      {/* Additional Risk Indices (Calculated from Local AQI & PM2.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-white rounded-2xl p-5 space-y-2 border border-[#F2E8D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Respiratory Complication Risk Index</span>
            <span className="text-xs font-bold text-red-700 font-mono">{summary.respiratory_risk_index} / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, summary.respiratory_risk_index)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-stone-500">
            Localized incidence of bronchospasm, asthma exacerbations, and acute respiratory distress in {locationLabel}.
          </p>
        </div>

        <div className="card-white rounded-2xl p-5 space-y-2 border border-[#F2E8D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Cardiovascular Stress Exposure Index</span>
            <span className="text-xs font-bold text-orange-700 font-mono">{summary.cardiovascular_risk_index} / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, summary.cardiovascular_risk_index)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-stone-500">
            Fine particulate translocation into bloodstream contributing to ischemic stress in {locationLabel}.
          </p>
        </div>
      </div>

      {/* Tier-Wise Hospital Surges Chart */}
      <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Hospital Admissions Escalation Across AQI Severity Tiers ({locationLabel})
            </h3>
            <p className="text-xs text-stone-500">Disease surge observed as local ambient air breaches Moderate (&gt;100) and Hazardous (&gt;300) thresholds</p>
          </div>
          <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
            {tierData.reduce((acc, t) => acc + (t.samples || 0), 0)} Observation Days
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
              <XAxis dataKey="tier" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11, fontWeight: 700 }} />
              <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                formatter={(val, name) => [`${val.toLocaleString()} Cases`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="respiratory" fill="#D97706" radius={[6, 6, 0, 0]} name="Respiratory Cases" />
              <Bar dataKey="hospital" fill="#DC2626" radius={[6, 6, 0, 0]} name="Hospital Admissions" />
              <Bar dataKey="asthma" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Asthma Consultations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demographic Breakdown & Scatter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerable Age Groups Bar Chart */}
        <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <Baby className="w-4 h-4 text-amber-600" />
              <span>Demographic Burden ({locationLabel})</span>
            </h3>
            <span className="text-xs font-bold text-stone-500">Age-Stratified Impact</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageCohorts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
                <XAxis dataKey="group" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10, fontWeight: 700 }} />
                <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} 
                  formatter={(val, name, item) => [`${val.toLocaleString()} cases (${item.payload.pct}%)`, 'Recorded Burden']}
                />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]} name="Cases Recorded">
                  {ageCohorts.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color || '#D97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pollutant vs Health Metric Scatter Plot */}
        <div className="card-white rounded-2xl p-5 space-y-4 border border-[#F2E8D5] shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <ScatterIcon className="w-4 h-4 text-red-600" />
              <span>PM2.5 vs Hospital Admissions Scatter ({locationLabel})</span>
            </h3>
            <span className="text-xs text-stone-500 font-bold">{scatterPoints.length} Local Data Points</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" />
                <XAxis dataKey="pollutantVal" name="PM2.5 Concentration" unit=" µg/m³" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <YAxis dataKey="cases" name="Hospital Admissions" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
                <ZAxis range={[50, 120]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val, name, item) => [
                    `${val} ${name.includes('PM2.5') ? 'µg/m³' : 'admissions'} (AQI: ${item.payload.aqi || 'N/A'})`,
                    name
                  ]}
                />
                <Scatter name="Telemetry Samples" data={scatterPoints} fill="#EA580C" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
