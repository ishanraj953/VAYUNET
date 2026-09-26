import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Activity, 
  Lock, 
  Mail, 
  Layers, 
  BadgeCheck,
  Zap,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/overview';

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your registered email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-stone-900 selection:bg-amber-400 selection:text-stone-900 relative overflow-hidden">
      
      {/* Subtle Background Geometry */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-stone-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 grid grid-cols-1 lg:grid-cols-12 relative z-10"
      >
        {/* Left Side: Professional Institutional Branding (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 text-stone-100 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-800">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm">
                <Wind className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white uppercase leading-tight">
                  VAYUNET INDIA
                </h2>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  Intelligence Core
                </p>
              </div>
            </Link>

            {/* Headline */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-stone-800 border border-stone-700 rounded-md text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  <span>Authorized Portal Access</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded-md text-[9px] font-black text-emerald-300 uppercase">
                  <Database className="w-2.5 h-2.5 text-emerald-400" />
                  <span>MongoDB Atlas Connected</span>
                </span>
              </div>
              <h3 className="text-xl font-black text-white leading-snug tracking-tight">
                National Ambient Air Quality & Health Risk Surveillance
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Centralized environmental intelligence architecture for multi-pollutant telemetry, epidemiological machine learning, and clean air policy simulation.
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-stone-300">
                <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">50,000 Verified Observation Records</strong>
                  <span className="text-[11px] text-stone-400">Continuous telemetry across 36 States & Union Territories.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-stone-300">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Native Random Forest ML Engine</strong>
                  <span className="text-[11px] text-stone-400">Multi-class predictive health risk modeling with dynamic SHAP attribution.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="pt-8 mt-6 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400 relative z-10">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>JWT + SHA-256 Authentication</span>
            </span>
            <span className="font-mono text-stone-500">ISO/IEC 27001</span>
          </div>
        </div>

        {/* Right Side: Professional Enterprise Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div className="max-w-md w-full mx-auto space-y-4">
            
            {/* Back Button */}
            <div>
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors group px-2.5 py-1 rounded-lg hover:bg-stone-100 w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-amber-600" />
                <span>Back to Overview</span>
              </Link>
            </div>

            {/* Title & Status */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">Sign In to Dashboard</h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>FastAPI Core</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Enter your authorized credentials or click a Quick Role below to log in immediately.
              </p>
            </div>

            {/* Quick Demo Role Buttons */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Instant Role Login
                </span>
                <span className="text-[10px] text-stone-400">1-Click Access</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('analyst')}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-[11px] font-bold text-stone-800 transition-all hover:border-amber-500 cursor-pointer text-center"
                >
                  Analyst
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-[11px] font-bold text-stone-800 transition-all hover:border-amber-500 cursor-pointer text-center"
                >
                  Admin Director
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user')}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-[11px] font-bold text-stone-800 transition-all hover:border-amber-500 cursor-pointer text-center"
                >
                  Researcher
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">or sign in with email</span>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign-in Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="analyst@vayunet.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50/60 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Password</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors">
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
                    className="w-full px-3.5 py-2.5 pr-10 bg-stone-50/60 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Workstation */}
              <div className="flex items-center space-x-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="remember" className="text-xs font-medium text-stone-600 cursor-pointer select-none">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating with Backend...' : 'Sign In to Dashboard'}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-amber-400" />}
              </button>
            </form>

            {/* Registration Link */}
            <div className="pt-3 text-center text-xs text-stone-500 border-t border-stone-100">
              Need authorized platform access?{' '}
              <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2">
                Register New Officer Account
              </Link>
            </div>
          </div>

          {/* Security Disclaimer */}
          <div className="pt-4 text-center text-[11px] text-stone-400">
            Secured with Native JWT & MongoDB Atlas Encryption
          </div>
        </div>
      </motion.div>
    </div>
  );
}
