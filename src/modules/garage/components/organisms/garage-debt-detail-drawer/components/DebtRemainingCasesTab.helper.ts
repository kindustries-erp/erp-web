import type {
  DebtRemainingCaseRow,
  PartnerDebtCategory,
} from "./DebtRemainingCasesTab.type";

export function filterDebtRemainingCases(
  cases: DebtRemainingCaseRow[],
  isPayable: boolean,
  partnerFilter: PartnerDebtCategory,
  search: string,
) {
  const debtActiveCases = cases.filter((c) =>
    isPayable ? c.remainingCost > 0 : c.remaining > 0,
  );

  const counts = {
    all: debtActiveCases.length,
    enterprise: debtActiveCases.filter((c) => c.partnerType === "enterprise")
      .length,
    individual: debtActiveCases.filter((c) => c.partnerType === "individual")
      .length,
    insurance: debtActiveCases.filter((c) => c.partnerType === "insurance")
      .length,
  };

  const q = search.trim().toLowerCase();
  const filteredCases = debtActiveCases.filter((c) => {
    if (partnerFilter !== "all" && c.partnerType !== partnerFilter)
      return false;
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

  return { counts, filteredCases, totalRemaining };
}
