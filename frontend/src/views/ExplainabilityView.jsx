import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, ArrowUp, ArrowDown, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ExplainabilityView({ metadata }) {
  const [city, setCity] = useState('Delhi');
  const [xai, setXai] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/explainability?city=${encodeURIComponent(city)}`)
      .then(res => res.json())
      .then(data => setXai(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Explainable AI (XAI) & SHAP Attribution
            </h2>
            <p className="text-xs text-zinc-400">Deconstructing model reasoning and feature attribution weights</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#090a0f] border border-[#262837] rounded-xl px-3 py-2">
          <span className="text-xs text-zinc-400">Select City:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            {metadata.cities?.filter(c => c !== 'All').slice(0, 10).map(c => (
              <option key={c} value={c} className="bg-[#121319] text-white">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : xai ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SHAP Waterfall (2 cols) */}
          <div className="lg:col-span-2 bg-[#121319] border border-[#222430] rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                SHAP Feature Attribution Waterfall for {xai.city}
              </h3>
              <p className="text-xs text-zinc-400">
                Baseline prior = {xai.baseline_expected_value}. Red bars push prediction towards <strong className="text-red-400">HIGH RISK</strong>.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {xai.shap_waterfall?.map((item, idx) => {
                const isPositive = item.contribution > 0;
                const widthPct = Math.min(100, Math.abs(item.contribution) * 200);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-[#161822] border border-[#232637] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center space-x-1.5">
                        {isPositive ? (
                          <ArrowUp className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{item.feature}</span>
                      </span>
                      <span className={`font-mono font-bold ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isPositive ? `+${item.contribution}` : item.contribution} SHAP
                      </span>
                    </div>

                    <div className="w-full bg-[#202230] h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full ${isPositive ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Decision Rules (1 col) */}
          <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Primary Decision Rules</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4">Extracted decision tree heuristics from the ensemble</p>

              <div className="space-y-3">
                {xai.top_rules?.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#161822] border border-[#232637] text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Rule #{idx + 1}</span>
                    </div>
                    <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1c1e28]">
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified by TreeExplainer (v0.52.0)</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
