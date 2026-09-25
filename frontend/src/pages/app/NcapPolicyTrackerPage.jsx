import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  Flag, 
  Award, 
  Calendar, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  Download, 
  Zap, 
  Car, 
  Factory, 
  Trees, 
  Truck, 
  Flame, 
  Home, 
  Activity, 
  HeartPulse, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Sliders,
  ChevronRight,
  BarChart3,
  Check
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import KpiCard from '../../components/KpiCard';
import api from '../../api/axios';
import { useFilters } from '../../context/FilterContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRESETS = [
  {
    id: 'baseline',
    name: 'Standard Baseline',
    desc: 'Current municipal intervention levels',
    icon: Sliders,
    color: 'stone',
    values: {
      vehicular_control: 30,
      industrial_control: 30,
      green_space_expansion: 20,
      dust_construction_control: 25,
      agricultural_biomass_control: 20,
      clean_household_energy: 15
    }
  },
  {
    id: 'clean_mobility',
    name: 'Clean Mobility Drive',
    desc: 'Aggressive EV transition & Low Emission Zones',
    icon: Car,
    color: 'blue',
    values: {
      vehicular_control: 75,
      industrial_control: 35,
      green_space_expansion: 30,
      dust_construction_control: 40,
      agricultural_biomass_control: 20,
      clean_household_energy: 25
    }
  },
  {
    id: 'industrial_clean',
    name: 'Heavy Industry Clean-Tech',
    desc: 'Flue-gas scrubbing & Coal-to-Gas switch',
    icon: Factory,
    color: 'amber',
    values: {
      vehicular_control: 35,
      industrial_control: 80,
      green_space_expansion: 25,
      dust_construction_control: 45,
      agricultural_biomass_control: 25,
      clean_household_energy: 50
    }
  },
  {
    id: 'urban_green',
    name: 'Urban Green Shield',
    desc: 'Miyawaki forests & anti-dust misting',
    icon: Trees,
    color: 'emerald',
    values: {
      vehicular_control: 30,
      industrial_control: 30,
      green_space_expansion: 85,
      dust_construction_control: 75,
      agricultural_biomass_control: 25,
      clean_household_energy: 20
    }
  },
  {
    id: 'stubble_mitigation',
    name: 'Agri-Biomass Neutralizer',
    desc: 'Bio-decomposers & Happy Seeder subsidies',
    icon: Flame,
    color: 'pink',
    values: {
      vehicular_control: 30,
      industrial_control: 30,
      green_space_expansion: 25,
      dust_construction_control: 30,
      agricultural_biomass_control: 85,
      clean_household_energy: 45
    }
  },
  {
    id: 'ncap_max',
    name: 'NCAP 2026 Mission Mode',
    desc: 'All-sector deep decarbonization & compliance',
    icon: Sparkles,
    color: 'purple',
    values: {
      vehicular_control: 70,
      industrial_control: 70,
      green_space_expansion: 60,
      dust_construction_control: 65,
      agricultural_biomass_control: 65,
      clean_household_energy: 60
    }
  }
];

