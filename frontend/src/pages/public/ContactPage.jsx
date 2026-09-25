import React, { useState } from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-stone-800 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Environmental Technical Support & Siren Desk</h1>
          <p className="text-xs text-stone-600">Contact the National Environmental Intelligence Directorate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info */}
          <div className="card-white rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-stone-900">National Directorate Headquarters</h3>
            
            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Parivesh Bhawan, East Arjun Nagar, Institutional Area, Delhi - 110032</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span>telemetry-support@vayunet.gov.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>1800-11-2026 (Toll-Free Air Emergency Siren Desk)</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card-white rounded-2xl p-6">
            {submitted ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-900">Dispatch Received</h4>
                <p className="text-xs text-stone-600">An intelligence officer will review your report within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Your Full Name</label>
                  <input required type="text" placeholder="Dr. S. K. Verma" className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Department / Organization</label>
                  <input required type="text" placeholder="State Pollution Control Board" className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Message / Telemetry Query</label>
                  <textarea required rows="4" placeholder="Report station calibration discrepancy or request API access..." className="w-full p-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl focus:outline-none focus:border-amber-500"></textarea>
                </div>
                <button type="submit" className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer">
                  Send Official Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
