import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Wind, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/overview';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    // Google OAuth integration flow
    // If client ID is present, we initialize Google sign-in. If not configured, explain clearly.
    setError('Google OAuth is ready for integration. To enable real Google tokens, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full card-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 border border-[#EAE0CA]">
        {/* Left Side: Brand Visual & Stats */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#FFF8E7] via-[#FFF3D6] to-[#FFEAB8] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EAE0CA]">
          <div>
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Wind className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-stone-900 uppercase">
                  VAYUNET INDIA
                </h2>
                <p className="text-[10px] text-stone-500 font-semibold">Intelligence Core</p>
              </div>
            </Link>

            <h3 className="text-xl font-black text-stone-900 leading-snug">
              National Ambient Air Quality & Health Risk Surveillance
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Official centralized platform for multi-state particulate telemetry, explainable risk machine learning, and clean air policy simulation.
            </p>
          </div>

          {/* Small Pollution Intelligence Stats */}
          <div className="space-y-3 pt-6 border-t border-amber-200/80">
            <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-amber-200/60 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Live Station Telemetry</span>
              <p className="text-base font-black text-stone-900 font-mono mt-0.5">50,000 Verified Records</p>
            </div>

            <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-amber-200/60 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">National Monitored States</span>
              <p className="text-base font-black text-amber-900 font-mono mt-0.5">36 States & Union Territories</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">Welcome Back</h3>
              <p className="text-xs text-stone-500 mt-1">
                Enter your credentials to access the environmental intelligence dashboard
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="analyst@vayunet.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-medium text-stone-600 cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-stone-400">
                <span className="bg-white px-3">OR</span>
              </div>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-[#E2D6C0] text-stone-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Link to Register */}
            <p className="text-center text-xs text-stone-500 pt-2">
              Don't have an officer account?{' '}
              <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800">
                Register Platform Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
