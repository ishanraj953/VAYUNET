import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplets, 
  Car,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function PredictionView() {
  const [formData, setFormData] = useState({
    PM2_5: 145,
    PM10: 210,
    NO2: 65,
    SO2: 40,
    CO: 1.8,
    temperature: 26,
    humidity: 60,
    wind_speed: 2.8,
    traffic_density: 'High',
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handlePredict();
  }, [formData]);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setPrediction(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSlider = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(val) }));
  };

  const getRiskBadge = (level) => {
    if (!level) return null;
    if (level.includes('High') || level.includes('Severe')) {
      return {
        bg: 'bg-red-950/80 border-red-600 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        label: 'HIGH / SEVERE RISK',
        color: '#ef4444'
      };
    }
    if (level.includes('Medium')) {
      return {
        bg: 'bg-amber-950/80 border-amber-600 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        label: 'MODERATE RISK',
        color: '#f59e0b'
      };
    }
    return {
      bg: 'bg-emerald-950/80 border-emerald-600 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      label: 'LOW RISK (SAFE)',
      color: '#10b981'
    };
  };

  const badge = prediction ? getRiskBadge(prediction.predicted_risk_level) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <Cpu className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              RandomForest Multi-Class Risk Inference
            </h2>
            <p className="text-xs text-zinc-400">Live predictive inference based on atmospheric & particulate chemistry</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters (2 cols) */}
        <div className="lg:col-span-2 bg-[#121319] border border-[#222430] rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Telemetry Input Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PM2.5 */}
            <div className="space-y-2 bg-[#161822] p-3.5 rounded-xl border border-[#232637]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">PM 2.5 Concentration</span>
                <span className="font-mono font-bold text-red-400">{formData.PM2_5} µg/m³</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={formData.PM2_5}
                onChange={(e) => handleSlider('PM2_5', e.target.value)}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-[#232638] rounded-lg"
              />
            </div>

            {/* PM10 */}
            <div className="space-y-2 bg-[#161822] p-3.5 rounded-xl border border-[#232637]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">PM 10 Concentration</span>
                <span className="font-mono font-bold text-amber-400">{formData.PM10} µg/m³</span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                value={formData.PM10}
                onChange={(e) => handleSlider('PM10', e.target.value)}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#232638] rounded-lg"
              />
            </div>

            {/* NO2 */}
            <div className="space-y-2 bg-[#161822] p-3.5 rounded-xl border border-[#232637]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">NO2 (Nitrogen Dioxide)</span>
                <span className="font-mono font-bold text-amber-400">{formData.NO2} µg/m³</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={formData.NO2}
                onChange={(e) => handleSlider('NO2', e.target.value)}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#232638] rounded-lg"
              />
            </div>

            {/* SO2 */}
            <div className="space-y-2 bg-[#161822] p-3.5 rounded-xl border border-[#232637]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">SO2 (Sulphur Dioxide)</span>
                <span className="font-mono font-bold text-yellow-300">{formData.SO2} µg/m³</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={formData.SO2}
                onChange={(e) => handleSlider('SO2', e.target.value)}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-[#232638] rounded-lg"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2 bg-[#161822] p-3.5 rounded-xl border border-[#232637]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">Ambient Temperature</span>
                <span className="font-mono font-bold text-zinc-300">{formData.temperature} °C</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={formData.temperature}
                onChange={(e) => handleSlider('temperature', e.target.value)}
                className="w-full accent-zinc-400 cursor-pointer h-1.5 bg-[#232638] rounded-lg"
              />
            </div>

            {/* Wind Speed */}
            <div className="space-y-2 bg-[#161822] p-3.5 rounded-xl border border-[#232637]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">Wind Velocity</span>
                <span className="font-mono font-bold text-zinc-300">{formData.wind_speed} m/s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.1"
                value={formData.wind_speed}
                onChange={(e) => handleSlider('wind_speed', e.target.value)}
                className="w-full accent-zinc-400 cursor-pointer h-1.5 bg-[#232638] rounded-lg"
              />
            </div>
          </div>

          {/* Traffic selector */}
          <div className="pt-3 border-t border-[#1c1e28] flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Traffic Congestion Index:</span>
            <div className="flex space-x-2">
              {['Low', 'Medium', 'High', 'Severe'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFormData(prev => ({ ...prev, traffic_density: lvl }))}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    formData.traffic_density === lvl
                      ? 'bg-red-600 text-black shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      : 'bg-[#1b1c26] text-zinc-400 border border-[#2c3044]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Results (1 col) */}
        <div className="bg-[#121319] border border-[#222430] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              AI Risk Classification
            </h3>

            {prediction && (
              <div className="space-y-4">
                {/* Result Box */}
                <div className={`p-4 rounded-xl border ${badge.bg} text-center`}>
                  <p className="text-[10px] font-black tracking-widest uppercase text-zinc-300">PREDICTED STATUS</p>
                  <p className="text-2xl font-black mt-1 uppercase">{prediction.predicted_risk_level}</p>
                  <p className="text-xs mt-1 font-mono">Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
                </div>

                {/* Class Probabilities */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase">Probability Breakdown</p>
                  {Object.entries(prediction.probabilities || {}).map(([cls, prob]) => (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-300">{cls}</span>
                        <span className="text-amber-400 font-bold">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#1e202c] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                          style={{ width: `${prob * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advisories */}
                <div className="space-y-2 pt-2 border-t border-[#1c1e28]">
                  <p className="text-xs font-bold text-red-400 uppercase flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Action Protocols</span>
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-zinc-300">
                    {prediction.advisories?.map((adv, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
