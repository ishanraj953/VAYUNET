import React, { useState, useEffect } from 'react';
import { Target, Flag, Award, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function PolicyTrackerView() {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/policy-tracker')
      .then(res => res.json())
      .then(d => setTracker(d))
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

  const { ncap_target_year = 2026, target_pm_reduction_pct = 40.0, national_progress_pct = 28.5, milestones = [], state_grades = [] } = tracker || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Target className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              National Clean Air Programme (NCAP) 2026 Tracker
            </h2>
            <p className="text-xs text-zinc-400">Monitoring India's 40% PM2.5 reduction targets and state progress scores</p>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="NCAP Target Milestone"
          value={`Year ${ncap_target_year}`}
          subtitle="Statutory target deadline"
          icon={Calendar}
          color="yellow"
        />
        <MetricCard
          title="National Target Reduction"
          value={`-${target_pm_reduction_pct}%`}
          subtitle="PM2.5 baseline reduction target"
          icon={Flag}
          color="red"
        />
        <MetricCard
          title="Achieved Progress"
          value={`${national_progress_pct}%`}
          subtitle="Aggregated clean air trajectory"
          icon={Award}
          color="yellow"
        />
      </div>

      {/* Milestones Timeline & State Scorecards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Key NCAP Strategic Milestones
          </h3>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#161822] border border-[#232637] flex items-start space-x-3">
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                  {m.year}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{m.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{m.impact}</p>
                  <span className={`inline-block mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    m.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    m.status === 'Active' ? 'bg-red-950 text-red-400 border border-red-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Performance Grades */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            State NCAP Grade Card
          </h3>

          <div className="space-y-2">
            {state_grades.map(sg => (
              <div key={sg.state} className="flex items-center justify-between p-3 rounded-xl bg-[#161822] border border-[#232637]">
                <div>
                  <h4 className="text-xs font-bold text-white">{sg.state}</h4>
                  <p className="text-[10px] text-zinc-400">{sg.status}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-emerald-400">{sg.pm_drop}</span>
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center justify-center">
                    {sg.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
