import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

export default function ExecutiveBriefingPage() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/executive-briefing')
      .then(res => setBriefing(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Metric", "Value", "Unit"],
      ["National Mean AQI", "274.3", "AQI"],
      ["Population Exceeding Safe Limit", "66.4", "%"],
      ["Hospital Admissions Recorded", "7765652", "Patients"],
      ["Total Respiratory Burden", "13020383", "Patients"],
      ["PM 2.5 National Average", "159.7", "µg/m³"]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vayunet_executive_briefing_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Executive Briefing & Official National Dossier
            </h2>
            <p className="text-xs text-stone-500">Synthesized high-level briefing for ministerial and municipal executive leadership</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFDF5] hover:bg-stone-100 border border-[#E2D6C0] text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Report / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Paper Canvas */}
      <div className="card-white rounded-3xl p-8 sm:p-12 space-y-8 bg-white border border-[#EAE0CA] shadow-md max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b border-[#F2E8D5] pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-full">
              OFFICIAL ENVIRONMENTAL INTELLIGENCE DOSSIER
            </span>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight mt-2">
              National Air Quality & Public Health Risk Briefing
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Date: 25 September 2026 &bull; Central Ambient Air Quality Network
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-xl">
            STATUS: CRITICAL EXPOSURE
          </span>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            1. Executive Macro Overview
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed">
            The multi-station continuous telemetry network registers an all-India mean AQI of <strong>274.3</strong>, with approximately <strong>66.4%</strong> of monitored urban and rural population basins experiencing particulate levels above safe statutory limits. Over <strong>7.76 Million</strong> hospital admissions and <strong>13.02 Million</strong> acute respiratory consultations correlate directly with the autumn atmospheric stagnation phase.
          </p>
        </div>

        {/* Key Numerical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
            <span className="text-stone-500 font-medium">National AQI</span>
            <p className="text-xl font-black text-stone-900 font-mono mt-0.5">274.3</p>
          </div>
          <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
            <span className="text-stone-500 font-medium">Mean PM2.5</span>
            <p className="text-xl font-black text-red-700 font-mono mt-0.5">159.7 µg/m³</p>
          </div>
          <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
            <span className="text-stone-500 font-medium">Hospital Surges</span>
            <p className="text-xl font-black text-stone-900 font-mono mt-0.5">7.76M</p>
          </div>
          <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl">
            <span className="text-stone-500 font-medium">Population At Risk</span>
            <p className="text-xl font-black text-amber-800 font-mono mt-0.5">66.4%</p>
          </div>
        </div>

        {/* Section 2: Top Affected Regions */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            2. Priority Non-Attainment Geographic Belts
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-red-950 font-bold block">National Capital Region (Delhi-NCR)</strong>
                <span className="text-[11px] text-red-800">Severe Inversion &bull; AQI 384 &bull; Heavy ICU Load</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">Critical</span>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-amber-950 font-bold block">Indo-Gangetic Basin (UP & Bihar)</strong>
                <span className="text-[11px] text-amber-800">Particulate Trapping &bull; AQI 312 &bull; Pediatric Asthma Surges</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">Very High</span>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-stone-900 font-bold block">Central Mining & Industrial Corridor</strong>
                <span className="text-[11px] text-stone-600">Sulfur & Dust Emissions &bull; AQI 224 &bull; Occupational Bronchitis</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-700 text-white">Elevated</span>
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Directives */}
        <div className="space-y-3 pt-3 border-t border-[#F2E8D5]">
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
            3. Recommended Municipal Directives
          </h4>
          <ul className="space-y-2 text-xs text-stone-700">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Implement immediate vehicular restrictions and staggered public transport schedules in Tier-1 zones.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Enforce mechanized mist spraying along high-density traffic arteries to knock down surface PM10.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Coordinate hospital bed surge capacity and pediatric respiratory ward emergency protocols.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
