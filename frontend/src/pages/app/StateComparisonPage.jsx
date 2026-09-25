import React, { useState, useEffect } from 'react';
import { Scale, Search, ArrowUpDown, ShieldCheck, ShieldAlert, BarChart3, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import api from '../../api/axios';

export default function StateComparisonPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateA, setStateA] = useState('Delhi');
  const [stateB, setStateB] = useState('Maharashtra');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/pollution/states')
      .then(res => {
        setStates(res.data);
        if (res.data.length > 1) {
          setStateA(res.data[0].state);
          setStateB(res.data[1].state);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const objA = states.find(s => s.state === stateA) || states[0];
  const objB = states.find(s => s.state === stateB) || states[1];

  const comparisonData = objA && objB ? [
    { metric: 'Mean AQI', [stateA]: objA.aqi, [stateB]: objB.aqi },
    { metric: 'PM 2.5 (µg/m³)', [stateA]: objA.pm25, [stateB]: objB.pm25 },
    { metric: 'PM 10 (µg/m³)', [stateA]: objA.pm10, [stateB]: objB.pm10 },
    { metric: 'NO2 (µg/m³)', [stateA]: objA.no2, [stateB]: objB.no2 },
  ] : [];

  // Top 10 Most Polluted States Bar (Streamlit parity)
  const top10States = [...states]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 10);

  const filteredStates = states.filter(s =>
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Scale className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              State-to-State Pollution & Exposure Benchmarking
            </h2>
            <p className="text-xs text-stone-500">Comparative multi-parameter evaluation across state jurisdictions</p>
          </div>
        </div>

        {/* Head-to-Head Selectors */}
        <div className="flex items-center space-x-3">
          <select
            value={stateA}
            onChange={(e) => setStateA(e.target.value)}
            className="p-2 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-bold text-amber-800 focus:outline-none cursor-pointer"
          >
            {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
          </select>
          <span className="text-xs font-black text-stone-400">VS</span>
          <select
            value={stateB}
            onChange={(e) => setStateB(e.target.value)}
            className="p-2 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-bold text-red-700 focus:outline-none cursor-pointer"
          >
            {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
          </select>
        </div>
      </div>

      {/* Side-by-Side Head-to-Head Bar Chart */}
      <div className="card-white rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Head-to-Head: {stateA} vs {stateB}</span>
          </h3>
          <span className="text-xs text-stone-500">Multilateral particulate & toxic gas concentrations</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
              <XAxis dataKey="metric" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 11 }} />
              <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey={stateA} fill="#D97706" radius={[6, 6, 0, 0]} />
              <Bar dataKey={stateB} fill="#DC2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 States Ranking Bar Chart (Streamlit Parity) */}
      <div className="card-white rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>Top 10 Most Critical States by Mean AQI</span>
          </h3>
          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Severe Hotspots</span>
        </div>

        <div className="h-68 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10States} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D0" vertical={false} />
              <XAxis dataKey="state" stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
              <YAxis stroke="#A8A29E" tick={{ fill: '#78716C', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE0CA', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="aqi" radius={[6, 6, 0, 0]} name="Mean AQI">
                {top10States.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.aqi > 300 ? '#DC2626' : entry.aqi > 200 ? '#EA580C' : '#D97706'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive State Data Table */}
      <div className="card-white rounded-2xl p-5 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            All-India Jurisdiction Leaderboard ({filteredStates.length} States)
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#FFFDF5] border-b border-[#F2E8D5] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">State / UT</th>
                <th className="p-3">Mean AQI</th>
                <th className="p-3">PM 2.5 (µg/m³)</th>
                <th className="p-3">PM 10 (µg/m³)</th>
                <th className="p-3">NO₂ (µg/m³)</th>
                <th className="p-3">Health Admissions</th>
                <th className="p-3">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EEDC]">
              {filteredStates.map((s) => (
                <tr key={s.state} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-3 font-bold text-stone-900">{s.state}</td>
                  <td className="p-3 font-mono font-bold text-amber-800">{s.aqi}</td>
                  <td className="p-3 font-mono">{s.pm25}</td>
                  <td className="p-3 font-mono">{s.pm10}</td>
                  <td className="p-3 font-mono">{s.no2}</td>
                  <td className="p-3 font-mono text-red-600">{s.admissions?.toLocaleString() || 'N/A'}</td>
                  <td className="p-3">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" 
                      style={{ backgroundColor: s.color || '#D97706' }}
                    >
                      {s.risk_level}
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
