import type { GarageTrendItem } from "../../../api/garageDashboardApi";
import type { PaymentProgressTotals } from "./GaragePaymentProgressCard.type";

export function getBadgeVariant(rate: number, isReceiptTab: boolean = true) {
  if (rate >= 100) {
    return isReceiptTab
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80";
}

export function getProgressColor(rate: number, isReceiptTab: boolean = true) {
  if (isReceiptTab) {
    return rate >= 100
      ? "bg-[#059669] dark:bg-emerald-500"
      : "bg-[#059669]/85 dark:bg-emerald-500/85";
  } else {
    return rate >= 100
      ? "bg-[#ea580c] dark:bg-orange-500"
      : "bg-[#ea580c]/85 dark:bg-orange-500/85";
  }
}

export function formatMonth(m: string) {
  const parts = m.split("-");
  if (parts.length === 2) return `Tháng ${parts[1]}/${parts[0]}`;
  return m;
}

export const trendExtractors = {
  tienCoThue: (item: GarageTrendItem) =>
    item.tienCoThue || item.totalBilled || 0,
  paid: (item: GarageTrendItem) => item.paid || 0,
  receivable: (item: GarageTrendItem) => item.receivable || 0,
  receivableWithInvoice: (item: GarageTrendItem) =>
    item.receivableWithInvoice || 0,
  receivableNoInvoice: (item: GarageTrendItem) => item.receivableNoInvoice || 0,
  cost: (item: GarageTrendItem) => item.cost || 0,
  paidCost: (item: GarageTrendItem) => item.paidCost || 0,
  payableCost: (item: GarageTrendItem) => item.payableCost || 0,
  payableCostWithInvoice: (item: GarageTrendItem) =>
    item.payableCostWithInvoice || 0,
  payableCostNoInvoice: (item: GarageTrendItem) =>
    item.payableCostNoInvoice || 0,
  excludedDebtAmount: (item: GarageTrendItem) => item.excludedDebtAmount || 0,
  excludedDebtCost: (item: GarageTrendItem) => item.excludedDebtCost || 0,
  revenue: (item: GarageTrendItem) => item.revenue || 0,
};

export function calculateTotals(
  items: GarageTrendItem[],
): PaymentProgressTotals {
  return items.reduce(
    (acc: PaymentProgressTotals, item: GarageTrendItem) => ({
      caseCount: acc.caseCount + (item.caseCount || 0),
      revenue: acc.revenue + (item.revenue || 0),
      billed: acc.billed + (item.tienCoThue || item.totalBilled || 0),
      paid: acc.paid + (item.paid || 0),
      receivable: acc.receivable + (item.receivable || 0),
      receivableWithInvoice:
        acc.receivableWithInvoice + (item.receivableWithInvoice || 0),
      receivableNoInvoice:
        acc.receivableNoInvoice + (item.receivableNoInvoice || 0),
      excludedDebtAmount:
        acc.excludedDebtAmount + (item.excludedDebtAmount || 0),
      excludedDebtCaseCount:
        acc.excludedDebtCaseCount + (item.excludedDebtCaseCount || 0),
      cost: acc.cost + (item.cost || 0),
      paidCost: acc.paidCost + (item.paidCost || 0),
      payableCost: acc.payableCost + (item.payableCost || 0),
      payableCostWithInvoice:
        acc.payableCostWithInvoice + (item.payableCostWithInvoice || 0),
      payableCostNoInvoice:
        acc.payableCostNoInvoice + (item.payableCostNoInvoice || 0),
      excludedDebtCost: acc.excludedDebtCost + (item.excludedDebtCost || 0),
    }),
    {
      caseCount: 0,
      revenue: 0,
      billed: 0,
      paid: 0,
      receivable: 0,
      receivableWithInvoice: 0,
      receivableNoInvoice: 0,
      excludedDebtAmount: 0,
      excludedDebtCaseCount: 0,
      cost: 0,
      paidCost: 0,
      payableCost: 0,
      payableCostWithInvoice: 0,
      payableCostNoInvoice: 0,
      excludedDebtCost: 0,
    },
  );
}
