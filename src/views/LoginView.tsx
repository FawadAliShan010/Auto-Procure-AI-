import React, { useState } from 'react';
import { useProcure } from '../context/ProcurementContext';
import { useAuth } from '../context/AuthContext';
import { CURRENT_USER, ALTERNATE_USER } from '../data/mockProcurementData';
import {
  Hexagon,
  ShieldCheck,
  Sparkles,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginView: React.FC = () => {
  const { navigateTo, switchUser, addToast } = useProcure();
  const { signInWithGoogle, signInWithDemo, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setLocalError(null);
      clearAuthError();
      await signInWithGoogle();
      addToast('Welcome to AutoProcure AI', 'Successfully authenticated with Google', 'success');
      navigateTo('/dashboard');
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setLocalError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
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

      {/* Right Column: Sign In Card */}
      <div className="flex-1 bg-[#0B1120] flex items-center justify-center p-6 md:p-14">
        <div className="max-w-md w-full bg-[#111A2E] border border-slate-800 rounded-2xl p-7 md:p-9 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Single Sign-On (SSO)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Sign In to AutoProcure AI
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Authenticate with your corporate credentials to access the purchase request gatekeeper.
            </p>
          </div>

          {/* Error Banner */}
          {displayError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
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
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-slate-200"
            >
              {isSigningIn ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Privacy and Security Indicator */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure enterprise procurement workspace</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-[#111A2E] px-3 text-slate-500">
                Or Evaluation Sandbox
              </span>
            </div>
          </div>

          {/* Quick Demo Personas (preserves all demo scenarios) */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
              One-Click Role Simulation
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoSignIn(CURRENT_USER)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-850 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  Fawad Ali Shan
                </div>
                <div className="text-[10px] text-slate-400">Procurement Director</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn(ALTERNATE_USER)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-850 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  Marcus Vance
                </div>
                <div className="text-[10px] text-slate-400">Requisitioner (Ops)</div>
              </button>
            </div>
          </div>

          {/* Security footnote */}
          <div className="mt-7 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">
              By signing in, you agree to enterprise compliance standards and SAP audit logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