export default function NcapPolicyTrackerPage() {
  const { filters, updateFilter } = useFilters();
  const selectedState = filters.state || 'All';
  const rawCity = filters.city || 'All';
  const selectedCity = (selectedState && selectedState !== 'All' && rawCity.startsWith(`${selectedState} - `))
    ? rawCity.replace(`${selectedState} - `, '')
    : rawCity;

  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activePreset, setActivePreset] = useState('baseline');

  // 6 Sectoral Policy Levers (0-100%)
  const [levers, setLevers] = useState({
    vehicular_control: 30,
    industrial_control: 30,
    green_space_expansion: 20,
    dust_construction_control: 25,
    agricultural_biomass_control: 20,
    clean_household_energy: 15
  });

  const [simulationResult, setSimulationResult] = useState(null);

  // Initial load of NCAP tracker data
  useEffect(() => {
    api.get('/ncap-tracker')
      .then(res => setTracker(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Run simulation whenever levers or region changes
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 180);
    return () => clearTimeout(timer);
  }, [levers, selectedState, selectedCity]);

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/ncap/simulate', {
        state: selectedState,
        city: selectedCity,
        ...levers
      });
      setSimulationResult(res.data);
    } catch (err) {
      console.error('Failed to run sectoral policy simulation:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleLeverChange = (name, val) => {
    setActivePreset('custom');
    setLevers(prev => ({
      ...prev,
      [name]: parseFloat(val)
    }));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setLevers(preset.values);
  };

  const resetToBaseline = () => {
    applyPreset(PRESETS[0]);
  };

  // PDF Generation Function
  const exportPolicyPdf = () => {
    if (!simulationResult) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Primary Header Banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 80, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NATIONAL CLEAN AIR PROGRAMME (NCAP)', 40, 36);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Sectoral Policy Simulation & Statutory Mitigation Audit Report', 40, 52);

    doc.setFontSize(9);
    doc.setTextColor(245, 158, 11);
    doc.text(`Generated: ${new Date().toLocaleString()} | Target: NCAP 2026 Framework`, 40, 68);

    // Meta Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. SIMULATION SCOPE & REGIONAL JURISDICTION', 40, 105);

    autoTable(doc, {
      startY: 115,
      head: [['Parameter', 'Selected Setting', 'Benchmark Status']],
      body: [
        ['Target Jurisdiction', `${selectedState} - ${selectedCity}`, 'NCAP Priority Region'],
        ['Statutory Target', '40% PM2.5 & PM10 Reduction by 2026', 'National Clean Air Target'],
        ['Projected NCAP Compliance', `${simulationResult.health_impact?.ncap_progress_pct}% Completed`, simulationResult.health_impact?.compliance_status || 'On Track'],
        ['Estimated Economic Benefit', `₹ ${simulationResult.health_impact?.economic_benefit_crores} Crores`, 'Avoided Direct Healthcare Cost']
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 }
    });

    // Sectoral Levers Table
    const currY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. APPLIED SECTORAL POLICY INTERVENTION LEVERS', 40, currY);

    const leverRows = [
      ['Vehicular Emission Control (EVs, BS-VI, Low Emission Zones)', `${levers.vehicular_control}%`, 'NO2, CO, PM2.5 Abatement'],
      ['Industrial Emission Control (CEMS, FGD Scrubbers, Clean Fuel)', `${levers.industrial_control}%`, 'SO2, NO2, PM10 Abatement'],
      ['Green Space Expansion (Miyawaki Forests, Canopy Density)', `${levers.green_space_expansion}%`, 'PM2.5, PM10 Bio-filtering & Cooling'],
      ['Dust & Construction Control (Mechanized Sweeping, Misting)', `${levers.dust_construction_control}%`, 'PM10, Coarse Dust Abatement'],
      ['Agricultural & Biomass Stubble Control (Bio-decomposers)', `${levers.agricultural_biomass_control}%`, 'Seasonal PM2.5 Spike Mitigation'],
      ['Clean Household & Commercial Energy (PNG/LPG Expansion)', `${levers.clean_household_energy}%`, 'Indoor & Ambient Carbon Reduction']
    ];

    autoTable(doc, {
      startY: currY + 10,
      head: [['Sectoral Policy Lever', 'Implementation Intensity', 'Target Pollutant Spectrum']],
      body: leverRows,
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 4 },
      headStyles: { fillColor: [217, 119, 6], textColor: 255 }
    });

    // Pollutant Reduction Table
    const currY2 = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. PROJECTED AIR QUALITY & PUBLIC HEALTH OUTCOMES', 40, currY2);

    const base = simulationResult.baseline || {};
    const sim = simulationResult.simulated || {};
    const red = simulationResult.reductions || {};

    const outcomes = [
      ['Air Quality Index (AQI)', `${base.aqi || 274}`, `${sim.aqi || 200}`, `-${red.aqi_drop_pct || 0}%`],
      ['Particulate Matter 2.5 (ug/m3)', `${base.pm25 || 160}`, `${sim.pm25 || 110}`, `-${red.pm25_drop_pct || 0}%`],
      ['Particulate Matter 10 (ug/m3)', `${base.pm10 || 215}`, `${sim.pm10 || 150}`, `-${red.pm10_drop_pct || 0}%`],
      ['Nitrogen Dioxide NO2 (ug/m3)', `${base.no2 || 65}`, `${sim.no2 || 45}`, `-${red.no2_drop_pct || 0}%`],
      ['Sulfur Dioxide SO2 (ug/m3)', `${base.so2 || 42}`, `${sim.so2 || 28}`, `-${red.so2_drop_pct || 0}%`],
      ['Carbon Monoxide CO (mg/m3)', `${base.co || 1.6}`, `${sim.co || 1.1}`, `-${red.co_drop_pct || 0}%`],
      ['Avoided Respiratory Distress Cases', 'Baseline Risk', `${simulationResult.health_impact?.cases_prevented?.toLocaleString() || 0}`, 'Annual Prevented Cases'],
      ['Prevented Emergency Hospitalizations', 'Baseline Risk', `${simulationResult.health_impact?.hospital_admissions_prevented?.toLocaleString() || 0}`, 'Annual Prevented Admissions']
    ];

    autoTable(doc, {
      startY: currY2 + 10,
      head: [['Metric / Pollutant', 'Baseline Level', 'Simulated Level', 'Net Reduction / Benefit']],
      body: outcomes,
      theme: 'striped',
      styles: { fontSize: 8.5, cellPadding: 4 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255 }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Notice: This policy report is synthesized by the VayuNet AI National Clean Air Action Engine for municipal planning.',
      40,
      finalY > 780 ? 780 : finalY
    );

    doc.save(`NCAP_Policy_Simulation_${selectedState}_${selectedCity}.pdf`);
  };

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

  const sim = simulationResult || {};
  const reductions = sim.reductions || {};
  const health = sim.health_impact || {};
  const base = sim.baseline || {};
  const simVals = sim.simulated || {};

  // Pollutant comparison chart data
  const pollutantChartData = [
    { name: 'PM2.5', Baseline: base.pm25 || 159.7, Simulated: simVals.pm25 || 112.5, unit: 'µg/m³' },
    { name: 'PM10', Baseline: base.pm10 || 215.1, Simulated: simVals.pm10 || 148.0, unit: 'µg/m³' },
    { name: 'NO2', Baseline: base.no2 || 65.2, Simulated: simVals.no2 || 46.8, unit: 'µg/m³' },
    { name: 'SO2', Baseline: base.so2 || 42.5, Simulated: simVals.so2 || 29.3, unit: 'µg/m³' },
    { name: 'CO (x10)', Baseline: (base.co || 1.65) * 10, Simulated: (simVals.co || 1.15) * 10, unit: 'mg/m³' }
  ];

  // Sector breakdown data for charts
  const sectorData = sim.sector_breakdown || [
    { sector: 'Vehicular Emissions', share_pct: 32.5, color: '#3B82F6' },
    { sector: 'Industrial Emissions', share_pct: 28.0, color: '#F59E0B' },
    { sector: 'Green Space Expansion', share_pct: 14.5, color: '#10B981' },
    { sector: 'Dust & Construction', share_pct: 12.0, color: '#6366F1' },
    { sector: 'Biomass & Agriculture', share_pct: 8.0, color: '#EC4899' },
    { sector: 'Clean Domestic Energy', share_pct: 5.0, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#EBE3D5]">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-200">
            <Target className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                NCAP Sectoral Policy Simulator & Target Tracker
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Simulate granular cross-sector interventions: Vehicular, Industrial, Green Space, Dust, Agriculture & Clean Household Energy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={resetToBaseline}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
            title="Reset levers to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={exportPolicyPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download Policy Report (PDF)
          </button>
        </div>
      </div>

      {/* Strategic Policy Presets */}
      <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Strategic Policy Simulation Presets
            </h3>
          </div>
          <span className="text-[11px] font-bold text-stone-400">
            Click any scenario to instantly calibrate policy levers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                    : 'bg-[#FFFDF5] border-[#F2E8D5] hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                </div>
                <div className="font-bold text-xs text-stone-900 leading-tight">{p.name}</div>
                <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Policy Levers Grid (6 Sectoral Interventions) */}
      <div className="card-white rounded-2xl p-6 border border-[#EBE3D5] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2E8D5] pb-3">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              Sectoral Policy Intervention Levers (0% - 100%)
            </h3>
            <p className="text-xs text-stone-500">
              Adjust intensity sliders below to model real-time changes in air pollutants and health outcomes
            </p>
          </div>
          {simulating && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
              Calculating Impact...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Lever 1: Vehicular Emission Control */}
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Vehicular Emission Control</h4>
                  <span className="text-[10px] text-stone-500">EV Fleets & BS-VI Phasing</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-blue-50 text-blue-900 border border-blue-200">
                {levers.vehicular_control}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={levers.vehicular_control}
              onChange={(e) => handleLeverChange('vehicular_control', e.target.value)}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold">
              <span>0% Baseline</span>
              <span className="text-blue-700">High NO₂ / CO Drop</span>
              <span>100% Full EV</span>
            </div>
          </div>

          {/* Lever 2: Industrial Emission Control */}
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Industrial Emission Control</h4>
                  <span className="text-[10px] text-stone-500">FGD Scrubbers & Gas Conversion</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-amber-50 text-amber-900 border border-amber-200">
                {levers.industrial_control}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={levers.industrial_control}
              onChange={(e) => handleLeverChange('industrial_control', e.target.value)}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold">
              <span>0% Baseline</span>
              <span className="text-amber-700">High SO₂ / PM₁₀ Drop</span>
              <span>100% Zero-Carbon</span>
            </div>
          </div>

          {/* Lever 3: Green Space Expansion */}
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <Trees className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Green Space Expansion</h4>
                  <span className="text-[10px] text-stone-500">Miyawaki Forests & Buffers</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-emerald-50 text-emerald-900 border border-emerald-200">
                {levers.green_space_expansion}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={levers.green_space_expansion}
              onChange={(e) => handleLeverChange('green_space_expansion', e.target.value)}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold">
              <span>0% Low Canopy</span>
              <span className="text-emerald-700">Bio-filtration & Cooling</span>
              <span>100% 40% Canopy</span>
            </div>
          </div>

          {/* Lever 4: Dust & Construction Control */}
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Dust & Construction Control</h4>
                  <span className="text-[10px] text-stone-500">Anti-Smog Misting & Enclosures</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-indigo-50 text-indigo-900 border border-indigo-200">
                {levers.dust_construction_control}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={levers.dust_construction_control}
              onChange={(e) => handleLeverChange('dust_construction_control', e.target.value)}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold">
              <span>0% Standard</span>
              <span className="text-indigo-700">50% PM₁₀ Target</span>
              <span>100% Zero-Fugitive</span>
            </div>
          </div>

          {/* Lever 5: Agricultural & Biomass Stubble Burning */}
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-100 text-pink-800">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Biomass & Stubble Control</h4>
                  <span className="text-[10px] text-stone-500">Bio-decomposers & Happy Seeders</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-pink-50 text-pink-900 border border-pink-200">
                {levers.agricultural_biomass_control}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={levers.agricultural_biomass_control}
              onChange={(e) => handleLeverChange('agricultural_biomass_control', e.target.value)}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold">
              <span>0% Uncontrolled</span>
              <span className="text-pink-700">Winter Smoke Abatement</span>
              <span>100% Zero Burning</span>
            </div>
          </div>

          {/* Lever 6: Clean Household Energy */}
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Clean Household Energy</h4>
                  <span className="text-[10px] text-stone-500">LPG/PNG & Solar Mandates</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-purple-50 text-purple-900 border border-purple-200">
                {levers.clean_household_energy}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={levers.clean_household_energy}
              onChange={(e) => handleLeverChange('clean_household_energy', e.target.value)}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold">
              <span>0% Biomass Cook</span>
              <span className="text-purple-700">Indoor Air Quality</span>
              <span>100% 100% Clean Fuel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Composite AQI Drop */}
        <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Composite AQI Shift</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {simVals.aqi || 200.0}
            </span>
            <span className="text-xs text-stone-400 line-through font-mono">
              {base.aqi || 274.3}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 w-fit">
            <TrendingDown className="w-3.5 h-3.5" />
            -{reductions.aqi_drop_pct || 0}% AQI Drop
          </div>
        </div>

        {/* PM2.5 & PM10 Reduction */}
        <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">PM2.5 / PM10 Abatement</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 font-mono">
              -{reductions.pm25_drop_pct || 0}%
            </span>
            <span className="text-xs font-bold text-stone-500">PM2.5 / -{reductions.pm10_drop_pct || 0}% PM10</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Current: {simVals.pm25 || 0} µg/m³ (from {base.pm25 || 0})
          </div>
        </div>

        {/* Prevented Respiratory & Hospital Cases */}
        <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Prevented Hospitalizations</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {health.hospital_admissions_prevented?.toLocaleString() || 0}
            </span>
            <span className="text-xs font-bold text-stone-500">Admissions Avoided</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium">
            {health.cases_prevented?.toLocaleString() || 0} Respiratory Cases Avoided
          </div>
        </div>

        {/* Economic Health Benefit */}
        <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Economic Health Savings</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-700 font-mono">
              ₹ {health.economic_benefit_crores?.toLocaleString() || 0}
            </span>
            <span className="text-xs font-bold text-stone-500">Cr. Savings</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-900">
            <Award className="w-3.5 h-3.5" />
            NCAP Progress: {health.ncap_progress_pct || 28.5}%
          </div>
        </div>
      </div>

      {/* Visual Analytics Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pollutant Baseline vs Simulated Levels */}
        <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Pollutant Baseline vs Simulated Level
              </h3>
            </div>
            <span className="text-[10px] font-bold text-stone-400">Concentrations in µg/m³</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EEDC" />
                <XAxis dataKey="name" stroke="#78716C" fontSize={11} />
                <YAxis stroke="#78716C" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF5',
                    borderColor: '#F2E8D5',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Baseline" fill="#94A3B8" name="Baseline Ambient" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated" fill="#D97706" name="Simulated Post-Policy" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sectoral Abatement Contribution Share */}
        <div className="card-white rounded-2xl p-5 border border-[#EBE3D5] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Sectoral Abatement Contribution Share (%)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-stone-400">Proportional Weight</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    dataKey="share_pct"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFDF5',
                      borderColor: '#F2E8D5',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}%`, 'Contribution']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {sectorData.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                    <span className="text-stone-700 font-medium truncate max-w-[130px]">{s.sector}</span>
                  </div>
                  <span className="font-mono font-black text-stone-900">{s.share_pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="card-white rounded-2xl p-5 space-y-4 overflow-hidden border border-[#EBE3D5]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-600" />
            Statutory NCAP Programs & Municipal Targets
          </h3>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-3 py-1 rounded-xl">
            Target Deadline: 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F2E8D5] text-stone-500 font-bold uppercase tracking-wider bg-[#FFFDF5]">
                <th className="p-3">Policy / Program</th>
                <th className="p-3">Jurisdiction / Scope</th>
                <th className="p-3">Target Objective</th>
                <th className="p-3">Implementation Progress</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EEDC]">
              {t.programs?.map((prog, idx) => (
                <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
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
      <div className="card-white rounded-2xl p-5 space-y-4 border border-[#EBE3D5]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            State Clean Air Performance Scorecards
          </h3>
          <span className="text-xs text-stone-500">Benchmark comparison vs 2026 Target</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {t.state_grades?.map((sg) => (
            <div key={sg.state} className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] flex items-center justify-between shadow-xs">
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
