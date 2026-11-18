import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

export interface FilterGarageCasesOptions {
  showProfitMetrics?: boolean;
  isPayable: boolean;
  categoryFilter: string;
  search: string;
  isFunnelStatusFilter?: boolean;
}

export function matchFunnelStatus(
  c: GarageCaseDetailRow,
  statusKey: string,
): boolean {
  if (statusKey === "ALL" || statusKey === "all") return true;

  const isCompleted = Boolean(c.ngayHoanThanh && c.tinhTrangDichVu !== 9);
  const isCancelled =
    c.tinhTrangDichVu === 9 ||
    Boolean(c.serviceStatus && c.serviceStatus.toLowerCase().includes("hủy"));

  const isQuotation =
    !c.ngayHoanThanh &&
    !isCancelled &&
    (c.tinhTrangDichVu === 1 ||
      Boolean(
        c.serviceStatus &&
        (c.serviceStatus.toLowerCase().includes("báo giá") ||
          c.serviceStatus.toLowerCase().includes("nháp") ||
          c.serviceStatus.toLowerCase().includes("chờ")),
      ));

  const isInProgress = !c.ngayHoanThanh && !isCancelled && !isQuotation;

  switch (statusKey) {
    case "QUOTATION":
      return isQuotation;
    case "IN_PROGRESS":
      return isInProgress;
    case "COMPLETED":
      return isCompleted;
    case "CANCELLED":
      return isCancelled;
    default:
      return true;
  }
}

export function calculateFunnelStatusCounts(cases: GarageCaseDetailRow[]) {
  let quotation = 0;
  let inProgress = 0;
  let completed = 0;
  let cancelled = 0;

  for (const c of cases) {
    if (matchFunnelStatus(c, "QUOTATION")) quotation++;
    else if (matchFunnelStatus(c, "IN_PROGRESS")) inProgress++;
    else if (matchFunnelStatus(c, "COMPLETED")) completed++;
    else if (matchFunnelStatus(c, "CANCELLED")) cancelled++;
  }

  return {
    total: cases.length,
    quotation,
    inProgress,
    completed,
    cancelled,
  };
}

export function filterGarageCases(
  cases: GarageCaseDetailRow[],
  options: FilterGarageCasesOptions,
) {
  const {
    showProfitMetrics,
    isPayable,
    categoryFilter,
    search,
    isFunnelStatusFilter,
  } = options;

  // Với Debt mode: chỉ lọc các phiếu còn công nợ
  // Với Checkpoint mode: hiển thị tất cả vụ việc trong kỳ
  const baseList = showProfitMetrics
    ? cases
    : cases.filter((c) => (isPayable ? c.remainingCost > 0 : c.remaining > 0));

  const q = search.trim().toLowerCase();

  const filteredCases = baseList.filter((c) => {
    if (isFunnelStatusFilter) {
      if (!matchFunnelStatus(c, categoryFilter)) return false;
    } else if (categoryFilter !== "all" && categoryFilter !== "ALL") {
      if (showProfitMetrics) {
        if ((c.classification || "KHAC") !== categoryFilter) return false;
      } else {
        if (c.partnerType !== categoryFilter) return false;
      }
    }

    if (!q) return true;
    return (
      c.soChungTu?.toLowerCase().includes(q) ||
      c.bienSoXe?.toLowerCase().includes(q) ||
      c.khachHangName?.toLowerCase().includes(q) ||
      c.debtorName?.toLowerCase().includes(q)
    );
  });

  const totalRemaining = filteredCases.reduce(
    (sum, c) => sum + (isPayable ? c.remainingCost : c.remaining),
    0,
  );

  const totalBilled = filteredCases.reduce(
    (sum, c) => sum + (isPayable ? c.cost : c.billed),
    0,
  );

  return { filteredCases, totalRemaining, totalBilled };
}
