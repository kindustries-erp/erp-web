import type {
  GarageTrendItem,
  MonthlyReceivablesGroupCategorized,
  MonthlyReceivablesGroupItem,
} from "@/modules/garage/api/garageDashboardApi";
import type { DebtRemainingCaseRow } from "./components/DebtRemainingCasesTab.type";

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

export interface CategorizedGroupMap {
  insurance: MonthlyReceivablesGroupCategorized;
  enterprise: MonthlyReceivablesGroupCategorized;
  individual: MonthlyReceivablesGroupCategorized;
}

/** Trích xuất danh sách phiếu còn công nợ từ các nhóm đối tượng */
export function extractUnpaidCases(
  categorized: CategorizedGroupMap,
): DebtRemainingCaseRow[] {
  const list: DebtRemainingCaseRow[] = [];
  const seen = new Set<string>();

  const collectFromGroups = (
    groups: MonthlyReceivablesGroupItem[],
    payerType: "KH" | "BH",
    partnerType: "insurance" | "enterprise" | "individual",
  ) => {
    groups.forEach((g) => {
      if (!g.cases) return;
      g.cases.forEach((c) => {
        const rowKey = `${c.id}_${payerType}_${g.key}`;
        if (seen.has(rowKey)) return;
        seen.add(rowKey);

        list.push({
          rowKey,
          id: c.id,
          soChungTu: c.soChungTu,
          ngayHoanThanh: c.ngayHoanThanh,
          bienSoXe: c.bienSoXe,
          khachHangName: c.khachHangName,
          khachHangCode: c.khachHangCode,
          payerType,
          partnerType,
          debtorName: c.buyerName || g.title,
          invoiceNo: c.invoiceNo,
          vatWarning: c.vatWarning,
          billed: c.amount,
          paid: c.paid,
          remaining: c.remaining,
          cost: c.cost ?? 0,
          paidCost: c.paidCost ?? 0,
          remainingCost: c.remainingCost ?? 0,
        });
      });
    });
  };

  collectFromGroups(categorized.insurance.all, "BH", "insurance");
  collectFromGroups(categorized.enterprise.all, "KH", "enterprise");
  collectFromGroups(categorized.individual.all, "KH", "individual");

  return list;
}

/** Đếm số phiếu còn nợ theo chiều Phải thu hoặc Phải trả */
export function countActiveUnpaidCases(
  cases: DebtRemainingCaseRow[],
  partnerDebtType: "receivables" | "payables",
): number {
  return cases.filter((c) =>
    partnerDebtType === "payables" ? c.remainingCost > 0 : c.remaining > 0,
  ).length;
}

/** Tính toán các chỉ số tổng hợp và tỷ lệ thanh toán của kỳ */
export function calculateDebtMetrics(
  safeItem: GarageTrendItem,
  isReceipt: boolean,
  partnerDebtType: "receivables" | "payables",
  breakdownTotalBilled?: number,
) {
  const totalBilled = safeItem.tienCoThue ?? safeItem.totalBilled ?? 0;
  const totalCost = safeItem.cost ?? 0;
  const collectionRate =
    safeItem.collectionRate ??
    (totalBilled > 0 ? ((safeItem.paid ?? 0) / totalBilled) * 100 : 0);
  const costPaymentRate =
    safeItem.costPaymentRate ??
    (totalCost > 0 ? ((safeItem.paidCost ?? 0) / totalCost) * 100 : 0);
  const mainRate = isReceipt ? collectionRate : costPaymentRate;
  const mainBilled = isReceipt ? totalBilled : totalCost;
  const effectiveBreakdownTotal =
    partnerDebtType === "payables"
      ? totalCost
      : (breakdownTotalBilled ?? mainBilled);

  return {
    totalBilled,
    totalCost,
    collectionRate,
    costPaymentRate,
    mainRate,
    effectiveBreakdownTotal,
  };
}
