import React from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-800 flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-stone-500">Effective Date: September 2026 &bull; Government Environmental Standards</p>
        <div className="card-white rounded-2xl p-8 space-y-4 text-xs text-stone-700 leading-relaxed">
          <h3 className="text-sm font-bold text-stone-900 uppercase">1. Environmental Telemetry Data</h3>
          <p>
            VayuNet India aggregates sensor telemetry, particulate concentrations, and meteorological parameters from authorized continuous ambient stations. No personally identifiable sensor operator data is published without consent.
          </p>
          <h3 className="text-sm font-bold text-stone-900 uppercase">2. Officer Account Security</h3>
          <p>
            User credentials, cryptographic session tokens, and passwords are protected via salted SHA-256 / bcrypt hashing and strict role-based access control.
          </p>
          <h3 className="text-sm font-bold text-stone-900 uppercase">3. Health Data Privacy</h3>
          <p>
            Epidemiological consultations, hospital admissions, and pediatric cases are strictly aggregated at the regional and municipal level. Individual patient medical records are neither stored nor processed.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-800 flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Terms of Telemetry Service</h1>
        <p className="text-xs text-stone-500">Effective Date: September 2026 &bull; Regulatory Compliance</p>
        <div className="card-white rounded-2xl p-8 space-y-4 text-xs text-stone-700 leading-relaxed">
          <h3 className="text-sm font-bold text-stone-900 uppercase">1. Platform Intended Purpose</h3>
          <p>
            VayuNet India is designed for scientific research, administrative air quality surveillance, and environmental policy modeling. Machine learning predictions represent model-derived estimates and should guide municipal mitigation protocols.
          </p>
          <h3 className="text-sm font-bold text-stone-900 uppercase">2. Telemetry Citation & API Usage</h3>
          <p>
            Access to the real-time API requires authorized JWT credentials. Automated scraping or unauthenticated load generation is subject to rate-limiting and administrative audit.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
