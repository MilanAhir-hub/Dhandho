import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { authService } from '../services/api';
import loginBg from '../assets/shopkeeper.jpg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login({ email, password });
      
      localStorage.setItem('dhandho_user', JSON.stringify(res));
      setSuccessMsg(`Welcome back, ${res.username || 'Vyapari'}! Redirecting to dashboard...`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 900);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        'Invalid credentials. Please check your email and password.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#fbfdfc] flex overflow-hidden">
      {/* ── Left Form Column ────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] xl:w-[42%] h-full flex flex-col justify-between px-6 sm:px-10 lg:px-12 py-5 sm:py-6 overflow-y-auto lg:overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#00a86b] flex items-center justify-center text-white shadow-xs group-hover:bg-[#059669] transition-all">
              <Store className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              Dhandho<span className="text-[#00a86b]">.</span>
            </span>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="my-auto py-2 max-w-sm w-full mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 bg-[#e8f7ee] border border-[#a7f3d0] text-[#047857] text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b]" />
            Vyapar Portal
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome back, <br />
            <span className="text-[#00a86b]">Dukandar Sahab!</span>
          </h1>

          <p className="text-xs text-slate-500 mt-1 mb-4">
            Enter your credentials to access your billing counter and khata.
          </p>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00a86b]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@patelkirana.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Contact support or check your registered email.');
                  }}
                  className="text-[11px] font-semibold text-[#00a86b] hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#00a86b] focus:ring-[#00a86b] border-slate-300 accent-[#00a86b] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Remember device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#00a86b] hover:bg-[#059669] text-white font-bold py-2.5 sm:py-3 px-5 rounded-full shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to Counter
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New store owner?{' '}
              <Link to="/signup" className="font-bold text-[#00a86b] hover:underline">
                Create Free Account →
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00a86b]" />
            256-bit Secure
          </span>
          <span>Made for Indian Retailers 🇮🇳</span>
        </div>

      </div>

      {/* ── Right Showcase Column (Desktop only, 100% height, no scroll) ── */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[58%] h-full relative bg-slate-900 overflow-hidden">
        <img
          src={loginBg}
          alt="Dhandho Store Cashier Counter"
          className="w-full h-full object-cover object-[65%_center] opacity-85 filter brightness-95"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-emerald-950/30" />

        {/* Floating Content */}
        <div className="absolute inset-0 p-8 xl:p-12 flex flex-col justify-between z-10">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full self-start">
            <Store className="h-3.5 w-3.5 text-emerald-400" />
            500+ Indian Kirana Stores Trust Dhandho
          </div>

          {/* Bottom Cards */}
          <div className="space-y-3 max-w-md">
            {/* Live Sales Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#e8f7ee] text-[#00a86b] flex items-center justify-center">
                  <TrendingUp className="h-4.5 w-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500">Today's Counter Sales</p>
                  <p className="text-base font-black text-slate-900 font-mono">₹18,450</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#00a86b] bg-[#e8f7ee] px-2.5 py-0.5 rounded-full">
                ↗ 12.8%
              </span>
            </div>

            {/* Testimonial Quote */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
              <p className="text-xs text-slate-200 leading-relaxed italic">
                &ldquo;Dhandho se hisaab me roz ka 2 ghanta bachta hai. Bill banana itna aasan pehle kabhi nahi tha!&rdquo;
              </p>
              <div className="flex items-center gap-2.5 mt-2.5 pt-2 border-t border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#00a86b] flex items-center justify-center text-white font-bold text-[9px]">
                  RP
                </div>
                <div>
                  <p className="font-bold text-white text-[11px]">Rameshbhai Patel</p>
                  <p className="text-slate-400 text-[10px]">Patel Kirana Stores, Ahmedabad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
