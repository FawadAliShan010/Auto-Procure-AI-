import React from 'react';
import { useProcure } from '../context/ProcurementContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import {
  CheckCircle2,
  Database,
  ArrowRight,
  BookmarkCheck,
  FileCheck,
  Share2,
  Building2,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';

export const RecommendationView: React.FC = () => {
  const { currentAnalysisPR, approveAndSendToERP, navigateTo, setSelectedRequestForModal } =
    useProcure();

  const pr = currentAnalysisPR;

  if (!pr || !pr.decisionResult) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
        <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Final Recommendation</h3>
        <p className="text-sm text-slate-500 mt-1">
          Complete a requisition check to view final ERP allocation details.
        </p>
        <Button variant="primary" className="mt-4" onClick={() => navigateTo('/submit')}>
          Submit New Requisition
        </Button>
      </div>
    );
  }

  const { decisionResult } = pr;

  const handleSendToERP = () => {
    approveAndSendToERP(pr.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">ERP Recommendation Synthesized</h1>
            {pr.erpSynced && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Pushed to ERP • {pr.erpRefId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Audit complete across all 4 gates. Requisition cleaned, sized, and ready for ERP routing or internal transfer dispatch.
          </p>
        </div>
      </div>

      {/* 4 Quantitative Result Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">AI Resolution</span>
          <div className="mt-1.5">
            <StatusBadge status={decisionResult.decision} size="sm" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Approved External PO</span>
          <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
            {decisionResult.purchaseQuantity} <span className="text-xs font-sans font-medium text-slate-500">units</span>
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Sister Depot Transfer</span>
          <span className="text-base font-bold font-mono text-sky-800 mt-1 block">
            {decisionResult.transferQuantity} <span className="text-xs font-sans font-medium text-slate-500">units</span>
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Net Cost Avoidance</span>
          <span className="text-base font-bold font-mono text-emerald-800 mt-1 block">
            ${decisionResult.estimatedSavings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Summary vs Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-xs tracking-tight">Requisition Summary</h3>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{pr.id}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Item Master Title</span>
                <span className="font-semibold text-slate-900 text-right">
                  {pr.gate1?.standardized || pr.itemDescription}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Resolved Catalog Code</span>
                <span className="font-mono font-bold text-slate-800">
                  #{pr.gate1?.matchedItemCode || 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Cost Center</span>
                <span className="font-medium text-slate-800">{pr.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Requisitioner</span>
                <span className="font-medium text-slate-800">{pr.employeeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Fulfillable Volume</span>
                <span className="font-mono font-bold text-indigo-700">
                  {decisionResult.purchaseQuantity + decisionResult.transferQuantity} units
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Capital Preserved</span>
                <span className="font-mono font-bold text-emerald-800">
                  ${decisionResult.estimatedSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pre-submission compliance passed</span>
            <button
              onClick={() => setSelectedRequestForModal(pr)}
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold cursor-pointer"
            >
              Inspect JSON Payload
            </button>
          </div>
        </div>

        {/* Right Column: Next Steps Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-3.5">
              <h3 className="font-bold text-slate-900 text-xs tracking-tight">Downstream Dispatch</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Commit payload to enterprise ERP or queue for human planner sign-off
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Primary Action: Approve & Send to ERP */}
              <Button
                variant={pr.erpSynced ? 'secondary' : 'primary'}
                size="md"
                className="w-full justify-center"
                leftIcon={pr.erpSynced ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Database className="w-4 h-4" />}
                onClick={handleSendToERP}
                disabled={pr.erpSynced}
              >
                {pr.erpSynced ? 'Payload Committed to SAP S/4HANA' : 'Approve & Dispatch to ERP'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                leftIcon={<BookmarkCheck className="w-3.5 h-3.5" />}
                onClick={() => navigateTo('/requests')}
              >
                Save to Requisition Queue
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                onClick={() => setSelectedRequestForModal(pr)}
              >
                View Full Audit Certificate
              </Button>
            </div>
          </div>

          <div className="mt-5 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 text-[11px]">Active Gateway Target:</div>
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>SAP S/4HANA (Al-Futtaim Hub)</span>
              <span className="text-emerald-700 font-bold">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return to Dashboard CTA */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateTo('/submit')}
        >
          Submit Another Request
        </Button>

        <Button
          variant="secondary"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => navigateTo('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
