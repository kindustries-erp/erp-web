import type {
  GarageTrendItem,
  MonthlyReceivablesGroupCategorized,
  MonthlyReceivablesGroupItem,
  GarageCheckpointCaseItem,
} from "@/modules/garage/api/garageDashboardApi";
import type { GarageCaseDetailRow } from "./components/GarageCasesTableTab.type";

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

/** Nhãn "N xe · M lệnh"; đơn vị truyền vào từ i18n. */
export function formatVehiclesAndCases(
  vehicles: number,
  cases: number,
  units: { vehicles: string; cases: string },
): string {
  return `${vehicles} ${units.vehicles} · ${cases} ${units.cases}`;
}

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

/** Trích xuất danh sách phiếu từ các nhóm đối tượng (chế độ công nợ/tuổi nợ) */
export function extractDebtCases(
  categorized: CategorizedGroupMap,
): GarageCaseDetailRow[] {
  const list: GarageCaseDetailRow[] = [];
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

/** Chuyển đổi danh sách vụ việc từ endpoint checkpoint-cases sang GarageCaseDetailRow */
export function extractCheckpointCases(
  items: GarageCheckpointCaseItem[],
): GarageCaseDetailRow[] {
  return items.map((c) => ({
    rowKey: `${c.id}_${c.soChungTu}`,
    id: c.id,
    soChungTu: c.soChungTu,
    ngayHoanThanh: c.ngayHoanThanhCongViec,
    bienSoXe: c.bienSoXe,
    khachHangName: c.khachHangName,
    khachHangCode: c.khachHangCode,
    payerType: "KH",
    partnerType: "enterprise",
    debtorName: c.khachHangName,
    invoiceNo: c.hasInvoice ? "Đã xuất" : undefined,
    vatWarning: !c.hasInvoice && (c.tienCoThue || 0) > (c.doanhThu || 0),
    billed: c.tienCoThue || c.doanhThu || 0,
    paid: c.tienDaThanhToan || 0,
    remaining: c.tienConPhaiThanhToan || 0,
    cost: c.chiPhi || 0,
    paidCost: 0,
    remainingCost: c.chiPhi || 0,
    revenue: c.doanhThu || 0,
    profit: c.loiNhuan || 0,
    classification: c.classification,
    tinhTrangDichVu: c.tinhTrangDichVu,
    serviceStatus: c.tenTinhTrangDichVu,
  }));
}

/** Đếm số phiếu còn nợ */
export function countActiveUnpaidCases(
  cases: GarageCaseDetailRow[],
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
