import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wind, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-stone-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/app/overview', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await googleLogin();
      navigate('/app/overview', { replace: true });
    } catch (err) {
      setError(err.message || 'Google registration failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full card-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5 border border-[#EAE0CA] bg-white">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Wind className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-black tracking-tight text-stone-900 uppercase">
              VAYUNET INDIA
            </span>
          </Link>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Create Officer Account</h2>
          </div>
          <p className="text-xs text-stone-500">Access enterprise ambient intelligence & policy simulation</p>
        </div>

        {/* Google Quick SSO */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? 'Connecting to Google Firebase...' : 'Register with Google Single Sign-On'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">or register with email</span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Full Name</label>
            <input
              type="text"
              required
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Official Email</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength Bar */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 4) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-stone-500">Security strength: <strong className="font-bold">{strength.label}</strong></p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF5] border border-[#E2D6C0] rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-stone-600 cursor-pointer leading-tight">
              I agree to the <Link to="/terms" className="text-amber-700 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-amber-700 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Registering with Firebase...' : 'Create Authorized Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4 text-amber-400" />}
          </button>
        </form>

        {/* Login Link */}
        <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
          Already have an officer account?{' '}
          <Link to="/login" className="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
