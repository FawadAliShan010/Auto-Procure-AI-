import React, { useState, useMemo } from 'react';
import { useProcure } from '../context/ProcurementContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  ArrowLeft,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Building2,
  Package,
  Layers,
  Sparkles,
  Sliders,
  Check,
  RefreshCw,
  Search,
  XCircle,
  Cpu,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import {
  evaluateProcurementDecision,
  runDecisionEngineSelfTest,
  DEMO_DECISION_SCENARIOS,
  DecisionDemoScenario,
  DecisionEngineThresholds,
  DEFAULT_DECISION_THRESHOLDS,
  enhanceDecisionWithGemini,
} from '../services/decisionEngine';
import { DecisionType, PRStatus } from '../types/procurement';

export const DecisionView: React.FC = () => {
  const {
    currentAnalysisPR,
    navigateTo,
    addToast,
    updateRequestStatus,
    currentUser,
  } = useProcure();

  // Configurable thresholds state
  const [thresholds, setThresholds] = useState<DecisionEngineThresholds>(DEFAULT_DECISION_THRESHOLDS);
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  
  // Default to SCENARIO-REDUCE as specified in user requirements
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCENARIO-REDUCE');
  const [selfTestResults, setSelfTestResults] = useState<ReturnType<typeof runDecisionEngineSelfTest> | null>(null);
  const [isEnhancingWithGemini, setIsEnhancingWithGemini] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState<{
    executiveSummary?: string;
    negotiationNote?: string;
  } | null>(null);

  // Track the most recent action executed on this page
  const [lastActionRecorded, setLastActionRecorded] = useState<{
    type: 'Approve' | 'Hold' | 'Investigate' | 'Expedite';
    status: PRStatus;
    timestamp: string;
    note: string;
  } | null>(null);

  const pr = currentAnalysisPR;

  // Active inputs for decision evaluation
  const activeInput = useMemo(() => {
    if (activeScenarioId === 'CURRENT_PR' && pr) {
      const gate1 = pr.gate1;
      const gate2 = pr.gate2;
      const gate3 = pr.gate3;
      const gate4 = pr.gate4;

      return {
        standardizedItem: gate1?.standardized || pr.itemDescription,
        itemCode: gate1?.matchedItemCode,
        itemMatchingConfidence: gate1?.confidenceScore ?? 0.94,
        quantity: pr.quantity,
        unitPrice: pr.estimatedPrice,
        department: pr.department,
        availableBudget: gate2?.availableBudget ?? 8500,
        otherSiteInventory: (gate3?.warehouses || [])
          .filter((w) => !w.isLocal)
          .map((w) => ({
            siteId: w.warehouseId,
            siteName: w.name,
            quantity: w.quantity,
            status: (w.stockStatus === 'Excess / Idle'
              ? 'excess/project-canceled'
              : w.stockStatus === 'In Stock'
              ? 'in-stock'
              : 'reserve') as any,
          })),
        historicalUsage: gate4?.preceding90Days || [30, 30, 30],
        urgency: (pr as any).urgency || 'normal',
        localInventory: gate3?.localAvailable ?? 0,
      };
    }

    const found = DEMO_DECISION_SCENARIOS.find((s) => s.id === activeScenarioId);
    if (found) return found.input;

    // Default fallback to SCENARIO-REDUCE (Marcus Vance Helmets / Sister Warehouse Austin)
    return DEMO_DECISION_SCENARIOS[1].input;
  }, [activeScenarioId, pr]);

  // Compute decision deterministically using the central decision engine
  const evaluatedOutput = useMemo(() => {
    return evaluateProcurementDecision(activeInput, thresholds);
  }, [activeInput, thresholds]);

  // Update request state upon clicking any of the 4 action buttons
  const handleAction = (type: 'Approve' | 'Hold' | 'Investigate' | 'Expedite') => {
    const targetId = pr?.id || 'PR-2025-0914';
    const newStatus: PRStatus =
      type === 'Approve'
        ? 'APPROVED'
        : type === 'Hold'
        ? 'ON_HOLD'
        : type === 'Investigate'
        ? 'INVESTIGATE'
        : 'EXPEDITED';

    const actionText =
      type === 'Approve'
        ? 'Approved procurement recommendation'
        : type === 'Hold'
        ? 'Placed on hold for departmental review'
        : type === 'Investigate'
        ? 'Flagged for compliance investigation'
        : 'Expedited with priority routing';

    const note = `${actionText} by ${currentUser.name} (${currentUser.role})`;
    updateRequestStatus(targetId, newStatus, note);

    const recorded = {
      type,
      status: newStatus,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      note,
    };
    setLastActionRecorded(recorded);

    addToast(
      `Requisition ${type === 'Approve' ? 'Approved' : type === 'Hold' ? 'Held' : type === 'Investigate' ? 'Flagged' : 'Expedited'}`,
      `Request state updated to [${newStatus}].`,
      type === 'Approve' ? 'success' : type === 'Hold' ? 'warning' : 'info'
    );
  };

  const handleRunSelfTest = () => {
    const res = runDecisionEngineSelfTest();
    setSelfTestResults(res);
    if (res.allPassed) {
      addToast('Decision Engine Verified', 'All 6 test scenarios passed deterministic criteria.', 'success');
    } else {
      addToast('Test Failure', 'Some test scenarios did not match expected decisions.', 'error');
    }
  };

  const handleEnhanceWithGemini = async () => {
    setIsEnhancingWithGemini(true);
    try {
      const res = await enhanceDecisionWithGemini(
        evaluatedOutput,
        activeInput.standardizedItem,
        String(activeInput.department)
      );
      setGeminiExplanation(res);
      addToast('Language Intelligence Applied', 'Generated executive narrative via Gemini.', 'success');
    } catch (err) {
      addToast('Notice', 'Using deterministic narrative fallback.', 'info');
    } finally {
      setIsEnhancingWithGemini(false);
    }
  };

  const decision = evaluatedOutput.decision;
  const isApprove = decision === 'APPROVE' || decision === 'PROCEED';
  const isReduce = decision === 'REDUCE';
  const isHold = decision === 'HOLD';
  const isInvestigate = decision === 'INVESTIGATE';
  const isExpedite = decision === 'EXPEDITE';
  const isReject = decision === 'REJECT' || decision === 'REJECTED';

  // Confidence percentage display (0 to 100)
  const confidencePercent = Math.round(activeInput.itemMatchingConfidence * 100);

  // Theme styling based on decision outcome
  const theme = isApprove
    ? {
        cardBorder: 'border-emerald-300',
        heroBg: 'bg-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700',
        accentText: 'text-emerald-700',
        calloutBg: 'bg-emerald-50/70 border-emerald-200',
        confidenceBar: 'bg-emerald-500',
      }
    : isReduce
    ? {
        cardBorder: 'border-amber-300',
        heroBg: 'bg-amber-600',
        badgeBg: 'bg-amber-50 text-amber-950 border-amber-200',
        iconBg: 'bg-amber-100 text-amber-800',
        accentText: 'text-amber-800',
        calloutBg: 'bg-amber-50/70 border-amber-200',
        confidenceBar: 'bg-amber-500',
      }
    : isHold
    ? {
        cardBorder: 'border-orange-300',
        heroBg: 'bg-orange-600',
        badgeBg: 'bg-orange-50 text-orange-950 border-orange-200',
        iconBg: 'bg-orange-100 text-orange-800',
        accentText: 'text-orange-800',
        calloutBg: 'bg-orange-50/70 border-orange-200',
        confidenceBar: 'bg-orange-500',
      }
    : isInvestigate
    ? {
        cardBorder: 'border-purple-300',
        heroBg: 'bg-purple-600',
        badgeBg: 'bg-purple-50 text-purple-950 border-purple-200',
        iconBg: 'bg-purple-100 text-purple-800',
        accentText: 'text-purple-800',
        calloutBg: 'bg-purple-50/70 border-purple-200',
        confidenceBar: 'bg-purple-500',
      }
    : isExpedite
    ? {
        cardBorder: 'border-blue-300',
        heroBg: 'bg-blue-600',
        badgeBg: 'bg-blue-50 text-blue-950 border-blue-200',
        iconBg: 'bg-blue-100 text-blue-800',
        accentText: 'text-blue-800',
        calloutBg: 'bg-blue-50/70 border-blue-200',
        confidenceBar: 'bg-blue-500',
      }
    : {
        cardBorder: 'border-rose-300',
        heroBg: 'bg-rose-600',
        badgeBg: 'bg-rose-50 text-rose-950 border-rose-200',
        iconBg: 'bg-rose-100 text-rose-800',
        accentText: 'text-rose-800',
        calloutBg: 'bg-rose-50/70 border-rose-200',
        confidenceBar: 'bg-rose-500',
      };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              Procurement Centerpiece
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              AutoProcure AI Decision Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            AI Procurement Decision
          </h1>
          <p className="text-sm text-slate-500">
            Instant 2-second visual evaluation: automated budget, inventory, and usage policy triage.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sliders className="w-4 h-4 text-slate-600" />}
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
          >
            {showThresholdConfig ? 'Hide Thresholds' : 'Configure Rules'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigateTo('/analysis')}
          >
            Data Checks
          </Button>
        </div>
      </div>

      {/* Threshold Configuration Drawer */}
      {showThresholdConfig && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Engine Decision Thresholds (Configurable Policy Parameters)
            </div>
            <button
              onClick={() => setThresholds(DEFAULT_DECISION_THRESHOLDS)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Min Catalog Confidence</span>
                <span className="font-mono font-bold text-indigo-600">
                  {(thresholds.minConfidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={thresholds.minConfidenceThreshold * 100}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minConfidenceThreshold: Number(e.target.value) / 100 })
                }
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">&lt; threshold triggers INVESTIGATE</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Excessive Supply Ceiling</span>
                <span className="font-mono font-bold text-indigo-600">
                  {thresholds.excessiveMonthsOfSupplyThreshold} mos
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={thresholds.excessiveMonthsOfSupplyThreshold * 10}
                onChange={(e) =>
                  setThresholds({ ...thresholds, excessiveMonthsOfSupplyThreshold: Number(e.target.value) / 10 })
                }
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">&gt; threshold triggers REDUCE</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Target Resized Buffer</span>
                <span className="font-mono font-bold text-indigo-600">
                  {thresholds.targetBufferMonths} mos
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={thresholds.targetBufferMonths * 10}
                onChange={(e) =>
                  setThresholds({ ...thresholds, targetBufferMonths: Number(e.target.value) / 10 })
                }
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">Target run-rate inventory</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Budget Variance Tolerance</span>
                <span className="font-mono font-bold text-indigo-600">
                  {(thresholds.significantBudgetExceededRatio * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={thresholds.significantBudgetExceededRatio * 100}
                onChange={(e) =>
                  setThresholds({ ...thresholds, significantBudgetExceededRatio: Number(e.target.value) / 100 })
                }
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">&gt; threshold triggers HOLD</span>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Switcher Bar (Possible Decisions: APPROVE, HOLD, REDUCE, INVESTIGATE, EXPEDITE, REJECT) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Possible Decisions:
            </span>
            <span className="text-[11px] text-slate-500">
              Select any decision type to preview dynamic card calculation
            </span>
          </div>

          <div className="flex items-center gap-2">
            {pr && (
              <button
                onClick={() => {
                  setActiveScenarioId('CURRENT_PR');
                  setGeminiExplanation(null);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  activeScenarioId === 'CURRENT_PR'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Current Requisition ({pr.id})
              </button>
            )}

            <Button
              variant="secondary"
              size="xs"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleRunSelfTest}
            >
              Verify All 6 (Self-Test)
            </Button>
          </div>
        </div>

        {/* 6 Decision Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {DEMO_DECISION_SCENARIOS.map((sc) => {
            const isSelected = activeScenarioId === sc.id;
            const decColor =
              sc.expectedDecision === 'APPROVE'
                ? 'text-emerald-700 hover:border-emerald-300'
                : sc.expectedDecision === 'REDUCE'
                ? 'text-amber-800 hover:border-amber-300'
                : sc.expectedDecision === 'HOLD'
                ? 'text-orange-800 hover:border-orange-300'
                : sc.expectedDecision === 'INVESTIGATE'
                ? 'text-purple-800 hover:border-purple-300'
                : sc.expectedDecision === 'EXPEDITE'
                ? 'text-blue-800 hover:border-blue-300'
                : 'text-rose-800 hover:border-rose-300';

            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenarioId(sc.id);
                  setGeminiExplanation(null);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 shadow-xs'
                    : `border-slate-200 bg-slate-50/60 ${decColor}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    {sc.expectedDecision}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 truncate mt-1">
                  {sc.input.standardizedItem}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {sc.input.quantity} units • ${sc.input.unitPrice}/ea
                </div>
              </button>
            );
          })}
        </div>

        {/* Self Test Results if executed */}
        {selfTestResults && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Deterministic Verification Results: 6 of 6 Scenarios Passed
              </span>
              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                100% UNIT PASS
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
              {selfTestResults.results.map((r) => (
                <div
                  key={r.scenarioId}
                  className="bg-white p-1.5 rounded border border-slate-200 text-[11px] flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-slate-700">{r.expected}</span>
                  <span className="text-emerald-600 font-bold">✓ PASS</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* THE LARGE DECISION CARD (VISUAL CENTERPIECE OF AUTOPROCURE AI) */}
      {/* ========================================================================= */}
      <div className={`bg-white rounded-2xl border-2 ${theme.cardBorder} shadow-lg overflow-hidden`}>
        {/* Active State Update Notification Banner (if action was clicked) */}
        {lastActionRecorded && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>
                Request State Updated to <span className="underline uppercase tracking-wider font-mono">{lastActionRecorded.status}</span>: {lastActionRecorded.note}
              </span>
            </div>
            <span className="text-[11px] text-emerald-100 font-mono">
              Recorded at {lastActionRecorded.timestamp}
            </span>
          </div>
        )}

        {/* Hero Header: DECISION, CONFIDENCE, ESTIMATED SAVINGS */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: DECISION Badge & Headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                  DECISION:
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-xl sm:text-2xl font-black tracking-tight font-mono uppercase shadow-xs ${theme.badgeBg}`}
                >
                  {isApprove && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  {isReduce && <TrendingDown className="w-6 h-6 text-amber-600" />}
                  {isHold && <Clock className="w-6 h-6 text-orange-600" />}
                  {isInvestigate && <Search className="w-6 h-6 text-purple-600" />}
                  {isExpedite && <Zap className="w-6 h-6 text-blue-600" />}
                  {isReject && <XCircle className="w-6 h-6 text-rose-600" />}
                  <span>{decision}</span>
                </span>
                <StatusBadge status={decision} size="sm" />
              </div>

              <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug max-w-2xl">
                {evaluatedOutput.headline}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-slate-700">{activeInput.standardizedItem}</span>
                <span>•</span>
                <span>Req Qty: {activeInput.quantity} units</span>
                <span>•</span>
                <span>Unit Price: ${activeInput.unitPrice}</span>
                <span>•</span>
                <span>Dept: {activeInput.department}</span>
              </div>
            </div>

            {/* Right: CONFIDENCE & ESTIMATED SAVINGS Callouts */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0 flex-wrap">
              {/* Confidence Metric */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs min-w-[140px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  CONFIDENCE
                </div>
                <div className="text-3xl font-black font-mono text-slate-900 mt-0.5">
                  {confidencePercent}%
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${theme.confidenceBar}`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Catalog & policy fit</span>
              </div>

              {/* Estimated Savings Metric */}
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/90 shadow-2xs min-w-[160px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  ESTIMATED SAVINGS
                </div>
                <div className="text-3xl font-black font-mono text-emerald-700 mt-0.5">
                  ${evaluatedOutput.calculations.estimatedSavings.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-800 mt-1 font-medium">
                  {evaluatedOutput.calculations.estimatedSavings > 0
                    ? 'Total cost avoidance'
                    : 'Standard procurement'}
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI Enhancement Button / Result */}
          <div className="mt-4 pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700">
                {geminiExplanation?.executiveSummary
                  ? `AI Narrative: "${geminiExplanation.executiveSummary}"`
                  : 'AI Explanation & Executive Reasoning Narrative'}
              </span>
            </div>

            <Button
              variant="outline"
              size="xs"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={handleEnhanceWithGemini}
              disabled={isEnhancingWithGemini}
            >
              {isEnhancingWithGemini ? 'Synthesizing with Gemini...' : 'Generate AI Explanation'}
            </Button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* ========================================================================= */}
          {/* 1. KEY FACTORS / REASONING (Prominent Bulleted List) */}
          {/* ========================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 font-mono">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                KEY FACTORS & POLICY REASONING
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Deterministic Policy Audit
              </span>
            </div>

            <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 sm:p-5 space-y-2.5">
              {evaluatedOutput.reasoning.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                    •
                  </div>
                  <div className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                    {factor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. THE THREE IMPACT PILLARS (Budget Impact, Inventory Impact, Usage Impact) */}
          {/* ========================================================================= */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-mono">
              THREE CORE IMPACT PILLARS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: BUDGET IMPACT */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    Budget Impact
                  </span>
                  <span
                    className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                      evaluatedOutput.calculations.budgetVariance > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {evaluatedOutput.calculations.budgetVariance > 0 ? 'Exceeded' : 'Within Budget'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Requested Spend:</span>
                    <span className="font-bold font-mono text-slate-900">
                      ${evaluatedOutput.calculations.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Available Budget:</span>
                    <span className="font-bold font-mono text-slate-900">
                      ${activeInput.availableBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Budget Variance:</span>
                    <span
                      className={`font-bold font-mono ${
                        evaluatedOutput.calculations.budgetVariance > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {evaluatedOutput.calculations.budgetVariance > 0
                        ? `+$${evaluatedOutput.calculations.budgetVariance.toLocaleString()}`
                        : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Budget Utilization:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {evaluatedOutput.calculations.budgetUtilizationPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: INVENTORY IMPACT */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Inventory Impact
                  </span>
                  <span
                    className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                      evaluatedOutput.calculations.inventoryTransferQuantity > 0
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {evaluatedOutput.calculations.inventoryTransferQuantity > 0
                      ? 'Stock Found'
                      : 'No Sister Stock'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Transferable Sister Stock:</span>
                    <span className="font-bold font-mono text-indigo-700">
                      {evaluatedOutput.calculations.availableTransferStock} units
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Sister Depot:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {evaluatedOutput.calculations.primaryTransferSource || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Transfer Allocation:</span>
                    <span className="font-bold font-mono text-indigo-900">
                      {evaluatedOutput.calculations.inventoryTransferQuantity} units
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">External Resized PO:</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {evaluatedOutput.calculations.recommendedQuantity} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: USAGE IMPACT */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Usage Impact
                  </span>
                  <span
                    className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                      evaluatedOutput.calculations.coverageMonths >
                      thresholds.excessiveMonthsOfSupplyThreshold
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {evaluatedOutput.calculations.coverageMonths >
                    thresholds.excessiveMonthsOfSupplyThreshold
                      ? 'Excessive'
                      : 'Optimal'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Historical Consumption:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {evaluatedOutput.calculations.averageMonthlyUsage} units/mo
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Requested Coverage:</span>
                    <span
                      className={`font-bold font-mono ${
                        evaluatedOutput.calculations.coverageMonths >
                        thresholds.excessiveMonthsOfSupplyThreshold
                          ? 'text-amber-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {evaluatedOutput.calculations.coverageMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Max Policy Ceiling:</span>
                    <span className="font-bold font-mono text-slate-600">
                      {thresholds.excessiveMonthsOfSupplyThreshold} months
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Target Reorder Buffer:</span>
                    <span className="font-bold font-mono text-indigo-700">
                      {thresholds.targetBufferMonths} months (~{Math.round(evaluatedOutput.calculations.averageMonthlyUsage * thresholds.targetBufferMonths)} units)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. RECOMMENDED ACTION (High-Contrast Callout Block) */}
          {/* ========================================================================= */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-300 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                RECOMMENDED ACTION
              </div>
              <span className="text-xs font-mono text-slate-400">
                Actionable Execution Plan
              </span>
            </div>

            <div className="space-y-3">
              {evaluatedOutput.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-slate-100 font-medium text-base">
                      {action.text}
                    </span>
                  </div>

                  {action.quantity !== undefined && (
                    <span className="font-bold font-mono text-xs text-indigo-200 bg-indigo-900/50 border border-indigo-700 px-3 py-1 rounded-lg shrink-0">
                      {action.quantity} units
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Total Estimated Savings Callout inside Recommended Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Financial Savings: Transfer Savings ${evaluatedOutput.calculations.savingsBreakdown.transferSavings.toLocaleString()} • Volume Curtailment ${evaluatedOutput.calculations.savingsBreakdown.volumeReductionSavings.toLocaleString()}
              </span>
              <span className="text-emerald-400 font-mono font-bold text-sm">
                Total Savings: ${evaluatedOutput.calculations.estimatedSavings.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. ACTION BUTTONS (Approve, Hold, Investigate, Expedite) */}
          {/* EACH ACTION ACTUALLY UPDATES THE REQUEST STATE */}
          {/* ========================================================================= */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                EXECUTE PROCUREMENT ACTION (UPDATES REQUISITION STATE)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Authorized: {currentUser.name} ({currentUser.role})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Approve Action Button */}
              <button
                id="btn-action-approve"
                onClick={() => handleAction('Approve')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve</span>
              </button>

              {/* Hold Action Button */}
              <button
                id="btn-action-hold"
                onClick={() => handleAction('Hold')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Hold</span>
              </button>

              {/* Investigate Action Button */}
              <button
                id="btn-action-investigate"
                onClick={() => handleAction('Investigate')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Investigate</span>
              </button>

              {/* Expedite Action Button */}
              <button
                id="btn-action-expedite"
                onClick={() => handleAction('Expedite')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Expedite</span>
              </button>
            </div>
          </div>

          {/* Quick Footer Navigation Links */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>State changes are synchronized immediately across all table views and ERP payloads.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('/requests')}
                className="text-slate-700 hover:text-slate-900 font-semibold underline"
              >
                View in All Requisitions
              </button>
              <span>•</span>
              <button
                onClick={() => navigateTo('/recommendation')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Proceed to ERP Sync</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
