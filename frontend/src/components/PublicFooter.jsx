import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Shield, ExternalLink } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-[#FFFBF0] border-t border-[#F2E8D5] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white">
              <Wind className="w-4 h-4" />
            </div>
            <span className="font-black text-stone-900 tracking-tight text-sm uppercase">VAYUNET INDIA</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            All-India real-time ambient particulate surveillance, epidemiological risk prediction & NCAP clean air intervention modeling.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>National Telemetry Grid Active &bull; 50,000 Nodes</span>
          </div>
        </div>

        {/* Intelligence Modules */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Intelligence Core</h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link to="/app/overview" className="hover:text-amber-700">National Ambient Overview</Link></li>
            <li><Link to="/app/map" className="hover:text-amber-700">Geospatial India Map</Link></li>
            <li><Link to="/app/health-impact" className="hover:text-amber-700">Epidemiological Risk</Link></li>
            <li><Link to="/app/ai-predictor" className="hover:text-amber-700">RandomForest AI Predictor</Link></li>
            <li><Link to="/app/policy-simulator" className="hover:text-amber-700">Urban Policy Simulator</Link></li>
          </ul>
        </div>

        {/* Governance & Compliance */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Policy Framework</h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link to="/app/ncap-tracker" className="hover:text-amber-700">NCAP 2026 Target Tracker</Link></li>
            <li><Link to="/app/early-warning" className="hover:text-amber-700">Emergency Siren Protocols</Link></li>
            <li><Link to="/app/data-quality" className="hover:text-amber-700">Sensor Quality & Audit</Link></li>
            <li><Link to="/app/executive-briefing" className="hover:text-amber-700">Executive Briefing Dossier</Link></li>
          </ul>
        </div>

        {/* Legal & Contacts */}
        <div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Compliance & Legal</h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link to="/about" className="hover:text-amber-700">About VayuNet Initiative</Link></li>
            <li><Link to="/contact" className="hover:text-amber-700">Technical Support & Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-amber-700">Data Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-amber-700">Terms of Telemetry Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#F2E8D5] flex flex-wrap items-center justify-between text-xs text-stone-500">
        <p>&copy; 2026 VayuNet India. National Environmental Intelligence Framework.</p>
        <p>Telemetry verified under Central Ambient Air Quality Standards (NAAQS).</p>
      </div>
    </footer>
  );
}
