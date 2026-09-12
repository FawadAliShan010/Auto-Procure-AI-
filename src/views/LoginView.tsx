import React, { useState } from 'react';
import { useProcure } from '../context/ProcurementContext';
import { useAuth } from '../context/AuthContext';
import { CURRENT_USER, ALTERNATE_USER } from '../data/mockProcurementData';
import {
  Hexagon,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export const LoginView: React.FC = () => {
  const { navigateTo, switchUser, addToast } = useProcure();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithDemo,
    authError,
    clearAuthError,
  } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setLocalError(null);
      clearAuthError();
      await signInWithGoogle();
      addToast('Welcome to AutoProcure AI', 'Successfully authenticated with Google', 'success');
      navigateTo('/dashboard');
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setLocalError(err.message || 'Unable to sign in with Google. Please use Email & Password below.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Please fill in both email and password.');
      return;
    }

    if (authMode === 'signup' && !displayName.trim()) {
      setLocalError('Please enter your full name for the enterprise profile.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearAuthError();

      if (authMode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        addToast('Account Created', `Welcome to AutoProcure AI, ${displayName}!`, 'success');
      } else {
        await signInWithEmail(email, password);
        addToast('Welcome Back', 'Successfully signed in to AutoProcure AI', 'success');
      }

      navigateTo('/dashboard');
    } catch (err: any) {
      console.error('Email auth failed:', err);
      setLocalError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = (persona: typeof CURRENT_USER) => {
    signInWithDemo(persona);
    switchUser(persona);
    addToast('Authenticated (Demo)', `Logged in as ${persona.name}`, 'info');
    navigateTo('/dashboard');
  };

  const displayError = localError || authError;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#090E1A]">
      {/* Left Column: Deep Navy Brand Hero */}
      <div className="flex-1 bg-[#0A0F1D] text-white p-8 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs border border-indigo-500/40">
                <Hexagon className="w-5 h-5 fill-white/15 stroke-[2]" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white">AutoProcure AI</span>
                <span className="text-[10px] ml-2 font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.2 rounded">
                  ENTERPRISE
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Point-of-Origin Gatekeeper</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-12 md:mt-16 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold tracking-wide mb-5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AutoProcure AI</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight text-white">
              AI-Powered Purchase Request Checking System
            </h1>

            <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              Clean data. Check budgets. Optimize inventory. Make smarter procurement decisions.
            </p>

            {/* Feature Highlights - 4 Gates */}
            <div className="mt-8">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Pre-Submission Verification Pipeline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <span className="text-indigo-400 text-[10px] font-mono font-bold block mb-0.5">GATE 01</span>
                  <span className="text-xs font-semibold text-slate-200">Data Cleaning</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <span className="text-indigo-400 text-[10px] font-mono font-bold block mb-0.5">GATE 02</span>
                  <span className="text-xs font-semibold text-slate-200">Budget Check</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <span className="text-indigo-400 text-[10px] font-mono font-bold block mb-0.5">GATE 03</span>
                  <span className="text-xs font-semibold text-slate-200">Inventory Check</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <span className="text-indigo-400 text-[10px] font-mono font-bold block mb-0.5">GATE 04</span>
                  <span className="text-xs font-semibold text-slate-200">Usage Analysis</span>
                </div>
              </div>
            </div>

            {/* Value checklist */}
            <div className="mt-8 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Standardizes unstructured item descriptions into ERP-compliant catalog items</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prevents duplicate purchasing by uncovering idle surplus in sister facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct BAPI_PO_CREATE1 integration with SAP S/4HANA workflows</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/80 pt-5 gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure enterprise procurement workspace</span>
          </div>
          <span className="text-slate-400">SAP S/4HANA Certified Adapter</span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="flex-1 bg-[#0B1120] flex items-center justify-center p-6 md:p-14">
        <div className="max-w-md w-full bg-[#111A2E] border border-slate-800 rounded-2xl p-7 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-semibold uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Identity</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {authMode === 'signin' ? 'Sign In to AutoProcure AI' : 'Create Enterprise Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {authMode === 'signin'
                ? 'Authenticate to access the pre-submission gatekeeper system.'
                : 'Register a new authorized procurement profile.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setLocalError(null);
                clearAuthError();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setLocalError(null);
                clearAuthError();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Notice</span>
                <span>{displayError}</span>
              </div>
              <button
                onClick={() => {
                  setLocalError(null);
                  clearAuthError();
                }}
                className="text-rose-400 hover:text-white text-xs cursor-pointer ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Primary Action: Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-slate-200 mb-4"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-[#111A2E] px-2.5 text-slate-500">
                Or with Email & Password
              </span>
            </div>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Fawad Ali Shan"
                    required={authMode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="fawad.alishan@enterprise.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-500">Min 6 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-9 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {authMode === 'signin' && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-700 accent-indigo-600 cursor-pointer"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-slate-500">Firebase Auth</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-indigo-500"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In to Gatekeeper' : 'Create Enterprise Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy and Security Indicator */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-3">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure enterprise procurement workspace</span>
          </div>

          {/* Role Simulation Sandbox (preserves all demo scenarios) */}
          <div className="mt-5 pt-3.5 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              One-Click Role Simulation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn(CURRENT_USER)}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-850 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-semibold text-[11px] text-white group-hover:text-indigo-300 transition-colors">
                  Fawad Ali Shan
                </div>
                <div className="text-[9px] text-slate-400">Procurement Director</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn(ALTERNATE_USER)}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-850 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-semibold text-[11px] text-white group-hover:text-indigo-300 transition-colors">
                  Marcus Vance
                </div>
                <div className="text-[9px] text-slate-400">Requisitioner (Ops)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
