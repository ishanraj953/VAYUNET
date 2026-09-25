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
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import api from '../../api/axios';

export default function AiRiskPredictorPage() {
  const [formData, setFormData] = useState({
    PM2_5: 145,
    PM10: 210,
    NO2: 65,
    SO2: 40,
    CO: 1.8,
    O3: 38,
    temperature: 28,
    humidity: 55,
    wind_speed: 2.8,
    population_density: 12500,
    traffic_density: 'High',
    AQI: 274
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluatedAt, setEvaluatedAt] = useState(null);

  const runPrediction = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/predict', payload || formData);
      if (res && res.data) {
        setResult(res.data);
        setEvaluatedAt(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Prediction API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, []);

  const handlePredict = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    runPrediction(formData);
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'traffic_density' ? val : parseFloat(val) || 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-white rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800">
            <Cpu className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
              RandomForest Multi-Class Health Risk Inference
            </h2>
            <p className="text-xs text-stone-500">Live predictive inference based on atmospheric & particulate chemistry</p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl">
          Trained Model Artifact Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 card-white rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Diagnostic Telemetry Inputs</span>
            </h3>
            <span className="text-[10px] font-bold text-stone-400">11 Measured Parameters</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* PM2.5 */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">PM 2.5 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.PM2_5}
                  onChange={(e) => handleInputChange('PM2_5', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* PM10 */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">PM 10 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.PM10}
                  onChange={(e) => handleInputChange('PM10', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* NO2 */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">NO2 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.NO2}
                  onChange={(e) => handleInputChange('NO2', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* SO2 */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">SO2 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.SO2}
                  onChange={(e) => handleInputChange('SO2', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* CO */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">CO (mg/m³)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.CO}
                  onChange={(e) => handleInputChange('CO', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* O3 */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">O3 Surface Ozone (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.O3}
                  onChange={(e) => handleInputChange('O3', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Humidity */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange('humidity', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Wind Speed */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Wind Speed (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.wind_speed}
                  onChange={(e) => handleInputChange('wind_speed', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Population Density */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Population Density (per km²)</label>
                <input
                  type="number"
                  value={formData.population_density}
                  onChange={(e) => handleInputChange('population_density', e.target.value)}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Traffic Density Selector */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700">Traffic Density Tier:</span>
              <div className="flex space-x-2">
                {['Low', 'Medium', 'High', 'Severe'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleInputChange('traffic_density', lvl)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      formData.traffic_density === lvl
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{loading ? 'Evaluating Random Forest Decision Trees...' : 'Predict Health Risk'}</span>
            </button>
          </form>
        </div>

        {/* Prediction Results Display (5 cols) */}
        <div className="lg:col-span-5 card-white rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F2E8D5]">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                Risk Classification Output
              </h3>
              {evaluatedAt && (
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>model.pkl &bull; {evaluatedAt}</span>
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4 mt-4">
                {/* Result Card */}
                <div className={`p-4 rounded-2xl text-center space-y-1 border ${
                  result.risk_category?.includes('High') || result.risk_category?.includes('Severe')
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : result.risk_category?.includes('Medium') || result.risk_category?.includes('Moderate')
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    MODEL PREDICTED LEVEL
                  </span>
                  <p className="text-2xl font-black uppercase">
                    {result.risk_category}
                  </p>
                  <p className="text-xs font-mono font-bold opacity-90">
                    Risk Severity Score: {result.risk_score} / 100
                  </p>
                </div>

                {/* Class Probabilities */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 block uppercase">
                    Class Probability Distribution
                  </span>
                  {Object.entries(result.risk_probability || {}).map(([c, p]) => (
                    <div key={c} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-600 font-medium">{c} Risk</span>
                        <span className="font-mono font-bold text-stone-900">{(p * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${p * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommended Precautions */}
                <div className="space-y-2 pt-2 border-t border-[#F2E8D5]">
                  <span className="text-xs font-bold text-red-700 block uppercase">
                    Recommended Public Health Precautions
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {result.recommended_precautions?.map((prec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{prec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-2 text-stone-400">
                <Cpu className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-xs">Adjust input telemetry parameters and click Predict Health Risk to view model classification.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#FFFDF5] border border-[#F2E8D5] rounded-xl text-[11px] text-stone-500">
            <strong>Model Artifact:</strong> RandomForest Multi-Class Classifier trained on 50,000 real India ambient observation rows.
          </div>
        </div>
      </div>
    </div>
  );
}
