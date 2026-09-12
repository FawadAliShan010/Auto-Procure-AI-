import React from 'react';
import { useProcure } from '../../context/ProcurementContext';
import { RoutePath } from '../../types/procurement';
import { ALTERNATE_USER, CURRENT_USER } from '../../data/mockProcurementData';
import {
  Home,
  PlusCircle,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  Hexagon,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigateTo, currentUser, switchUser, addToast } = useProcure();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed Out', 'You have been successfully signed out.', 'info');
      navigateTo('/login');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const navItems: Array<{ path: RoutePath; label: string; icon: React.FC<{ className?: string }> }> = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/submit', label: 'Submit PR', icon: PlusCircle },
    { path: '/requests', label: 'My Requests', icon: FileText },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleToggleUser = () => {
    if (currentUser.id === CURRENT_USER.id) {
      switchUser(ALTERNATE_USER);
    } else {
      switchUser(CURRENT_USER);
    }
  };

  return (
    <aside className="w-64 bg-[#0B1120] text-slate-200 shrink-0 flex flex-col justify-between border-r border-slate-800/80 min-h-screen select-none">
      {/* Brand Header */}
      <div>
        <div
          onClick={() => navigateTo('/dashboard')}
          className="p-5 flex items-center gap-3 cursor-pointer hover:bg-slate-900/40 transition-colors border-b border-slate-800/80"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs border border-indigo-400/30">
            <Hexagon className="w-5 h-5 fill-white/20 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-sm">AutoProcure AI</span>
              <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1 py-0.2 rounded">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium truncate">Pre-Submission Gatekeeper</span>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="px-3 pt-4 pb-2">
          <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Platform Menu
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.path ||
                (item.path === '/submit' &&
                  (currentRoute === '/processing' ||
                    currentRoute === '/analysis' ||
                    currentRoute === '/decision' ||
                    currentRoute === '/recommendation'));

              return (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.path === '/submit' && (
                    <span className="ml-auto text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                      AI GATE
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PR Workflow Stages Stepper */}
        <div className="px-3 mt-3">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 shadow-inner">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Gatekeeper Workflow
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                4 GATES
              </span>
            </div>
            <div className="space-y-1">
              {[
                { path: '/submit' as RoutePath, num: '01', label: 'Submit PR' },
                { path: '/analysis' as RoutePath, num: '02', label: '4-Gate Audit' },
                { path: '/decision' as RoutePath, num: '03', label: 'AI Decision' },
                { path: '/recommendation' as RoutePath, num: '04', label: 'Recommendation' },
              ].map((step) => {
                const isStepActive = currentRoute === step.path;
                return (
                  <button
                    key={step.path}
                    onClick={() => navigateTo(step.path)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                      isStepActive
                        ? 'text-white font-semibold bg-indigo-600/30 border border-indigo-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold ${isStepActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {step.num}
                    </span>
                    <span className="truncate">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User Card & Persona Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090E1A] space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.email || currentUser.role}</p>
          </div>
          <button
            onClick={handleToggleUser}
            title="Switch User Persona (Fawad Ali Shan ↔ Marcus Vance)"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Functional Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-medium transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};
