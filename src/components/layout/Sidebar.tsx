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
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigateTo, currentUser, switchUser } = useProcure();

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
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs border border-indigo-500/40">
            <Hexagon className="w-5 h-5 fill-white/15 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-sm">AutoProcure AI</span>
            </div>
            <span className="text-[11px] text-slate-400 block font-medium">Point-of-Origin Gatekeeper</span>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="px-3 pt-4 pb-2">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.path === '/submit' && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PR Workflow Stages Stepper */}
        <div className="px-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Gatekeeper Workflow
              </span>
              <span className="text-[10px] font-mono text-slate-400">4 GATES</span>
            </div>
            <div className="space-y-1">
              {[
                { path: '/submit' as RoutePath, num: '01', label: 'Submit PR' },
                { path: '/analysis' as RoutePath, num: '02', label: '4-Gate Audit' },
                { path: '/decision' as RoutePath, num: '03', label: 'AI Decision' },
                { path: '/recommendation' as RoutePath, num: '04', label: 'ERP Commit' },
              ].map((step) => {
                const isStepActive = currentRoute === step.path;
                return (
                  <button
                    key={step.path}
                    onClick={() => navigateTo(step.path)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                      isStepActive
                        ? 'text-white font-semibold bg-indigo-950/80 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
      <div className="p-3 border-t border-slate-800/80 bg-[#090E1A]">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
          </div>
          <button
            onClick={handleToggleUser}
            title="Switch User Persona"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
