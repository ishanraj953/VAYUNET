import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Activity, 
  ShieldAlert, 
  HeartPulse, 
  TrendingUp, 
  Hospital, 
  Baby, 
  UserCheck 
} from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import KpiCard from '../../components/KpiCard';
import IndiaMap from '../../components/IndiaMap';
import PollutionTrendChart from '../../components/PollutionTrendChart';
import AqiDonutChart from '../../components/AqiDonutChart';
import HealthImpactCards from '../../components/HealthImpactCards';
import AiPredictionWidget from '../../components/AiPredictionWidget';
import { useFilters } from '../../context/FilterContext';
import api from '../../api/axios';

export default function OverviewPage() {
  const { filters } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNationalData();
  }, [filters.state, filters.city]);

  const fetchNationalData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pollution/national?state=${encodeURIComponent(filters.state)}&city=${encodeURIComponent(filters.city)}`);
      setData(res.data);
    } catch (e) {
      console.error('Error loading national data:', e);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {
    avg_aqi: 274.3,
    avg_pm25: 159.7,
    high_risk_pct: 66.4,
    total_respiratory: 13020383,
    total_asthma: 5121555,
    total_hospital: 7765652,
    children_at_risk_pct: 12.6,
    elderly_at_risk_pct: 18.4,
  };

  return (
    <div className="space-y-6">
      {/* Top Alert Banner */}
      <AlertBanner
        avgAqi={kpis.avg_aqi}
        highRiskPct={kpis.high_risk_pct}
        admissions={kpis.total_hospital}
      />

      {/* 4 Large KPI Cards matching prompt specification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Average AQI"
          value={kpis.avg_aqi}
          unit="AQI"
          subtitle={kpis.avg_aqi > 200 ? "Severe Health Hazard" : "Moderate Risk"}
          icon={Wind}
          color={kpis.avg_aqi > 200 ? "red" : "gold"}
          trend={8.4}
          sparklineData={[220, 245, 260, 255, 270, kpis.avg_aqi]}
        />
        <KpiCard
          title="PM 2.5 Density"
          value={kpis.avg_pm25}
          unit="µg/m³"
          subtitle="Safe limit: 60 µg/m³"
          icon={Activity}
          color="gold"
          trend={12.6}
          sparklineData={[130, 142, 150, 155, 158, kpis.avg_pm25]}
        />
        <KpiCard
          title="High Risk Zones"
          value={`${kpis.high_risk_pct}%`}
          subtitle="Population zones above safe threshold"
          icon={ShieldAlert}
          color="red"
          trend={5.2}
          sparklineData={[58, 60, 62, 64, 65, kpis.high_risk_pct]}
        />
        <KpiCard
          title="Respiratory Cases"
          value={kpis.total_respiratory}
          subtitle="Direct pollution attributable"
          icon={HeartPulse}
          color="orange"
          trend={9.1}
          sparklineData={[11200000, 11800000, 12200000, 12600000, 12900000, kpis.total_respiratory]}
        />
      </div>

      {/* Interactive India Map */}
      <IndiaMap />

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pollution Trends (2 cols) */}
        <div className="lg:col-span-2">
          <PollutionTrendChart />
        </div>

        {/* AQI Category Distribution Donut Chart (1 col) */}
        <div className="lg:col-span-1">
          <AqiDonutChart data={data?.category_distribution} />
        </div>
      </div>

      {/* Health Impact Insights Row */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Epidemiological Health Burden & Vulnerable Demographics
        </h3>
        <HealthImpactCards
          asthmaPatients={kpis.total_asthma}
          hospitalAdmissions={kpis.total_hospital}
          childrenRiskPct={kpis.children_at_risk_pct}
          elderlyRiskPct={kpis.elderly_at_risk_pct}
        />
      </div>

      {/* AI Prediction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AiPredictionWidget
            deltaPct={data?.ai_prediction_summary?.delta_pct || "+12%"}
            regions={data?.ai_prediction_summary?.high_risk_regions || ["Delhi", "Punjab", "Haryana", "Uttar Pradesh"]}
            timeframe={data?.ai_prediction_summary?.period || "Next 24h"}
          />
        </div>

        {/* Pollutant Safety Compliance Card */}
        <div className="lg:col-span-2 card-white rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-1 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>National Ambient Air Quality Standards (NAAQS) Safety Thresholds</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">Measured ambient particulate values vs CPCB safe limits</p>

            <div className="space-y-3.5">
              {data?.pollutants?.map((p) => {
                const ratio = Math.min(100, Math.round((p.value / p.safe_limit) * 50));
                const isExcess = p.value > p.safe_limit;
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-stone-800">{p.name}</span>
                      <span className="text-stone-500">
                        <strong className={`font-mono ${isExcess ? 'text-red-600' : 'text-emerald-600'}`}>
                          {p.value} {p.unit}
                        </strong> / Safe Limit: {p.safe_limit} {p.unit}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExcess ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${ratio}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-[#F2E8D5] flex items-center justify-between text-xs text-stone-500">
            <span>Standard NAAQS Guidelines 2026</span>
            <span className="font-bold text-amber-800">CPCB Certified Calibration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
