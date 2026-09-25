import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  Download, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  ShieldAlert,
  Ban,
  Wind,
  HeartPulse,
  Users,
  Truck,
  Droplets,
  Copy,
  Check,
  CheckSquare,
  Square,
  Filter,
  ArrowRight,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import api from '../../api/axios';
import { useFilters } from '../../context/FilterContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AiRiskPredictorPage() {
  const { filters } = useFilters();
  const selectedState = filters.state || 'Bihar';
  const rawCity = filters.city || 'CityA';
  // Strip "State - City" prefix if present
  const selectedCity = (selectedState && selectedState !== 'All' && rawCity.startsWith(`${selectedState} - `))
    ? rawCity.replace(`${selectedState} - `, '')
    : rawCity;

  // Horizon: Next-day (24h), Next-week (7d), Next-month (30d)
  const [horizon, setHorizon] = useState('Next-day (24h)');
  const [batchPredict, setBatchPredict] = useState(false);

  // Precaution cards interactive states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [acknowledgedCards, setAcknowledgedCards] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Baseline data loaded dynamically from real dataset for state & city
  const [baselineData, setBaselineData] = useState({
    PM2_5: 195.0,
    PM10: 336.0,
    NO2: 109.0,
    AQI: 263,
    SO2: 9.0,
    CO: 2.86,
    temperature: 28.0,
    humidity: 55.0,
    wind_speed: 3.0,
    traffic_density: 'Medium',
    daily_respiratory_cases: 265.0,
    daily_hospital_admissions: 152.0
  });

  // What-if scenario sliders
  const [scenario, setScenario] = useState({
    PM2_5: 195.0,
    PM10: 336.0,
    NO2: 109.0,
    AQI: 263,
    SO2: 9.0,
    CO: 2.86
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [evaluatedAt, setEvaluatedAt] = useState(null);

  // Fetch baseline values when State or City changes
  useEffect(() => {
    let isMounted = true;
    async function fetchBaseline() {
      try {
        const res = await api.get('/prediction/baseline', {
          params: { state: selectedState, city: selectedCity }
        });
        if (res.data && isMounted) {
          const b = res.data;
          setBaselineData(b);
          setScenario({
            PM2_5: b.PM2_5,
            PM10: b.PM10,
            NO2: b.NO2,
            AQI: b.AQI,
            SO2: b.SO2,
            CO: b.CO
          });
          // Automatically trigger prediction with city baselines
          triggerPrediction({
            state: selectedState,
            city: selectedCity,
            horizon,
            batch_predict: batchPredict,
            PM2_5: b.PM2_5,
            PM10: b.PM10,
            NO2: b.NO2,
            AQI: b.AQI,
            SO2: b.SO2,
            CO: b.CO,
            temperature: b.temperature,
            humidity: b.humidity,
            wind_speed: b.wind_speed,
            traffic_density: b.traffic_density
          });
        }
      } catch (err) {
        console.error('Failed to fetch baseline:', err);
      }
    }
    fetchBaseline();
    return () => { isMounted = false; };
  }, [selectedState, selectedCity]);

  // Trigger prediction API
  const triggerPrediction = async (customPayload) => {
    setLoading(true);
    try {
      const payload = customPayload || {
        state: selectedState,
        city: selectedCity,
        horizon,
        batch_predict: batchPredict,
        PM2_5: scenario.PM2_5,
        PM10: scenario.PM10,
        NO2: scenario.NO2,
        AQI: scenario.AQI,
        SO2: scenario.SO2,
        CO: scenario.CO,
        temperature: baselineData.temperature,
        humidity: baselineData.humidity,
        wind_speed: baselineData.wind_speed,
        traffic_density: baselineData.traffic_density
      };

      const res = await api.post('/predict', payload);
      if (res && res.data) {
        setResult(res.data);
        setEvaluatedAt(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Prediction API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field, val) => {
    const num = parseFloat(val);
    setScenario(prev => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num
    }));
  };

  const handleReset = () => {
    setScenario({
      PM2_5: baselineData.PM2_5,
      PM10: baselineData.PM10,
      NO2: baselineData.NO2,
      AQI: baselineData.AQI,
      SO2: baselineData.SO2,
      CO: baselineData.CO
    });
    triggerPrediction({
      state: selectedState,
      city: selectedCity,
      horizon,
      batch_predict: batchPredict,
      PM2_5: baselineData.PM2_5,
      PM10: baselineData.PM10,
      NO2: baselineData.NO2,
      AQI: baselineData.AQI,
      SO2: baselineData.SO2,
      CO: baselineData.CO,
      temperature: baselineData.temperature,
      humidity: baselineData.humidity,
      wind_speed: baselineData.wind_speed,
      traffic_density: baselineData.traffic_density
    });
  };

  // Horizon change handler
  const handleHorizonChange = (h) => {
    setHorizon(h);
    triggerPrediction({
      state: selectedState,
      city: selectedCity,
      horizon: h,
      batch_predict: batchPredict,
      PM2_5: scenario.PM2_5,
      PM10: scenario.PM10,
      NO2: scenario.NO2,
      AQI: scenario.AQI,
      SO2: scenario.SO2,
      CO: scenario.CO,
      temperature: baselineData.temperature,
      humidity: baselineData.humidity,
      wind_speed: baselineData.wind_speed,
      traffic_density: baselineData.traffic_density
    });
  };

  // Toggle precaution acknowledgment
  const toggleAcknowledge = (id) => {
    setAcknowledgedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle all precautions
  const toggleAllPrecautions = (cards) => {
    if (!cards || cards.length === 0) return;
    const allChecked = cards.every(c => acknowledgedCards[c.id]);
    const nextState = { ...acknowledgedCards };
    cards.forEach(c => {
      nextState[c.id] = !allChecked;
    });
    setAcknowledgedCards(nextState);
  };

  // Copy precaution advisory text
  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Precaution Icon Renderer
  const renderPrecautionIcon = (iconName) => {
    switch (iconName) {
      case 'shield-alert':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'ban':
        return <Ban className="w-5 h-5 text-rose-600" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-cyan-600" />;
      case 'heart-pulse':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'users':
        return <Users className="w-5 h-5 text-amber-600" />;
      case 'truck':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'droplets':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'activity':
      case 'navigation':
        return <Activity className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  // Generate and Download PDF Report
  const handleDownloadPDF = () => {
    if (!result) return;
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('VAYUNET INDIA - AI HEALTH RISK PREDICTION REPORT', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()} | Model: RandomForestClassifier (200 Trees)`, 14, 20);
      doc.text(`Geographic Target: ${selectedState} - ${selectedCity} | Horizon: ${horizon}`, 14, 25);

      // Section 1: Executive Prediction Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Prediction Confidence & Risk Classification', 14, 38);

      const confData = [
        ['Target Risk Classification', `${result.predicted_risk_level || 'Medium'} Risk`],
        ['Confidence Score', `${result.confidence_score_pct || (result.confidence_score + '%')}`],
        ['Reliability Assessment', `${result.reliability || 'High'}`],
        ['Runner-up Risk Candidate', `${result.runner_up_risk || '0 (17.0%)'}`],
        ['Evaluated Computed AQI', `${result.computed_aqi} AQI Points`]
      ];

      autoTable(doc, {
        startY: 42,
        head: [['Metric', 'Evaluated Inference']],
        body: confData,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 9 }
      });

      // Section 2: Probability Distribution
      let currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Class Probability Distribution by Risk Level', 14, currentY);

      const probRows = (result.probability_distribution || []).map(p => [
        p.index.toString(),
        p.risk_level,
        p.prob_pct || `${p.probability}%`
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['#', 'Risk Level Tier', 'Model Probability']],
        body: probRows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 }
      });

      // Section 3: Before vs After Comparison
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Before vs After Pollutant What-if Scenario Matrix', 14, currentY);

      const b = result.before_vs_after?.baseline || {};
      const w = result.before_vs_after?.what_if || {};
      const d = result.before_vs_after?.deltas || {};

      const matrixRows = [
        ['PM2.5 (ug/m3)', `${b.PM2_5 || scenario.PM2_5}`, `${w.PM2_5 || scenario.PM2_5}`, `${d.PM2_5 || '+0.0'}`],
        ['PM10 (ug/m3)', `${b.PM10 || scenario.PM10}`, `${w.PM10 || scenario.PM10}`, `${d.PM10 || '+0.0'}`],
        ['AQI (Air Quality Index)', `${b.AQI || scenario.AQI}`, `${w.AQI || scenario.AQI}`, `${d.AQI || '+0'}`],
        ['NO2 (ppb)', `${b.NO2 || scenario.NO2}`, `${w.NO2 || scenario.NO2}`, `${d.NO2 || '+0.0'}`],
        ['SO2 (ppb)', `${b.SO2 || scenario.SO2}`, `${w.SO2 || scenario.SO2}`, `${d.SO2 || '+0.0'}`],
        ['CO (ppm)', `${b.CO || scenario.CO}`, `${w.CO || scenario.CO}`, `${d.CO || '+0.00'}`]
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Pollutant Parameter', 'Current State (Baseline)', 'Predicted State (What-if)', 'Delta Shift']],
        body: matrixRows,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 }
      });

      // Section 4: Health Impact Projections
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Health Impact & Respiratory Cases Forecast', 14, currentY);

      const hi = result.health_impact || {};
      const healthRows = [
        ['Time Horizon Scope', `${hi.horizon_label || horizon}`],
        ['Baseline Respiratory Cases', `${(hi.baseline_respiratory_cases || 0).toLocaleString()}`],
        ['Predicted Respiratory Cases', `${(hi.predicted_respiratory_cases || 0).toLocaleString()}`],
        ['Avoided / Excess Respiratory Cases', `${hi.avoided_badge_text || '0 cases AVOIDED'}`],
        ['Baseline Hospital Admissions', `${(hi.baseline_hospital_admissions || 0).toLocaleString()}`],
        ['Predicted Hospital Admissions', `${(hi.predicted_hospital_admissions || 0).toLocaleString()}`]
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Epidemiological Indicator', 'Forecast Projection']],
        body: healthRows,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 9 }
      });

      // Section 5: Recommended Action Plan
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Recommended Public Health Precaution Directives', 14, currentY);

      const precautionRows = (result.precautions_cards || []).map(pc => [
        pc.priority,
        pc.title,
        pc.target_audience,
        pc.description
      ]);

      if (precautionRows.length > 0) {
        autoTable(doc, {
          startY: currentY + 4,
          head: [['Priority', 'Action Title', 'Target Demographic', 'Clinical Directive']],
          body: precautionRows,
          theme: 'striped',
          headStyles: { fillColor: [217, 119, 6] },
          styles: { fontSize: 8 }
        });
      }

      // Footer
      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 8;
      if (currentY < 280) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('Disclaimer: This automated predictive report is generated via machine learning inference on ambient air quality datasets.', 14, currentY);
      }

      // Save PDF
      doc.save(`VAYUNET_Prediction_Report_${selectedState}_${selectedCity}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('PDF generation error. Please try again.');
    }
  };

  // Filtered Precautions Cards
  const allCards = result?.precautions_cards || (result?.recommended_precautions || []).map((desc, idx) => ({
    id: `p-${idx}`,
    title: `Precaution Directive #${idx + 1}`,
    description: desc,
    category: 'General Public',
    priority: 'High',
    target_audience: 'All Citizens',
    icon: 'shield-alert',
    impact: 'Protects respiratory health from ambient toxicity'
  }));

  const categories = ['All', ...Array.from(new Set(allCards.map(c => c.category)))];
  const filteredCards = selectedCategory === 'All' 
    ? allCards 
    : allCards.filter(c => c.category === selectedCategory);

  const acknowledgedCount = allCards.filter(c => acknowledgedCards[c.id]).length;
  const progressPct = allCards.length > 0 ? Math.round((acknowledgedCount / allCards.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-stone-900">
      
      {/* Top Prediction Horizon Selector (Matching user screenshot media_1790347486208.jpg) */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm text-stone-800">Prediction Horizon:</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {['Next-day (24h)', 'Next-week (7d)', 'Next-month (30d)'].map((h) => (
              <label key={h} className="flex items-center space-x-2 cursor-pointer select-none text-sm text-stone-700">
                <input
                  type="radio"
                  name="predictionHorizon"
                  value={h}
                  checked={horizon === h}
                  onChange={() => handleHorizonChange(h)}
                  className="w-4 h-4 text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={horizon === h ? "font-bold text-blue-700" : ""}>{h}</span>
              </label>
            ))}
          </div>

          {result && (
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PDF Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Adjust Pollutant Levels (What-if Scenario) (Matching media_1790347486208.jpg) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center space-x-2">
            <span>Adjust Pollutant Levels (What-if Scenario):</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            Active Baseline: <strong className="text-stone-800">{selectedState} - {selectedCity}</strong>
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PM2.5 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>PM2.5 (µg/m³)</span>
              <span className="font-mono text-blue-600 font-black">{scenario.PM2_5.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="0.5"
              value={scenario.PM2_5}
              onChange={(e) => handleSliderChange('PM2_5', e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* PM10 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>PM10 (µg/m³)</span>
              <span className="font-mono text-blue-600 font-black">{scenario.PM10.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="600"
              step="0.5"
              value={scenario.PM10}
              onChange={(e) => handleSliderChange('PM10', e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* NO2 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>NO2 (ppb)</span>
              <span className="font-mono text-blue-600 font-black">{scenario.NO2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="0.5"
              value={scenario.NO2}
              onChange={(e) => handleSliderChange('NO2', e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* AQI */}
          <div className="space-y-2 md:col-span-3">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>AQI</span>
              <span className="font-mono text-blue-600 font-black">{Math.round(scenario.AQI)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="1"
              value={scenario.AQI}
              onChange={(e) => handleSliderChange('AQI', e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* SO2 */}
          <div className="space-y-2 md:col-span-3">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>SO2 (ppb)</span>
              <span className="font-mono text-blue-600 font-black">{scenario.SO2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={scenario.SO2}
              onChange={(e) => handleSliderChange('SO2', e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>0.00</span>
              <span>100.00</span>
            </div>
          </div>

          {/* CO */}
          <div className="space-y-2 md:col-span-3">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>CO (ppm)</span>
              <span className="font-mono text-blue-600 font-black">{scenario.CO.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.05"
              value={scenario.CO}
              onChange={(e) => handleSliderChange('CO', e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => triggerPrediction()}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loading ? 'Evaluating Model...' : '🚀 Run Prediction'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 Reset</span>
            </button>

            <label className="flex items-center space-x-2 text-xs font-medium text-stone-600 cursor-pointer select-none ml-4">
              <input
                type="checkbox"
                checked={batchPredict}
                onChange={(e) => setBatchPredict(e.target.checked)}
                className="w-4 h-4 rounded-sm text-blue-600 border-stone-300 focus:ring-blue-500"
              />
              <span>Batch Predict</span>
            </label>
          </div>

          {evaluatedAt && (
            <span className="text-xs text-stone-500 font-mono">
              Model Inferred at: <strong>{evaluatedAt}</strong>
            </span>
          )}
        </div>

        {/* Note from screenshot */}
        <div className="pt-2 text-[11px] text-stone-500">
          This dashboard is intended for exploratory analysis and demonstration. Review model performance and preprocess pipeline before production deployment.
        </div>
      </div>

      {/* Prediction Results Display (Matching media_1790347642355.jpg) */}
      {result && (
        <div className="space-y-6">

          {/* 1. Prediction Confidence Section */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
              <span className="text-lg">🗳️</span>
              <h3 className="text-base font-black text-stone-900 tracking-tight">Prediction Confidence</h3>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Confidence Score */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-xs text-stone-500 font-medium block">Confidence Score</span>
                <p className="text-3xl font-black text-stone-900 font-mono">
                  {result.confidence_score_pct || `${result.confidence_score}%`}
                </p>
              </div>

              {/* Reliability */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-xs text-stone-500 font-medium block">Reliability</span>
                <p className="text-3xl font-black text-emerald-700 flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <span>{result.reliability || 'High'}</span>
                </p>
              </div>

              {/* Runner-up Risk */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-xs text-stone-500 font-medium block">Runner-up Risk</span>
                <p className="text-3xl font-black text-stone-800 font-mono">
                  {result.runner_up_risk || '0 (17.0%)'}
                </p>
              </div>
            </div>

            {/* Probability Distribution by Risk Level */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Probability Distribution by Risk Level:
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 border-b border-stone-200">
                      <th className="py-2 px-4 font-bold w-12">#</th>
                      <th className="py-2 px-4 font-bold">Risk Level</th>
                      <th className="py-2 px-4 font-bold">Probability</th>
                      <th className="py-2 px-4 font-bold">Visual Indicator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.probability_distribution || []).map((item) => (
                      <tr key={item.index} className="border-b border-stone-100 hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-mono text-stone-500">{item.index}</td>
                        <td className="py-3 px-4 font-bold text-stone-800">{item.risk_level}</td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">
                          {item.prob_pct || `${item.probability}%`}
                        </td>
                        <td className="py-3 px-4 w-1/2">
                          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.risk_level === 'High' 
                                  ? 'bg-red-500' 
                                  : item.risk_level === 'Medium' 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(2, item.probability))}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Before vs After Comparison (Matching media_1790347642355.jpg) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
              <span className="text-lg">📊</span>
              <h3 className="text-base font-black text-stone-900 tracking-tight">Before vs After Comparison</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Current State (Baseline) */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h4 className="text-sm font-bold text-stone-800">Current State (Baseline):</h4>
                <ul className="space-y-2 text-xs text-stone-700 font-mono">
                  <li>• PM2.5: <strong className="text-stone-900">{result.before_vs_after?.baseline?.PM2_5} µg/m³</strong></li>
                  <li>• PM10: <strong className="text-stone-900">{result.before_vs_after?.baseline?.PM10} µg/m³</strong></li>
                  <li>• AQI: <strong className="text-stone-900">{result.before_vs_after?.baseline?.AQI}</strong></li>
                  <li>• NO2: <strong className="text-stone-900">{result.before_vs_after?.baseline?.NO2} ppb</strong></li>
                  <li>• SO2: <strong className="text-stone-900">{result.before_vs_after?.baseline?.SO2} ppb</strong></li>
                  <li>• CO: <strong className="text-stone-900">{result.before_vs_after?.baseline?.CO} ppm</strong></li>
                </ul>
              </div>

              {/* Predicted State (What-if) */}
              <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <h4 className="text-sm font-bold text-blue-900">Predicted State (What-if):</h4>
                <ul className="space-y-2 text-xs text-stone-700 font-mono">
                  <li>
                    • PM2.5: <strong className="text-stone-900">{result.before_vs_after?.what_if?.PM2_5} µg/m³</strong>{' '}
                    <span className="text-blue-700 font-bold font-sans">({result.before_vs_after?.deltas?.PM2_5})</span>
                  </li>
                  <li>
                    • PM10: <strong className="text-stone-900">{result.before_vs_after?.what_if?.PM10} µg/m³</strong>{' '}
                    <span className="text-blue-700 font-bold font-sans">({result.before_vs_after?.deltas?.PM10})</span>
                  </li>
                  <li>
                    • AQI: <strong className="text-stone-900">{result.before_vs_after?.what_if?.AQI}</strong>{' '}
                    <span className="text-blue-700 font-bold font-sans">({result.before_vs_after?.deltas?.AQI})</span>
                  </li>
                  <li>
                    • NO2: <strong className="text-stone-900">{result.before_vs_after?.what_if?.NO2} ppb</strong>{' '}
                    <span className="text-blue-700 font-bold font-sans">({result.before_vs_after?.deltas?.NO2})</span>
                  </li>
                  <li>
                    • SO2: <strong className="text-stone-900">{result.before_vs_after?.what_if?.SO2} ppb</strong>{' '}
                    <span className="text-blue-700 font-bold font-sans">({result.before_vs_after?.deltas?.SO2})</span>
                  </li>
                  <li>
                    • CO: <strong className="text-stone-900">{result.before_vs_after?.what_if?.CO} ppm</strong>{' '}
                    <span className="text-blue-700 font-bold font-sans">({result.before_vs_after?.deltas?.CO})</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Health Impact Forecast (Matching media_1790347642355.jpg) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
              <span className="text-lg">🏥</span>
              <h3 className="text-base font-black text-stone-900 tracking-tight">Health Impact Forecast</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Baseline Respiratory Cases */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-xs text-stone-500 font-medium block">
                  Baseline Respiratory_Cases ({horizon})
                </span>
                <p className="text-2xl font-black text-stone-900 font-mono">
                  {(result.health_impact?.baseline_respiratory_cases || 0).toLocaleString()}
                </p>
              </div>

              {/* Predicted Respiratory Cases */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-xs text-stone-500 font-medium block">
                  Predicted Respiratory_Cases ({horizon})
                </span>
                <p className="text-2xl font-black text-blue-900 font-mono">
                  {(result.health_impact?.predicted_respiratory_cases || 0).toLocaleString()}
                </p>
              </div>

              {/* Cases Avoided / Impact Delta */}
              <div className={`p-4 rounded-xl border flex items-center justify-center ${
                result.health_impact?.status === 'AVOIDED' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : result.health_impact?.status === 'INCREASED' 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}>
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider block">Health Projection</span>
                  <p className="text-lg font-black flex items-center justify-center space-x-1.5">
                    {result.health_impact?.status === 'AVOIDED' && <span>✅</span>}
                    {result.health_impact?.status === 'INCREASED' && <span>⚠️</span>}
                    {result.health_impact?.status === 'NEUTRAL' && <span>✅</span>}
                    <span>{result.health_impact?.avoided_badge_text || '0 cases AVOIDED'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Predict Multi-City Results if enabled */}
          {batchPredict && result.batch_predictions && result.batch_predictions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-stone-900 tracking-tight">Batch Multi-City Predictions ({selectedState})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 border-b border-stone-200">
                      <th className="py-2.5 px-4 font-bold">State</th>
                      <th className="py-2.5 px-4 font-bold">City</th>
                      <th className="py-2.5 px-4 font-bold">Horizon</th>
                      <th className="py-2.5 px-4 font-bold">Baseline Cases</th>
                      <th className="py-2.5 px-4 font-bold">Predicted Cases</th>
                      <th className="py-2.5 px-4 font-bold">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.batch_predictions.map((bp, i) => (
                      <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-2.5 px-4 font-medium text-stone-700">{bp.state}</td>
                        <td className="py-2.5 px-4 font-bold text-stone-900">{bp.city}</td>
                        <td className="py-2.5 px-4 text-stone-600 font-mono">{bp.horizon}</td>
                        <td className="py-2.5 px-4 font-mono font-medium">{bp.baseline_cases.toLocaleString()}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-blue-700">{bp.predicted_cases.toLocaleString()}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            bp.cases_avoided >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {bp.cases_avoided >= 0 ? `+${bp.cases_avoided} Avoided` : `${bp.cases_avoided} Excess`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. INTERACTIVE RECOMMENDED PUBLIC HEALTH PRECAUTIONS CARDS */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
            
            {/* Header with Title, Live Acknowledgment Tracker, and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center space-x-2">
                    <span>RECOMMENDED PUBLIC HEALTH PRECAUTIONS</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Targeted clinical, institutional, and demographic mitigation directives
                  </p>
                </div>
              </div>

              {/* Progress Tracker & Quick Actions */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end space-y-1">
                  <span className="text-[11px] font-bold text-stone-600">
                    {acknowledgedCount} of {allCards.length} Directives Acknowledged
                  </span>
                  <div className="w-32 bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => toggleAllPrecautions(allCards)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{allCards.every(c => acknowledgedCards[c.id]) ? 'Reset All' : 'Acknowledge All'}</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            {categories.length > 2 && (
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat} {cat === 'All' ? `(${allCards.length})` : `(${allCards.filter(c => c.category === cat).length})`}
                  </button>
                ))}
              </div>
            )}

            {/* Interactive Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCards.map((card) => {
                const isAck = !!acknowledgedCards[card.id];
                const isCopied = copiedId === card.id;

                // Dynamic priority badge styles
                const priorityStyles = {
                  Critical: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300/40',
                  High: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300/40',
                  Moderate: 'bg-blue-50 text-blue-800 border-blue-200',
                  Routine: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  Preventative: 'bg-teal-50 text-teal-800 border-teal-200'
                }[card.priority] || 'bg-stone-100 text-stone-700 border-stone-200';

                return (
                  <div
                    key={card.id}
                    className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      isAck 
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' 
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Icon + Category + Priority Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isAck ? 'bg-emerald-100 border border-emerald-300' : 'bg-stone-100 border border-stone-200'
                        }`}>
                          {isAck ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : renderPrecautionIcon(card.icon)}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                            {card.category || 'General Public'}
                          </span>
                          <h4 className="text-sm font-black text-stone-900 leading-tight">
                            {card.title}
                          </h4>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${priorityStyles}`}>
                        {card.priority}
                      </span>
                    </div>

                    {/* Precaution Directive Body */}
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Metadata Badges: Target Audience & Epidemiological Impact */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                          <Users className="w-3 h-3 text-stone-500" />
                          <span>Target: <strong className="text-stone-800">{card.target_audience}</strong></span>
                        </span>
                      </div>

                      {card.impact && (
                        <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-blue-900 font-medium flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{card.impact}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions: Toggle Acknowledge + Copy Advisory */}
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleAcknowledge(card.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isAck
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {isAck ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-stone-400" />}
                        <span>{isAck ? 'Directive Acknowledged' : 'Mark as Implemented'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(card.id, `${card.title}: ${card.description}`)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 text-[11px]"
                        title="Copy guideline text"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
