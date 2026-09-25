import React, { useState, useEffect } from 'react';
import { Target, Flag, Award, Calendar, CheckCircle2, TrendingDown } from 'lucide-react';
import KpiCard from '../../components/KpiCard';
import api from '../../api/axios';

export default function NcapPolicyTrackerPage() {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ncap-tracker')
      .then(res => setTracker(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const t = tracker || {
    program_title: "National Clean Air Programme (NCAP) Action Framework",
    national_target: "40% PM2.5 & PM10 Reduction by 2026",
    progress_achieved_pct: 28.5,
    cities_covered: 131,
    monitoring_stations: 1420,
    programs: [],
    state_grades: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Target className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              National Clean Air Programme (NCAP) Policy Tracker
            </h2>
            <p className="text-xs text-stone-500">Statutory 40% PM reduction target roadmap & municipal implementation progress</p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-3 py-1 rounded-xl">
          Target Deadline: 2026
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="National Reduction Target"
          value="-40.0%"
          subtitle="PM2.5 & PM10 Baseline Target"
          icon={Flag}
          color="red"
        />
        <KpiCard
          title="National Progress Achieved"
          value={`${t.progress_achieved_pct}%`}
          subtitle="Consolidated clean air trajectory"
          icon={Award}
          color="gold"
        />
        <KpiCard
          title="Monitored Municipalities"
          value={t.cities_covered}
          unit="Non-Attainment Cities"
          subtitle="1,420 CAAQMS Stations"
          icon={Calendar}
          color="green"
        />
      </div>

      {/* Programs Table */}
      <div className="card-white rounded-2xl p-5 space-y-4 overflow-hidden">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          Strategic Interventions & Municipal Programs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F2E8D5] text-stone-500 font-bold uppercase tracking-wider bg-[#FFFDF5]">
                <th className="p-3">Policy / Program</th>
                <th className="p-3">Jurisdiction / Location</th>
                <th className="p-3">Target Objective</th>
                <th className="p-3">Implementation Progress</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EEDC]">
              {t.programs?.map((prog, idx) => (
                <tr key={idx} className="hover:bg-amber-50/40">
                  <td className="p-3 font-bold text-stone-900">{prog.program_name}</td>
                  <td className="p-3 text-stone-600">{prog.location}</td>
                  <td className="p-3 text-stone-700 font-medium">{prog.target}</td>
                  <td className="p-3">
                    <div className="space-y-1 w-36">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="font-bold text-stone-800">{prog.progress}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${prog.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      {prog.badge}
                    </span>
                  </td>
                  <td className="p-3 text-stone-400 font-mono text-[11px]">{prog.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Progress Grades */}
      <div className="card-white rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
          State Performance Scorecards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {t.state_grades?.map((sg) => (
            <div key={sg.state} className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900">{sg.state}</h4>
                <span className="text-[10px] text-stone-500">{sg.status}</span>
                <p className="text-xs font-mono font-bold text-emerald-700 mt-1">{sg.pm_reduction}</p>
              </div>
              <span className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center justify-center">
                {sg.grade}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
