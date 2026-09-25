import React, { useState } from 'react';
import { MapPin, Globe, Grid, Radio, Layers, Sparkles, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import LiveGisSpatialMap from '../../components/LiveGisSpatialMap';
import IndiaMap from '../../components/IndiaMap';

export default function InteractiveMapPage() {
  const [activeTab, setActiveTab] = useState('gis'); // 'gis' | 'matrix'

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="card-white rounded-2xl p-6 border border-[#EBE3D5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-200">
            <Globe className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                All-India GIS Geospatial Pollution Surveillance Grid
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                Live CAAQMS Network
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live spatial coordinates, multi-pollutant telemetry, atmospheric dispersion, and acute hospital surge risk tracking across India.
            </p>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl p-1 space-x-1 shadow-xs">
          <button
            onClick={() => setActiveTab('gis')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'gis'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Live GIS Spatial Map
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            State Matrix Grid
          </button>
        </div>
      </div>

      {/* Active View Container */}
      {activeTab === 'gis' ? (
        <LiveGisSpatialMap />
      ) : (
        <IndiaMap />
      )}
    </div>
  );
}
