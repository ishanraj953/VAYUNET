import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowUp, ArrowDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import api from '../../api/axios';

export default function ExplainabilityPage() {
  const { metadata } = useFilters();
  const [city, setCity] = useState('Delhi');
  const [xai, setXai] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/model/explainability?city=${encodeURIComponent(city)}`)
      .then(res => setXai(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              Explainable AI (XAI) & SHAP Feature Attribution
            </h2>
            <p className="text-xs text-stone-500">Deconstructing model reasoning and particulate attribution weights</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#FFFDF5] border border-[#E9DFCB] rounded-xl px-3 py-2">
          <span className="text-xs text-stone-600 font-medium">Select Observation City:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
          >
            {metadata.cities?.filter(c => c !== 'All').slice(0, 12).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
      ) : xai ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SHAP Waterfall (2 cols) */}
          <div className="lg:col-span-2 card-white rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                SHAP Attribution Waterfall for {xai.location}
              </h3>
              <p className="text-xs text-stone-500">
                Baseline Expected Prior = {xai.baseline_risk}. Positive contributions increase predicted risk level.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {xai.waterfall?.map((item, idx) => {
                const isPos = item.direction === 'positive';
                const widthPct = Math.min(100, Math.abs(item.shap_value) * 200);
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-stone-800 flex items-center space-x-1.5">
                        {isPos ? (
                          <ArrowUp className="w-3.5 h-3.5 text-red-600 stroke-[3]" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        )}
                        <span>{item.feature}</span>
                      </span>
                      <span className={`font-mono ${isPos ? 'text-red-700' : 'text-emerald-700'}`}>
                        {isPos ? `+${item.shap_value}` : item.shap_value} SHAP
                      </span>
                    </div>

                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden flex border border-stone-200/50">
                      <div
                        className={`h-full rounded-full ${isPos ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>

                    <p className="text-[10px] text-stone-500 font-medium">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Rules (1 col) */}
          <div className="card-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Extracted Tree Rules</span>
              </h3>
              <p className="text-xs text-stone-500 mb-4">Interpretable decision paths from RandomForest estimators</p>

              <div className="space-y-3">
                {xai.shap_rules?.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] text-xs space-y-1">
                    <span className="font-bold text-amber-800 font-mono text-[11px] block">
                      Rule #{idx + 1}
                    </span>
                    <p className="text-stone-700 font-mono text-[11px] leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-stone-600 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px]">Feature importance computed using TreeExplainer algorithm.</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
