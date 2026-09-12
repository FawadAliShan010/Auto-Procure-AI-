import React from 'react';
import { useProcure } from '../context/ProcurementContext';
import { Button } from '../components/common/Button';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Zap,
  BarChart2,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { requests, navigateTo } = useProcure();

  const matrix = [
    {
      capability: 'Primary Focus',
      sap: 'ERP budget synchronization',
      blueYonder: 'Supply-chain execution',
      ibm: 'Multi-enterprise EDI',
      autoProcure: 'Point-of-origin gatekeeping',
      isHero: true,
    },
    {
      capability: 'Gate 1: Data cleaning',
      sap: '✕ Rejects or accepts bad strings',
      blueYonder: '✕ Requires clean records',
      ibm: '✕ Schema validation only',
      autoProcure: '✓ AI cleanup and standardization',
    },
    {
      capability: 'Gate 2: Budget audit',
      sap: '◐ Manual approval loops',
      blueYonder: '✕ Defers to ERP',
      ibm: '✕ External ERP verification',
      autoProcure: '✓ Real-time pre-submission check',
    },
    {
      capability: 'Gate 3: Other-site stock',
      sap: '◐ Manual planning run',
      blueYonder: '◐ Bulk network optimization',
      ibm: '◐ Siloed visibility',
      autoProcure: '✓ Search and draft transfer',
    },
    {
      capability: 'Gate 4: Usage check',
      sap: '✕ Manual safety-stock rules',
      blueYonder: '✓ Predictive forecasting',
      ibm: '✕ Visibility without user guards',
      autoProcure: '✓ Blocks excess vs. usage',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded">
            PRD BENCHMARK
          </span>
          <span className="text-xs text-slate-400 font-medium">AutoProcure AI vs Legacy ERP Modules</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Procurement Audit & Benchmark Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Empirical impact metrics across cycle speed, data cleanliness, and sister-facility spend avoidance.
        </p>
      </div>

      {/* 3 Headline Business Benefits from PRD Section 8 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Velocity Acceleration
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-2 tracking-tight">95%</div>
          <h3 className="font-bold text-slate-900 text-xs mt-1">Processing Speed Acceleration</h3>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Reduced approval and auditing lifecycle from a 4.5-day industry baseline to sub-second gate validation.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Spend Avoidance
            </span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-indigo-700 mt-2 tracking-tight">18%</div>
          <h3 className="font-bold text-slate-900 text-xs mt-1">Direct External PO Spend Avoidance</h3>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Eliminated redundant supplier orders by intercepting idle internal stock at sister warehouse nodes.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Data Cleanliness
            </span>
            <div className="w-7 h-7 rounded-md bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-sky-700 mt-2 tracking-tight">75%</div>
          <h3 className="font-bold text-slate-900 text-xs mt-1">Data Error & Typo Elimination</h3>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Averted downstream invoicing discrepancies, supplier rejections, and GL accounting mismatches.
          </p>
        </div>
      </div>

      {/* Comprehensive Market Competitive Matrix from PRD Section 2 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Enterprise Market Capability Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AutoProcure AI point-of-origin gatekeeping compared to legacy ERP solutions (PRD Sec. 2)
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-mono text-slate-500">
            <span className="text-emerald-700 font-bold">✓ Native Gate</span>
            <span>•</span>
            <span className="text-amber-700">◐ Partial/Manual</span>
            <span>•</span>
            <span className="text-slate-400">✕ Unsupported</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Verification Capability</th>
                <th className="py-3 px-4 text-slate-600">SAP IBP / Joule</th>
                <th className="py-3 px-4 text-slate-600">Blue Yonder</th>
                <th className="py-3 px-4 text-slate-600">IBM Sterling</th>
                <th className="py-3 px-4 bg-indigo-50/80 text-indigo-900 font-bold border-l border-indigo-100">
                  AutoProcure AI Gateway
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {row.capability}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{row.sap}</td>
                  <td className="py-3 px-4 text-slate-600">{row.blueYonder}</td>
                  <td className="py-3 px-4 text-slate-600">{row.ibm}</td>
                  <td className="py-3 px-4 bg-indigo-50/40 font-semibold text-indigo-950 border-l border-indigo-100">
                    {row.autoProcure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
