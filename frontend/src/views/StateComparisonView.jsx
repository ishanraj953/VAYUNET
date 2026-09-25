import React, { useState, useEffect } from 'react';
import { 
  Map, 
  ArrowUpDown, 
  Search, 
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function StateComparisonView() {
  const [statesData, setStatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateA, setStateA] = useState('Delhi');
  const [stateB, setStateB] = useState('Maharashtra');

  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(data => {
        setStatesData(data);
        if (data.length > 1) {
          setStateA(data[0].state);
          setStateB(data[1].state);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStates = statesData.filter(s => 
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const objA = statesData.find(s => s.state === stateA) || statesData[0];
  const objB = statesData.find(s => s.state === stateB) || statesData[1];

  const headToHeadData = objA && objB ? [
    { metric: 'Mean AQI', [stateA]: objA.aqi, [stateB]: objB.aqi },
    { metric: 'PM 2.5 (µg/m³)', [stateA]: objA.pm25, [stateB]: objB.pm25 },
    { metric: 'PM 10 (µg/m³)', [stateA]: objA.pm10, [stateB]: objB.pm10 },
    { metric: 'NO2 (µg/m³)', [stateA]: objA.no2, [stateB]: objB.no2 },
    { metric: 'SO2 (µg/m³)', [stateA]: objA.so2, [stateB]: objB.so2 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Map className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Inter-State Air Quality Matrix
            </h2>
            <p className="text-xs text-zinc-400">Comparative pollution exposure & state healthcare burden</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#090a0f] border border-[#262837] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none placeholder-zinc-500 w-36"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Head-to-Head Benchmarking */}
          <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-[#1c1e28]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Head-to-Head State Benchmark
                </h3>
                <p className="text-xs text-zinc-400">Select two states to perform side-by-side diagnostic analysis</p>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={stateA}
                  onChange={(e) => setStateA(e.target.value)}
                  className="bg-[#191b26] text-amber-400 border border-[#2c3044] rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                >
                  {statesData.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                </select>
                <span className="text-xs font-black text-red-500">VS</span>
                <select
                  value={stateB}
                  onChange={(e) => setStateB(e.target.value)}
                  className="bg-[#191b26] text-red-400 border border-[#2c3044] rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                >
                  {statesData.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                </select>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headToHeadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" vertical={false} />
                  <XAxis dataKey="metric" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey={stateA} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey={stateB} fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top States Chart */}
          <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              National State-Wise Average AQI Ranking
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statesData.slice(0, 15)} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" horizontal={false} />
                  <XAxis type="number" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis dataKey="state" type="category" stroke="#52525b" tick={{ fill: '#d4d4d8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="aqi" fill="#eab308" radius={[0, 6, 6, 0]} name="Mean AQI" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full State Table */}
          <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              All States Data Ledger ({filteredStates.length} States)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222430] text-zinc-400 font-bold uppercase tracking-wider bg-[#090a0f]">
                    <th className="p-3">Rank</th>
                    <th className="p-3">State</th>
                    <th className="p-3">Mean AQI</th>
                    <th className="p-3">PM 2.5</th>
                    <th className="p-3">PM 10</th>
                    <th className="p-3">NO2</th>
                    <th className="p-3">Hospital Cases</th>
                    <th className="p-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1e28]">
                  {filteredStates.map((s, idx) => (
                    <tr key={s.state} className="hover:bg-[#161822] transition-colors">
                      <td className="p-3 font-mono font-bold text-zinc-400">#{idx + 1}</td>
                      <td className="p-3 font-bold text-white">{s.state}</td>
                      <td className="p-3 font-mono font-extrabold text-amber-400">{s.aqi}</td>
                      <td className="p-3 font-mono text-zinc-300">{s.pm25}</td>
                      <td className="p-3 font-mono text-zinc-300">{s.pm10}</td>
                      <td className="p-3 font-mono text-zinc-300">{s.no2}</td>
                      <td className="p-3 font-mono text-red-400">{s.total_cases.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          s.aqi > 280 ? 'bg-red-950 text-red-400 border border-red-800' :
                          s.aqi > 180 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {s.aqi > 280 ? 'Severe' : s.aqi > 180 ? 'High Risk' : 'Moderate'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
