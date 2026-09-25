import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wind, 
  Activity, 
  ShieldAlert, 
  Map, 
  Sliders, 
  Cpu, 
  HeartPulse, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import api from '../../api/axios';

export default function LandingPage() {
  const [nationalData, setNationalData] = useState(null);

  useEffect(() => {
    api.get('/pollution/national')
      .then(res => setNationalData(res.data))
      .catch(console.error);
  }, []);

  const kpis = nationalData?.kpis || {
    avg_aqi: 274.3,
    avg_pm25: 159.7,
    high_risk_pct: 66.4,
    total_hospital: 7765652,
    total_respiratory: 13020383
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-800 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 border-b border-[#F2E8D5] bg-gradient-to-b from-[#FFFBF0] to-[#FFFDF5]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>India's Sovereign Environmental AI Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
              Surveillance, Prediction & Policy for Clean Indian Skies.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl font-normal">
              Empowering environmental scientists, municipal authorities, and public health leadership with real-time continuous ambient particulate intelligence across 36 states and union territories.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/app/overview"
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Launch National Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/app/map"
                className="flex items-center space-x-2 bg-white hover:bg-stone-50 border border-[#E9DFCB] text-stone-800 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <Map className="w-4 h-4 text-amber-600" />
                <span>Explore Geospatial Map</span>
              </Link>
            </div>

            {/* Micro verification badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F2E8D5] text-xs text-stone-500">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>50,000 Verified Telemetry Rows</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>RandomForest ML Inferences</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>NCAP 2026 Milestone Tracker</span>
              </div>
            </div>
          </div>

          {/* Right Live Teaser Card */}
          <div className="lg:col-span-5">
            <div className="card-white rounded-3xl p-6 shadow-xl space-y-5 bg-white border border-[#EFE5D2]">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">National Ambient Live Snapshot</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  Real-time Feed
                </span>
              </div>

              {/* Snapshot Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F2E8D5]">
                  <p className="text-[11px] font-bold text-stone-500 uppercase">National Mean AQI</p>
                  <p className="text-3xl font-black text-amber-800 font-mono mt-1">{kpis.avg_aqi}</p>
                  <span className="text-[10px] font-bold text-red-600">Severe Health Hazard</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F2E8D5]">
                  <p className="text-[11px] font-bold text-stone-500 uppercase">PM 2.5 Density</p>
                  <p className="text-3xl font-black text-red-800 font-mono mt-1">{kpis.avg_pm25}</p>
                  <span className="text-[10px] font-medium text-stone-500">Safe Limit: 60 µg/m³</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F2E8D5]">
                  <p className="text-[11px] font-bold text-stone-500 uppercase">High Risk Zones</p>
                  <p className="text-3xl font-black text-stone-900 font-mono mt-1">{kpis.high_risk_pct}%</p>
                  <span className="text-[10px] text-stone-500">Population regions</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F2E8D5]">
                  <p className="text-[11px] font-bold text-stone-500 uppercase">Attributed Surges</p>
                  <p className="text-2xl font-black text-stone-900 font-mono mt-1">{(kpis.total_hospital / 100000).toFixed(1)}L</p>
                  <span className="text-[10px] text-stone-500">Hospital cases</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs flex items-center justify-between text-red-800">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span className="font-bold">Active Siren Alert: Indo-Gangetic Winter Smog Inversion</span>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-2 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <span>Sign In to Access All Features</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
            Comprehensive Environmental Intelligence Modules
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            A cohesive suite combining geospatial telemetry, machine learning risk estimation, and interactive policy simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-white card-white-hover rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
              <Map className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Geospatial Sensor Grid</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Explore state-to-state and city-level ambient concentrations with color-coded risk categories, micro-climate metrics, and station audits.
            </p>
          </div>

          <div className="card-white card-white-hover rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 text-red-700 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Epidemiological Risk Tracking</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Quantify the healthcare burden across pediatric and senior citizen cohorts. Track asthma consultations and hospital admissions by severity tier.
            </p>
          </div>

          <div className="card-white card-white-hover rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Predictive Policy Simulator</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Model hypothetical policy interventions such as vehicular odd-even rules, industrial emission curbs, and green cover expansions to evaluate economic ROI.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
