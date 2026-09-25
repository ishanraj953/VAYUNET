import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  ShieldCheck, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Wind, 
  Thermometer, 
  Layers,
  BookOpen,
  Cpu,
  Info
} from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExplainabilityPage() {
  const { filters, metadata } = useFilters();
  const selectedState = filters.state || 'All';
  const defaultCity = filters.city && filters.city !== 'All' 
    ? filters.city.replace(`${selectedState} - `, '') 
    : 'Delhi';

  const [city, setCity] = useState(defaultCity);
  const [xai, setXai] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filters.city && filters.city !== 'All') {
      setCity(filters.city.replace(`${selectedState} - `, ''));
    }
  }, [filters.city, selectedState]);

  useEffect(() => {
    setLoading(true);
    api.get(`/model/explainability?city=${encodeURIComponent(city)}`)
      .then(res => setXai(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  // Generate and Download PDF Report
  const handleDownloadPDF = () => {
    if (!xai) return;
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('VAYUNET INDIA - EXPLAINABLE AI (XAI) & SHAP REPORT', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Location Context: ${city} (${selectedState}) | Model: RandomForestClassifier (200 Estimators)`, 14, 20);
      doc.text(`Generated: ${new Date().toLocaleString()} | TreeExplainer SHAP Attribution`, 14, 25);

      // Section 1: SHAP Attribution Waterfall
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. SHAP Feature Attribution Hierarchy', 14, 38);

      const shapRows = (xai.waterfall || []).map(w => [
        w.feature,
        w.direction === 'positive' ? `+${w.shap_value} (High Risk)` : `${w.shap_value} (Lower Risk)`,
        w.desc
      ]);

      autoTable(doc, {
        startY: 42,
        head: [['Feature Trigger Threshold', 'SHAP Attribution Impact', 'Model Reasoning Context']],
        body: shapRows,
        theme: 'striped',
        headStyles: { fillColor: [217, 119, 6] },
        styles: { fontSize: 8.5 }
      });

      // Section 2: Decision Rules
      let currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Extracted Tree Decision Rules & Boundaries', 14, currentY);

      const ruleRows = (xai.shap_rules || []).map((r, i) => [
        `Rule #${i + 1}`,
        r
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Rule ID', 'Logic Condition & Probability Output']],
        body: ruleRows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8.5 }
      });

      // Section 3: Global Model Summary
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Global Model Summary (Operational Mechanics)', 14, currentY);

      const summaryRows = [
        ['Primary Predictor: Pollution Level', 'PM2.5 > 150 ug/m3 strongly drives HIGH risk; AQI > 200 raises risk level; elevated PM10 amplifies signal.'],
        ['Secondary Factors: Weather & Location', 'Wind Speed > 10 m/s accelerates dispersion (reduces risk); Temperature & Traffic modulate baseline risk.'],
        ['Confidence Logic', 'High: Multiple pollutants elevated; Medium: Mixed factor signals; Low: Contradictory weather/pollution inputs.'],
        ['Model Reliability Status', 'GOOD (Across 50,000 training records, PM2.5 & AQI rank as primary drivers backed by medical literature).']
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Operational Dimension', 'Mechanism & Decision Logic']],
        body: summaryRows,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8.5 }
      });

      // Section 4: Operational Boundaries
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Reliability Conditions & Boundary Audit', 14, currentY);

      const boundaryRows = [
        ['When Model Works Best (Optimal)', 'Clear pollution extremes (very high/low AQI), typical weather conditions, standard seasonal patterns (monsoon, winter).'],
        ['When Model May Be Less Reliable', 'Mixed/conflicting signals (high AQI + high wind), sudden extreme storms/heatwaves, localized industrial fires.']
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Operating Scenario', 'Model Performance Characteristics']],
        body: boundaryRows,
        theme: 'grid',
        headStyles: { fillColor: [100, 116, 139] },
        styles: { fontSize: 8.5 }
      });

      // Footer
      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : currentY + 8;
      if (currentY < 280) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text('Disclaimer: This explainability audit is generated via TreeExplainer SHAP attribution on 50,000 verified India observation rows.', 14, currentY);
      }

      // Save PDF
      doc.save(`VAYUNET_Explainability_Report_${city}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('PDF generation error. Please try again.');
    }
  };

  const citiesList = metadata.cities?.filter(c => c !== 'All') || [
    'Delhi', 'CityA', 'CityB', 'CityC', 'CityD', 'CityE', 'Mumbai', 'Kolkata', 'Bengaluru', 'Lucknow', 'Patna'
  ];

  return (
    <div className="space-y-6 font-sans text-stone-900 pb-16 max-w-7xl mx-auto">
      {/* Header with City Selector and Download Report Button */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Explainable AI (XAI) & SHAP Feature Attribution
            </h2>
            <p className="text-xs text-stone-500">Deconstructing model reasoning, particulate attribution weights & global decision mechanics</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <span className="text-xs text-stone-600 font-medium">Observation City:</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
            >
              {citiesList.slice(0, 16).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {xai && (
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download XAI Report (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs text-stone-500 font-mono">Calculating TreeExplainer SHAP values for {city}...</p>
        </div>
      ) : xai ? (
        <div className="space-y-6">
          
          {/* Top Grid: SHAP Waterfall & Decision Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SHAP Waterfall (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">
                    SHAP Attribution Waterfall for {xai.location}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Baseline Expected Prior = <span className="font-mono font-bold text-stone-800">{xai.baseline_risk}</span>. Positive values drive predicted risk toward HIGH.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-bold">
                  TreeExplainer
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {xai.waterfall?.map((item, idx) => {
                  const isPos = item.direction === 'positive';
                  const widthPct = Math.min(100, Math.abs(item.shap_value) * 200);
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-stone-50/70 border border-stone-200 space-y-2 hover:bg-stone-50 transition-colors">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-stone-900 flex items-center space-x-2">
                          {isPos ? (
                            <div className="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center text-red-700">
                              <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
                              <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <span className="text-sm font-bold text-stone-800">{item.feature}</span>
                        </span>
                        <span className={`font-mono text-xs px-2 py-0.5 rounded-md border font-bold ${
                          isPos ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isPos ? `+${item.shap_value}` : item.shap_value} SHAP
                        </span>
                      </div>

                      <div className="w-full bg-stone-200/80 h-2.5 rounded-full overflow-hidden flex border border-stone-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPos ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-stone-600 font-medium">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision Rules (1 col) */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Extracted Decision Rules</span>
                  </h3>
                  <p className="text-xs text-stone-500">Interpretable decision branches extracted from 200 trees</p>
                </div>

                <div className="space-y-3 pt-3">
                  {xai.shap_rules?.map((rule, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                      <span className="font-bold text-amber-900 font-mono text-[10px] uppercase tracking-wider block">
                        Rule #{idx + 1} Threshold Path
                      </span>
                      <p className="text-stone-800 font-mono text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-stone-200">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-stone-700 flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Feature attributions mathematically computed using Shapley Additive Explanations.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section: 📝 Global Model Summary (Matching user screenshot media_1790353563729.jpg) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
            
            {/* Section Title */}
            <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">📝</span>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  Global Model Summary
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-500 font-mono">
                Architecture: RandomForestClassifier
              </span>
            </div>

            {/* How This Model Works (in simple terms) */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-800">
                How This Model Works (in simple terms):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Primary Predictor */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-xs text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">1</span>
                    <span>Primary Predictor: Pollution Level</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-700">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span>When <strong>PM2.5 &gt; 150 µg/m³</strong> → Model strongly predicts <strong>HIGH</strong> risk</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span>When <strong>AQI &gt; 200</strong> → Model raises risk level</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span>When <strong>PM10 elevated</strong> → Adds to <strong>HIGH</strong> risk signal</span>
                    </li>
                  </ul>
                </div>

                {/* 2. Secondary Factors */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-xs text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px]">2</span>
                    <span>Secondary Factors: Weather & Location</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-700">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span><strong>High wind speed (&gt;10 m/s)</strong> → Reduces risk (disperses pollution)</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span><strong>High temperature</strong> → Can increase/decrease risk depending on season</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span><strong>Traffic density areas</strong> → Slightly higher baseline risk</span>
                    </li>
                  </ul>
                </div>

                {/* 3. Confidence Level */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-xs text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
                    <span>Confidence Level</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-700">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span><strong>High confidence:</strong> When multiple pollutants are elevated (all pointing to HIGH)</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span><strong>Medium confidence:</strong> When mixed signals (some HIGH, some LOW factors)</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-stone-400 mt-0.5">•</span>
                      <span><strong>Low confidence:</strong> When factors are contradictory</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Model Reliability */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-950">
                <span>Model Reliability:</span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded-full text-xs text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>GOOD</span>
                </span>
              </div>
              <ul className="space-y-1 text-xs text-emerald-900">
                <li>• Across all 50,000 training examples, features consistently drive predictions</li>
                <li>• Most important: PM2.5 and AQI (medical literature supports this)</li>
                <li>• Least important: Traffic density (secondary effect)</li>
              </ul>
            </div>

            {/* When Model Works Best vs When Model May Be Less Reliable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
              {/* When Model Works Best */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-900 block">When Model Works Best:</span>
                <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                  <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span>✅</span>
                    <span>Clear pollution extremes (very high or very low AQI)</span>
                  </span>
                  <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span>✅</span>
                    <span>Typical weather conditions (not unusual)</span>
                  </span>
                  <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span>✅</span>
                    <span>Standard seasonal patterns (monsoon, winter)</span>
                  </span>
                </div>
              </div>

              {/* When Model May Be Less Reliable */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-900 block">When Model May Be Less Reliable:</span>
                <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                  <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>Mixed/conflicting signals (high AQI but strong wind)</span>
                  </span>
                  <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>Extreme weather events (sudden storms, heatwaves)</span>
                  </span>
                  <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>Unusual pollution sources (industrial incident, fire)</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Disclaimer from screenshot */}
            <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400">
              This dashboard is intended for exploratory analysis and demonstration. Review model performance and preprocess pipeline before production deployment.
            </div>

          </div>

        </div>
      ) : null}
    </div>
  );
}
