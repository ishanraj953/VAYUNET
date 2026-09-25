import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to dispatch reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full card-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 border border-[#EAE0CA] bg-white">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Wind className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-black tracking-tight text-stone-900 uppercase">
              VAYUNET INDIA
            </span>
          </Link>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-stone-500">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
            <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Reset Token Dispatched</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If an account matching <strong>{email}</strong> exists, password reset verification has been generated.
            </p>
            {resetToken && (
              <div className="pt-2">
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
                  className="block text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Proceed to Reset Password &rarr;
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="analyst@vayunet.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Dispatching Link...' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
