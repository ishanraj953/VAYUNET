import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Map, 
  LineChart, 
  HeartPulse, 
  Sliders, 
  Cpu, 
  Gauge, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  FileText,
  Flame,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0 }) {
  const menuItems = [
    {
      category: 'CORE INTELLIGENCE',
      items: [
        { id: 'overview', label: 'National Overview', icon: LayoutDashboard, badge: 'Live' },
        { id: 'cities', label: 'City Deep-Dive', icon: Building2 },
        { id: 'states', label: 'State Comparison', icon: Map },
        { id: 'analysis', label: 'Trends & Analysis', icon: LineChart },
        { id: 'health', label: 'Health Risk Impact', icon: HeartPulse, badge: 'Critical' },
      ]
    },
    {
      category: 'AI & PREDICTION',
      items: [
        { id: 'simulator', label: 'Policy Simulator', icon: Sliders, color: 'yellow' },
        { id: 'prediction', label: 'AI Risk Predictor', icon: Cpu, badge: 'ML' },
        { id: 'performance', label: 'Model Performance', icon: Gauge },
        { id: 'explainability', label: 'Explainability (XAI)', icon: Sparkles },
      ]
    },
    {
      category: 'GOVERNANCE & ALERTS',
      items: [
        { id: 'alerts', label: 'Early Warning Grid', icon: AlertTriangle, count: alertCount, alert: true },
        { id: 'quality', label: 'Data Quality & Audit', icon: CheckCircle2 },
        { id: 'tracker', label: 'NCAP Policy Tracker', icon: Target },
        { id: 'reports', label: 'Executive Briefing', icon: FileText },
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0d0e14] border-r border-[#222430] flex flex-col h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="p-4 space-y-6">
        {menuItems.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {sec.category}
            </h3>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/20 to-amber-500/20 text-white border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#151722]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          item.badge === 'Live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          item.badge === 'Critical' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.alert && item.count > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-black shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse">
                          {item.count}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cyber status footer */}
      <div className="mt-auto p-4 border-t border-[#1c1e28] bg-[#090a0f]">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          <div className="text-[11px]">
            <p className="font-bold text-zinc-300">FastAPI ML Node</p>
            <p className="text-[10px] text-zinc-400">Port 8000 &bull; RandomForest Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
