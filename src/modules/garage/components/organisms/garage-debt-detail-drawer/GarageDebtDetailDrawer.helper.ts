import type {
  GarageTrendItem,
  MonthlyReceivablesGroupCategorized,
} from "@/modules/garage/api/garageDashboardApi";

export const EMPTY_CATEGORIZED: MonthlyReceivablesGroupCategorized = {
  all: [],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: { billed: 0, paid: 0, remaining: 0, caseCount: 0, partnerCount: 0 },
};

export const EMPTY_TREND: GarageTrendItem = {
  label: "",
  tienCoThue: 0,
  paid: 0,
  receivable: 0,
  collectionRate: 0,
  cost: 0,
  paidCost: 0,
  payableCost: 0,
  costPaymentRate: 0,
  caseCount: 0,
  revenue: 0,
  profit: 0,
  margin: 0,
  collectionRateDiff: 0,
  costPaymentRateDiff: 0,
};

/** "2026-10" → "Tháng 10/2026" */
export function formatDebtMonth(m?: string): string {
  if (!m) return "";
  const parts = m.split("-");
  if (parts.length === 2) return `Tháng ${parts[1]}/${parts[0]}`;
  return m;
}
