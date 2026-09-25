import React from 'react';
import { HeartPulse, Hospital, Baby, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';

export default function HealthImpactCards({
  asthmaPatients = 5121555,
  hospitalAdmissions = 7765652,
  childrenRiskPct = 12.6,
  elderlyRiskPct = 18.4
}) {
  const cards = [
    {
      title: "Asthma Patients",
      value: asthmaPatients.toLocaleString(),
      change: "+8.4%",
      isIncrease: true,
      subtext: "Acute exacerbations recorded",
      icon: HeartPulse,
      color: "red"
    },
    {
      title: "Hospital Admissions",
      value: hospitalAdmissions.toLocaleString(),
      change: "+12.1%",
      isIncrease: true,
      subtext: "Pollution-attributable admissions",
      icon: Hospital,
      color: "orange"
    },
    {
      title: "Children at Risk",
      value: `${childrenRiskPct}%`,
      change: "+3.2%",
      isIncrease: true,
      subtext: "Pediatric cohort under 14 yrs",
      icon: Baby,
      color: "gold"
    },
    {
      title: "Elderly at Risk",
      value: `${elderlyRiskPct}%`,
      change: "+5.6%",
      isIncrease: true,
      subtext: "Senior citizens age 60+",
      icon: UserCheck,
      color: "purple"
    }
  ];

  const colorStyles = {
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    gold: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const st = colorStyles[c.color] || colorStyles.gold;
        return (
          <div key={idx} className="card-white card-white-hover rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl border ${st.bg} ${st.text} ${st.border}`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="my-2">
              <span className="text-2xl font-black text-stone-900 tracking-tight">
                {c.value}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F2E8D5] text-xs">
              <span className="text-stone-500 text-[11px] truncate">{c.subtext}</span>
              <div className="flex items-center space-x-0.5 text-red-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{c.change}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
