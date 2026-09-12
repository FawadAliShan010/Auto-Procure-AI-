export type RoutePath =
  | '/login'
  | '/dashboard'
  | '/submit'
  | '/processing'
  | '/analysis'
  | '/decision'
  | '/recommendation'
  | '/requests'
  | '/analytics'
  | '/settings';

export type UserRole =
  | 'Procurement Director'
  | 'Procurement Team'
  | 'Department Requisitioner'
  | 'Operations Lead';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export type Department =
  | 'IT / Technology'
  | 'Maintenance'
  | 'HR'
  | 'Operations'
  | 'Facilities & Safety'
  | 'Production Plant'
  | 'Engineering'
  | 'Marketing';

export type GateStatus = 'PASSED' | 'WARNING' | 'FAILED' | 'FOUND' | 'HIGH' | 'OPTIMAL';

export type DecisionType = 'APPROVE' | 'PROCEED' | 'REDUCE' | 'HOLD' | 'INVESTIGATE' | 'EXPEDITE' | 'REJECT' | 'REJECTED';

export type PRStatus = 'DRAFT' | 'PENDING_VALIDATION' | 'APPROVED' | 'REDUCE' | 'ON_HOLD' | 'INVESTIGATE' | 'EXPEDITED' | 'REJECTED';

export interface Gate1Result {
  originalInput: string;
  standardized: string;
  matchedItemCode: string;
  category: string;
  glCode: string;
  confidenceScore: number;
  typosCorrected: string[];
}

export interface Gate2Result {
  estimatedCost: number;
  availableBudget: number;
  status: 'Passed' | 'Warning' | 'Failed';
  variance: number; // positive if exceeded, 0 if within budget
  remainingBudget: number; // budget left after deduction, or 0 if exceeded
  message: string;
}

export interface SisterSiteStock {
  siteId: string;
  siteName: string;
  quantity: number;
  status: 'excess/project-canceled' | 'idle' | 'reserve';
}

export interface WarehouseInventory {
  warehouseId: string;
  name: string; // 'Warehouse A' | 'Warehouse B' | 'Warehouse C'
  quantity: number;
  location: string;
  stockStatus: 'In Stock' | 'Excess / Idle' | 'Reserved' | 'Out of Stock';
  isLocal?: boolean;
}

export interface Gate3Result {
  localWarehouseName: string;
  localAvailable: number;
  otherSites: SisterSiteStock[];
  warehouses: WarehouseInventory[];
  totalSisterStock: number;
  status: 'Found' | 'Not Found' | 'Partial';
  recommendedTransferQuantity: number;
  transferRecommendation: string;
}

export interface Gate4Result {
  avgMonthlyUsage: number;
  requestedQuantity: number;
  monthsOfSupply: number;
  recommendedQuantity: number;
  status: 'Optimal' | 'High' | 'Low';
  usageFlagMessage: string;
  preceding90Days: Array<{
    month: string;
    usage: number;
  }>;
}

export interface AIDecisionResult {
  decision: DecisionType;
  headline: string;
  reasoning: string[];
  recommendedActions: Array<{
    type: 'transfer' | 'purchase' | 'review' | 'budget_override' | 'cancel' | 'clarification';
    text: string;
    quantity?: number;
    site?: string;
  }>;
  estimatedSavings: number;
  purchaseQuantity: number;
  transferQuantity: number;
}

export interface PurchaseRequest {
  id: string;
  employeeName: string;
  department: Department;
  itemDescription: string;
  quantity: number;
  estimatedPrice: number;
  requiredDate: string;
  additionalNotes?: string;
  createdAt: string;
  status: PRStatus;
  
  // Analysis results (populated once checked)
  gate1?: Gate1Result;
  gate2?: Gate2Result;
  gate3?: Gate3Result;
  gate4?: Gate4Result;
  decisionResult?: AIDecisionResult;

  erpSynced?: boolean;
  erpRefId?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface GeminiStandardizationOutput {
  standardizedDescription: string;
  category: string;
  suggestedItemCode: string;
  glCode: string;
  corrections: string[];
  confidence: number;
  source?: 'gemini-live' | 'deterministic-fallback' | 'deterministic-mock' | 'gemini-simulated';
}

export interface GeminiReasoningOutput {
  executiveHeadline: string;
  anomalyExplanation: string;
  humanReadableReasoning: string[];
  actionableGuidance?: string;
  source?: string;
}

export interface AITestSuiteResult {
  status: 'PASSED' | 'PASSED_WITH_FALLBACK';
  testName: string;
  description?: string;
  input?: any;
  response?: any;
  validation?: { isValid: boolean; errors: string[] };
  source?: string;
  note?: string;
  simulatedMalformedInput?: any;
  validationCaughtErrors?: string[];
  didCrash?: boolean;
  gracefulFallbackApplied?: boolean;
  recoveredResponse?: any;
  simulatedCondition?: string;
  fallbackEngaged?: boolean;
  fallbackResponse?: any;
  confidenceScore?: number;
  triggersInvestigateGate?: boolean;
  gateAction?: string;
}
