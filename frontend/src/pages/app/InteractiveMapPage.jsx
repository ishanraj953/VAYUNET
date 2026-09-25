import React from 'react';
import IndiaMap from '../../components/IndiaMap';

export default function InteractiveMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">
          All-India Geospatial Pollution Surveillance Grid
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          High-resolution regional particulate tracking across 36 states and union territories
        </p>
      </div>
      <IndiaMap />
    </div>
  );
}
