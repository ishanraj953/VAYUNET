import React from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import { Wind, ShieldCheck, Database, Cpu, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-800 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>National Environmental Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            About VayuNet India Initiative
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl mx-auto">
            Centralized sovereign intelligence framework combining IoT particulate surveillance, epidemiological hospital tracking, and predictive machine learning.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-white rounded-2xl p-6 space-y-3">
            <Database className="w-8 h-8 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">50,000 Station Grid</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Synthesizing continuous telemetry for PM2.5, PM10, NO2, SO2, and CO alongside meteorological parameters across all Indian administrative zones.
            </p>
          </div>

          <div className="card-white rounded-2xl p-6 space-y-3">
            <Cpu className="w-8 h-8 text-red-600" />
            <h3 className="text-base font-bold text-stone-900">Explainable AI & ML</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Trained RandomForest multi-class risk models providing SHAP feature attribution to explain why specific air basins develop severe health hazards.
            </p>
          </div>

          <div className="card-white rounded-2xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <h3 className="text-base font-bold text-stone-900">Evidence-Based Governance</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Directly aligned with India's National Clean Air Programme (NCAP) 2026 targets, providing measurable before/after policy simulation models.
            </p>
          </div>
        </div>

        {/* Scientific Methodology */}
        <div className="card-white rounded-2xl p-8 space-y-4">
          <h3 className="text-lg font-black text-stone-900">Standard Ambient Verification Protocols</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            All ambient concentrations are benchmarked against the Central Pollution Control Board (CPCB) National Ambient Air Quality Standards (NAAQS). Health risk indices are derived using multi-pollutant epidemiological exposure matrices factoring in localized pediatric and geriatric vulnerability densities.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
