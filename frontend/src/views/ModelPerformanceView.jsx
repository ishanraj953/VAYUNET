import React, { useState, useEffect } from 'react';
import { Gauge, CheckCircle2, Award, BarChart3, Binary, Layers } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelPerformanceView() {
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/model-performance')
      .then(res => res.json())
      .then(data => setPerf(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { metrics_by_class = [], confusion_matrix = [], feature_importances = [] } = perf || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Gauge className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              ML Model Validation & Diagnostics
            </h2>
            <p className="text-xs text-zinc-400">RandomForest classifier evaluation on 10,000 holdout test records</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Test Accuracy"
          value={`${(perf.overall_accuracy * 100).toFixed(1)}%`}
          subtitle="Multi-class generalization"
          icon={Award}
          color="yellow"
        />
        <MetricCard
          title="Macro F1-Score"
          value={`${(perf.f1_macro * 100).toFixed(1)}%`}
          subtitle="Harmonic mean across classes"
          icon={CheckCircle2}
          color="yellow"
        />
        <MetricCard
          title="ROC-AUC Score"
          value={`${(perf.roc_auc_weighted * 100).toFixed(1)}%`}
          subtitle="Weighted discrimination power"
          icon={Gauge}
          color="red"
        />
        <MetricCard
          title="Holdout Test Cohort"
          value={perf.test_samples?.toLocaleString()}
          unit="Records"
          subtitle="Stratified split"
          icon={Layers}
          color="neutral"
        />
      </div>

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>RandomForest Gini Feature Importances</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Relative weight of variables in predicting respiratory danger</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feature_importances} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" horizontal={false} />
                <XAxis type="number" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" stroke="#52525b" tick={{ fill: '#d4d4d8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0e14', borderColor: '#2d3042', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="importance" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Gini Importance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Binary className="w-4 h-4 text-red-500" />
              <span>Multi-Class Confusion Matrix</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">Predicted vs Actual distribution on holdout samples</p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-[#090a0f] text-zinc-400 font-bold uppercase">
                    <th className="p-2.5 text-left">Actual \ Pred</th>
                    <th className="p-2.5 text-emerald-400">Low</th>
                    <th className="p-2.5 text-amber-400">Medium</th>
                    <th className="p-2.5 text-red-400">High</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1e28]">
                  {confusion_matrix.map((row, idx) => {
                    const labels = ['Low Risk', 'Medium Risk', 'High Risk'];
                    return (
                      <tr key={idx} className="hover:bg-[#161822]">
                        <td className="p-2.5 text-left font-bold text-zinc-300">{labels[idx]}</td>
                        {row.map((val, cIdx) => {
                          const isDiag = idx === cIdx;
                          return (
                            <td key={cIdx} className="p-2.5">
                              <span className={`px-2.5 py-1 rounded font-mono font-bold ${
                                isDiag ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-zinc-500'
                              }`}>
                                {val}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Precision Recall Breakdown */}
          <div className="pt-4 border-t border-[#1c1e28]">
            <div className="grid grid-cols-3 gap-3 text-center">
              {metrics_by_class.map(m => (
                <div key={m.class} className="bg-[#161822] p-2.5 rounded-xl border border-[#232637]">
                  <p className="text-[11px] font-bold text-zinc-300">{m.class}</p>
                  <p className="text-xs font-mono text-amber-400 mt-1">F1: {(m.f1_score * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-zinc-500">Prec: {(m.precision * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
