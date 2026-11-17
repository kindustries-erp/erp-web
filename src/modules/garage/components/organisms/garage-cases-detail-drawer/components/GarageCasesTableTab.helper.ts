import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

export interface FilterGarageCasesOptions {
  showProfitMetrics?: boolean;
  isPayable: boolean;
  categoryFilter: string;
  search: string;
}

export function filterGarageCases(
  cases: GarageCaseDetailRow[],
  options: FilterGarageCasesOptions,
) {
  const { showProfitMetrics, isPayable, categoryFilter, search } = options;

  // Với Debt mode: chỉ lọc các phiếu còn công nợ
  // Với Checkpoint mode: hiển thị tất cả vụ việc trong kỳ
  const baseList = showProfitMetrics
    ? cases
    : cases.filter((c) => (isPayable ? c.remainingCost > 0 : c.remaining > 0));

  const q = search.trim().toLowerCase();

  const filteredCases = baseList.filter((c) => {
    if (categoryFilter !== "all" && categoryFilter !== "ALL") {
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
