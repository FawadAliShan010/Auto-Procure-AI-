import React, { useState } from 'react';
import { useProcure } from '../context/ProcurementContext';
import { CURRENT_USER, ALTERNATE_USER } from '../data/mockProcurementData';
import {
  Hexagon,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Database,
  Lock,
  Mail,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginView: React.FC = () => {
  const { navigateTo, switchUser, addToast } = useProcure();
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [password, setPassword] = useState('••••••••••••');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Welcome Back', `Authenticated as ${CURRENT_USER.name}`, 'success');
    navigateTo('/dashboard');
  };

  const handleQuickLogin = (user: typeof CURRENT_USER) => {
    switchUser(user);
    navigateTo('/dashboard');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Left Column: Deep Navy Brand Hero */}
      <div className="flex-1 bg-[#0A0F1D] text-white p-8 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs border border-indigo-500/40">
                <Hexagon className="w-5 h-5 fill-white/15 stroke-[2]" />
              </div>
              <span className="font-bold text-base tracking-tight">AutoProcure AI</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span>Smarter Procurement</span>
              <span>•</span>
              <span>Point-of-Origin Gatekeeper</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-14 md:mt-20 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold tracking-wide mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Procurement Gatekeeper</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight text-white">
              AI-Based Purchase Request Checking System
            </h1>

            <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed">
              Intercept purchase requests at point of creation, correct data quality issues, and run budget, inventory, and usage checks before supplier purchasing.
            </p>

            {/* 4 Feature Gates */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigateTo('/submit')}
              >
                Submit Requisition
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigateTo('/dashboard')}
                className="bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
              >
                Executive Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-5">
          <span>CONFIDENTIAL · EXTERNAL AL-FUTTAIM</span>
          <span>SAP S/4HANA Certified Adapter</span>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="flex-1 bg-[#0F172A] flex items-center justify-center p-8 md:p-14">
        <div className="max-w-md w-full bg-[#131E35] border border-slate-800 rounded-xl p-7 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Sign In to AutoProcure</h2>
            <p className="text-xs text-slate-400 mt-1">Enterprise SSO and Gatekeeper Access</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="fawad.alishan@alfuttaim.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 accent-indigo-600" />
                <span>Remember session</span>
              </label>
              <a href="#forgot" className="text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2">
              Sign In to Gatekeeper
            </Button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-7 pt-5 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
              Quick One-Click Sign In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(CURRENT_USER)}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-white">Fawad Ali Shan</div>
                <div className="text-[10px] text-indigo-400">Procurement Director</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(ALTERNATE_USER)}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-indigo-500/80 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-white">Marcus Vance</div>
                <div className="text-[10px] text-indigo-400">Requisitioner</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
