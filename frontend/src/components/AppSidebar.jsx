import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Building2, 
  Scale, 
  LineChart, 
  HeartPulse, 
  TrendingUp, 
  Sliders, 
  Cpu, 
  Gauge, 
  Sparkles, 
  AlertTriangle, 
  Radio,
  CheckCircle2, 
  Target, 
  FileText,
  User,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wind
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { name: "National Overview", path: "/app/overview", icon: LayoutDashboard },
        { name: "Interactive Map", path: "/app/map", icon: Map },
        { name: "City Deep-Dive", path: "/app/city-deepdive", icon: Building2 },
        { name: "State Comparison", path: "/app/state-comparison", icon: Scale },
      ]
    },
    {
      title: "ANALYTICS",
      items: [
        { name: "Trends & Analysis", path: "/app/trends", icon: LineChart },
        { name: "Health Risk Impact", path: "/app/health-impact", icon: HeartPulse },
        { name: "Predictive Insights", path: "/app/predictive-insights", icon: TrendingUp },
      ]
    },
    {
      title: "AI & PREDICTION",
      items: [
        { name: "Policy Simulator", path: "/app/policy-simulator", icon: Sliders },
        { name: "AI Risk Predictor", path: "/app/ai-predictor", icon: Cpu },
        { name: "Model Performance", path: "/app/model-performance", icon: Gauge },
        { name: "Explainability (XAI)", path: "/app/explainability", icon: Sparkles },
      ]
    },
    {
      title: "GOVERNANCE & ALERTS",
      items: [
        { name: "Live Alert Command", path: "/app/live-early-warning", icon: Radio, badge: "LIVE" },
        { name: "Early Warning Grid", path: "/app/early-warning", icon: AlertTriangle },
        { name: "Data Quality & Audit", path: "/app/data-quality", icon: CheckCircle2 },
        { name: "NCAP Policy Tracker", path: "/app/ncap-tracker", icon: Target },
        { name: "Executive Briefing", path: "/app/executive-briefing", icon: FileText },
      ]
    }
  ];

  return (
    <aside className={`transition-all duration-300 ease-in-out bg-[#FFFDF5] border-r border-[#F2E8D5] flex flex-col h-[calc(100vh-61px)] sticky top-[61px] z-20 ${
      collapsed ? 'w-20' : 'w-68'
    }`}>
      {/* Brand Header */}
      <div className="p-4 border-b border-[#F2E8D5] flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xs">
              <Wind className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-stone-900 uppercase">
                VAYUNET INDIA
              </h2>
              <p className="text-[10px] text-stone-500 leading-tight">
                Air Pollution & Health Risk Intelligence
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xs">
            <Wind className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-stone-200/60 text-stone-500 transition-colors cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-stone-400 uppercase mb-1">
                {sec.title}
              </h3>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-100/80 text-amber-900 font-bold border border-amber-300/80 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50/60'
                    }`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0 text-amber-700" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Live Data Status & User Panel */}
      <div className="p-3 border-t border-[#F2E8D5] bg-[#FFFBF0]/60 space-y-2">
        {/* Live Status indicator */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} text-[11px] px-2 py-1`}>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {!collapsed && <span className="font-semibold text-stone-700">Live Telemetry</span>}
          </div>
          {!collapsed && <span className="text-[10px] text-stone-400 font-mono">50K Synced</span>}
        </div>

        {/* User Quick Info */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} pt-2 border-t border-stone-200/50`}>
          <Link to="/app/profile" className="flex items-center space-x-2 overflow-hidden" title="My Profile">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt="Avatar"
              className="w-7 h-7 rounded-lg object-cover border border-amber-200 shrink-0"
            />
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-stone-800 truncate">{user?.name || 'Officer'}</p>
                <p className="text-[10px] text-stone-500 truncate">{user?.role || 'Analyst'}</p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <div className="flex items-center space-x-1">
              <Link to="/app/settings" className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50" title="Settings">
                <SettingsIcon className="w-3.5 h-3.5" />
              </Link>
              <button onClick={logout} className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
