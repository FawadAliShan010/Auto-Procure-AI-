import {
  PurchaseRequest,
  Gate1Result,
  Gate2Result,
  Gate3Result,
  Gate4Result,
  AIDecisionResult,
  DecisionType,
} from '../types/procurement';
import {
  ITEM_MASTER_CATALOG,
  DEPARTMENT_BUDGETS,
  MasterCatalogItem,
} from '../data/mockProcurementData';
import { evaluateProcurementDecision } from './decisionEngine';

export function analyzePurchaseRequest(input: Partial<PurchaseRequest>): {
  gate1: Gate1Result;
  gate2: Gate2Result;
  gate3: Gate3Result;
  gate4: Gate4Result;
  decisionResult: AIDecisionResult;
} {
  const rawText = (input.itemDescription || '').trim();
  const quantity = Math.max(1, Number(input.quantity) || 1);
  const dept = input.department || 'IT / Technology';
  const unitPrice = Math.max(1, Number(input.estimatedPrice) || 25);
  const totalCost = quantity * unitPrice;

  // 1. GATE 1: AI Cleaning & Standardization
  let matchedItem: MasterCatalogItem = ITEM_MASTER_CATALOG[0];
  const typosFound: string[] = [];

  const lower = rawText.toLowerCase();
  if (lower.includes('helm') || lower.includes('saftey') || lower.includes('safety')) {
    matchedItem = ITEM_MASTER_CATALOG[1]; // Helmet
    if (lower.includes('saftey')) typosFound.push('Typo: "saftey" corrected to "Safety"');
    if (lower.includes('helms')) typosFound.push('Informal: "helms" standardized to "Safety Helmet"');
    if (lower.includes('refit')) typosFound.push('Project context tagged: Site Refit Project');
  } else if (lower.includes('pip') || lower.includes('steele') || lower.includes('steel') || lower.includes('3in')) {
    matchedItem = ITEM_MASTER_CATALOG[2]; // Pipe
    if (lower.includes('steele')) typosFound.push('Typo: "steele" corrected to "steel"');
    if (lower.includes('pip')) typosFound.push('Truncation: "pip" expanded to "pipe"');
    if (lower.includes('3in')) typosFound.push('Specification: "3in" expanded to "3-inch carbon-steel pipe"');
    if (lower.includes('50 count') || lower.includes('count')) typosFound.push('Unit extraction: extracted numeric quantity');
  } else if (lower.includes('chair') || lower.includes('ergo') || lower.includes('desk')) {
    matchedItem = ITEM_MASTER_CATALOG[3]; // Chair
    typosFound.push('Standardized to ergonomic master catalog specification');
  } else {
    // Default / Charger
    matchedItem = ITEM_MASTER_CATALOG[0];
    if (lower.includes('65w') && !lower.includes('usb-c')) {
      typosFound.push('Added missing interface protocol: "USB-C Type"');
    }
  }

  const gate1: Gate1Result = {
    originalInput: rawText || 'Unspecified Item',
    standardized: matchedItem.officialTitle,
    matchedItemCode: matchedItem.sku.replace('#', ''),
    category: matchedItem.category,
    glCode: `${matchedItem.glCode} • ${matchedItem.glName}`,
    confidenceScore: 0.98,
    typosCorrected: typosFound.length > 0 ? typosFound : ['Casing and terminology standardized against item master'],
  };

  // 2. GATE 2: Budget Check
  const availableBudget = DEPARTMENT_BUDGETS[dept] ?? 1000;
  const variance = totalCost - availableBudget;
  const remainingBudget = Math.max(0, availableBudget - totalCost);
  let gate2Status: 'Passed' | 'Warning' | 'Failed' = 'Passed';
  let gate2Message = 'Within approved department ceiling';

  if (variance > 0) {
    if (variance > availableBudget * 1.5) {
      gate2Status = 'Failed';
      gate2Message = `Budget exceeded by $${variance.toLocaleString()} (Available: $${availableBudget.toLocaleString()})`;
    } else {
      gate2Status = 'Warning';
      gate2Message = `Budget exceeded by $${variance.toLocaleString()} ($${totalCost.toLocaleString()} cost vs $${availableBudget.toLocaleString()} available)`;
    }
  }

  const gate2: Gate2Result = {
    estimatedCost: totalCost,
    availableBudget,
    status: gate2Status,
    variance: Math.max(0, variance),
    remainingBudget,
    message: gate2Message,
  };

  // 3. GATE 3: Inventory / Warehouse Search
  const warehousesList = matchedItem.warehouses || [
    { warehouseId: 'WH-A', name: 'Warehouse A', quantity: matchedItem.localWarehouseStock, location: 'Local Depot Yard', stockStatus: matchedItem.localWarehouseStock > 0 ? 'In Stock' : 'Out of Stock', isLocal: true },
    { warehouseId: 'WH-B', name: 'Warehouse B', quantity: matchedItem.sisterSiteStock[0]?.quantity ?? 0, location: 'Logistics Depot North', stockStatus: 'Excess / Idle', isLocal: false },
    { warehouseId: 'WH-C', name: 'Warehouse C', quantity: matchedItem.sisterSiteStock[1]?.quantity ?? 0, location: 'Central Distribution Yard', stockStatus: 'Reserved', isLocal: false },
  ];

  const otherSitesStock = matchedItem.sisterSiteStock;
  const totalSisterStock = otherSitesStock.reduce((acc, s) => acc + s.quantity, 0);
  const localStock = matchedItem.localWarehouseStock;
  const totalAvailableAcrossWarehouses = warehousesList.reduce((sum, w) => sum + (w.stockStatus !== 'Reserved' ? w.quantity : 0), 0);

  let gate3Status: 'Found' | 'Not Found' | 'Partial' = 'Not Found';
  let recommendedTransferQuantity = 0;

  if (totalSisterStock > 0 || totalAvailableAcrossWarehouses > 0) {
    gate3Status = 'Found';
    recommendedTransferQuantity = Math.min(quantity, totalSisterStock);
  }

  const transferSource = warehousesList.find(w => !w.isLocal && (w.stockStatus === 'Excess / Idle' || w.quantity > 0));
  const transferRecommendation = recommendedTransferQuantity > 0
    ? `Transfer ${recommendedTransferQuantity} units from ${transferSource?.name || 'Warehouse B'} (${transferSource?.location || 'Regional Depot'}) to satisfy request without external PO expenditure.`
    : 'No internal idle inventory available for inter-warehouse transfer. Standard external PO recommended.';

  const gate3: Gate3Result = {
    localWarehouseName: 'Warehouse A',
    localAvailable: localStock,
    otherSites: otherSitesStock,
    warehouses: warehousesList,
    totalSisterStock,
    status: gate3Status,
    recommendedTransferQuantity,
    transferRecommendation,
  };

  // 4. GATE 4: Usage Analysis (Preceding 90-Day Baseline)
  const avgMonthlyUsage = matchedItem.avgMonthlyConsumption;
  const monthsOfSupply = Number((quantity / Math.max(1, avgMonthlyUsage)).toFixed(1));
  let gate4Status: 'Optimal' | 'High' | 'Low' = 'Optimal';
  let usageMsg = `Normal run-rate (~${monthsOfSupply} months of supply)`;

  if (monthsOfSupply >= 3) {
    gate4Status = 'High';
    usageMsg = `Requested quantity covers ${monthsOfSupply} months of supply based on 90-day average usage (${avgMonthlyUsage} units/mo)`;
  } else if (monthsOfSupply < 0.5) {
    gate4Status = 'Low';
    usageMsg = 'Below typical minimum maintenance safety buffer';
  }

  // Recommended external quantity is requested quantity minus any transferred idle units, capped to healthy buffer
  const recommendedQuantity = Math.max(0, quantity - recommendedTransferQuantity);

  const gate4: Gate4Result = {
    avgMonthlyUsage,
    requestedQuantity: quantity,
    monthsOfSupply,
    recommendedQuantity: recommendedQuantity === 0 && recommendedTransferQuantity > 0 ? 0 : (recommendedQuantity || Math.min(quantity, Math.ceil(avgMonthlyUsage * 2))),
    status: gate4Status,
    usageFlagMessage: usageMsg,
    preceding90Days: matchedItem.preceding90Days || [
      { month: 'Jun', usage: Math.round(avgMonthlyUsage * 1.1) },
      { month: 'Jul', usage: Math.round(avgMonthlyUsage * 0.9) },
      { month: 'Aug', usage: Math.round(avgMonthlyUsage * 1.0) },
    ],
  };

  // 5. DECISION SYNTHESIS & RECOMMENDATION
  // Uses the central deterministic procurement decision engine
  const engineResult = evaluateProcurementDecision({
    standardizedItem: gate1.standardized,
    itemCode: gate1.matchedItemCode,
    itemMatchingConfidence: gate1.confidenceScore,
    quantity,
    unitPrice,
    department: dept,
    availableBudget,
    otherSiteInventory: warehousesList
      .filter((w) => !w.isLocal)
      .map((w) => ({
        siteId: w.warehouseId,
        siteName: w.name,
        quantity: w.quantity,
        status: w.stockStatus === 'Excess / Idle' ? 'excess/project-canceled' : (w.stockStatus === 'In Stock' ? 'in-stock' : 'reserve'),
      })),
    historicalUsage: gate4.preceding90Days,
    urgency: (input as any).urgency || 'normal',
    localInventory: gate3.localAvailable,
  });

  const decisionResult: AIDecisionResult = {
    decision: engineResult.decision,
    headline: engineResult.headline,
    reasoning: engineResult.reasoning,
    recommendedActions: engineResult.recommendedActions as any,
    estimatedSavings: engineResult.calculations.estimatedSavings,
    purchaseQuantity: engineResult.calculations.recommendedQuantity,
    transferQuantity: engineResult.calculations.inventoryTransferQuantity,
  };

  return { gate1, gate2, gate3, gate4, decisionResult };
}
