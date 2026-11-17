import type {
  MonthlyReceivablesCaseItem,
  MonthlyReceivablesGroupCategorized,
  MonthlyReceivablesGroupItem,
} from "@/modules/garage/api/garageDashboardApi";

export type PartnerTypeFilter =
  | "all"
  | "enterprise"
  | "individual"
  | "insurance";

export interface ActivePartnerSectionConfig {
  title: string;
  categorized: MonthlyReceivablesGroupCategorized;
  tableIdPrefix: string;
  isAllTab: boolean;
}

/** Gom toàn bộ đối tượng về 1 nhóm tổng hợp khi ở tab "all" */
export function buildCombinedCategorized(
  enterprise: MonthlyReceivablesGroupCategorized,
  individual: MonthlyReceivablesGroupCategorized,
  insurance: MonthlyReceivablesGroupCategorized,
): MonthlyReceivablesGroupCategorized {
  const allGroups = [...insurance.all, ...enterprise.all, ...individual.all];
  return {
    all: allGroups,
    withInvoice: allGroups.filter((i) => i.hasInvoice),
    pendingInvoice: allGroups.filter((i) => i.vatWarning),
    noInvoice: allGroups.filter((i) => !i.hasInvoice && !i.vatWarning),
    totals: {
      billed:
        enterprise.totals.billed +
        individual.totals.billed +
        insurance.totals.billed,
      paid:
        enterprise.totals.paid + individual.totals.paid + insurance.totals.paid,
      remaining:
        enterprise.totals.remaining +
        individual.totals.remaining +
        insurance.totals.remaining,
      cost:
        (enterprise.totals.cost ?? 0) +
        (individual.totals.cost ?? 0) +
        (insurance.totals.cost ?? 0),
      paidCost:
        (enterprise.totals.paidCost ?? 0) +
        (individual.totals.paidCost ?? 0) +
        (insurance.totals.paidCost ?? 0),
      remainingCost:
        (enterprise.totals.remainingCost ?? 0) +
        (individual.totals.remainingCost ?? 0) +
        (insurance.totals.remainingCost ?? 0),
      caseCount:
        enterprise.totals.caseCount +
        individual.totals.caseCount +
        insurance.totals.caseCount,
      partnerCount:
        enterprise.totals.partnerCount +
        individual.totals.partnerCount +
        insurance.totals.partnerCount,
    },
  };
}

/** Xây dựng cấu hình section dựa vào filter loại đối tượng */
export function getActivePartnerSectionConfig(
  partnerTypeFilter: PartnerTypeFilter,
  isPayableBreakdown: boolean,
  enterprise: MonthlyReceivablesGroupCategorized,
  individual: MonthlyReceivablesGroupCategorized,
  insurance: MonthlyReceivablesGroupCategorized,
  allCombinedCategorized: MonthlyReceivablesGroupCategorized,
  t: (key: string, fallback: string) => string,
): ActivePartnerSectionConfig {
  switch (partnerTypeFilter) {
    case "enterprise":
      return {
        title: isPayableBreakdown
          ? t(
              "progress.sections.enterprisePayment",
              "Chi Khách hàng Doanh nghiệp",
            )
          : t(
              "progress.sections.enterpriseCollection",
              "Thu Khách hàng Doanh nghiệp",
            ),
        categorized: enterprise,
        tableIdPrefix: "garage-debt-detail-enterprise",
        isAllTab: false,
      };
    case "individual":
      return {
        title: isPayableBreakdown
          ? t("progress.sections.individualPayment", "Chi Khách hàng Cá nhân")
          : t(
              "progress.sections.individualCollection",
              "Thu Khách hàng Cá nhân",
            ),
        categorized: individual,
        tableIdPrefix: "garage-debt-detail-individual",
        isAllTab: false,
      };
    case "insurance":
      return {
        title: isPayableBreakdown
          ? t("progress.sections.insurancePayment", "Chi bảo hiểm")
          : t("progress.sections.insuranceCollection", "Thu bảo hiểm"),
        categorized: insurance,
        tableIdPrefix: "garage-debt-detail-insurance",
        isAllTab: false,
      };
    case "all":
    default:
      return {
        title: isPayableBreakdown
          ? t("progress.sections.allPayment", "Chi tất cả đối tượng")
          : t("progress.sections.allCollection", "Thu tất cả đối tượng"),
        categorized: allCombinedCategorized,
        tableIdPrefix: "garage-debt-detail-all-partners",
        isAllTab: true,
      };
  }
}

/** Lọc các nhóm đối tượng theo từ khóa tìm kiếm (tên, MST, số phiếu, biển số xe) */
export function filterPartnerCategorized(
  categorized: MonthlyReceivablesGroupCategorized,
  search: string,
): MonthlyReceivablesGroupCategorized {
  const q = search.trim().toLowerCase();
  if (!q) return categorized;

  const matchesGroup = (g: MonthlyReceivablesGroupItem) => {
    if (g.title?.toLowerCase().includes(q)) return true;
    if (g.taxCode?.toLowerCase().includes(q)) return true;
    if (g.buyerName?.toLowerCase().includes(q)) return true;
    if (
      g.cases?.some(
        (c: MonthlyReceivablesCaseItem) =>
          c.soChungTu?.toLowerCase().includes(q) ||
          c.bienSoXe?.toLowerCase().includes(q) ||
          c.khachHangName?.toLowerCase().includes(q),
      )
    ) {
      return true;
    }
    return false;
  };

  const filteredAll = categorized.all.filter(matchesGroup);
  return {
    ...categorized,
    all: filteredAll,
    withInvoice: categorized.withInvoice.filter(matchesGroup),
    pendingInvoice: categorized.pendingInvoice.filter(matchesGroup),
    noInvoice: categorized.noInvoice.filter(matchesGroup),
    totals: {
      ...categorized.totals,
      partnerCount: filteredAll.length,
      caseCount: filteredAll.reduce(
        (sum, g) => sum + (g.caseCount || g.cases?.length || 0),
        0,
      ),
    },
  };
}
