import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';

export default function AqiDonutChart({ data = [] }) {
  const fallbackData = [
    { name: "Good", range: "0–50", count: 820, color: "#10B981" },
    { name: "Moderate", range: "51–100", count: 3950, color: "#FBBF24" },
    { name: "Unhealthy", range: "101–200", count: 12050, color: "#F97316" },
    { name: "Very Unhealthy", range: "201–300", count: 18450, color: "#EF4444" },
    { name: "Hazardous", range: "301+", count: 14730, color: "#991B1B" },
  ];

  const chartData = data && data.length > 0 ? data : fallbackData;
  const totalSamples = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="card-white rounded-2xl p-5 flex flex-col justify-between">
      <div className="pb-3 border-b border-[#F2E8D5]">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>AQI Category Distribution</span>
        </h3>
        <p className="text-xs text-stone-500">Distribution across 50,000 monitored sensor telemetry readings</p>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#EAE0CA',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-stone-900 font-mono tracking-tight">
            {totalSamples.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Total Samples
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="space-y-1.5 pt-3 border-t border-[#F2E8D5]">
        {chartData.map((item) => {
          const pct = ((item.count / totalSamples) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-stone-700 font-medium">{item.name} ({item.range})</span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-stone-400 text-[11px]">{pct}%</span>
                <span className="font-bold text-stone-900">{item.count.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
