import type { TFunction } from "i18next";
import type {
  GarageCaseDetailRow,
  FunnelStageCounts,
} from "./GarageCasesTableTab.type";
import { normalizeClassificationKey } from "./GarageCasesTableTab.cells";
import { countDistinctVehicles } from "./GarageCasesTableTab.helper";

export interface BuildFilterTabsOptions {
  isFunnelMode: boolean;
  showProfitMetrics?: boolean;
  cases: GarageCaseDetailRow[];
  t: TFunction;
  funnelCounts?: FunnelStageCounts;
  funnelStatusCounts: FunnelStageCounts;
}

export function buildGarageCaseFilterTabs({
  isFunnelMode,
  showProfitMetrics,
  cases,
  t,
  funnelCounts,
  funnelStatusCounts,
}: BuildFilterTabsOptions) {
  if (isFunnelMode) {
    return [
      {
        key: "ALL",
        label: t("dashboard.funnel.colIntake", "Tổng tiếp nhận"),
        badgeCount: funnelCounts?.total ?? funnelStatusCounts.total,
      },
      {
        key: "QUOTATION",
        label: t("dashboard.funnel.colQuotation", "Báo giá"),
        badgeCount: funnelCounts?.quotation ?? funnelStatusCounts.quotation,
      },
      {
        key: "IN_PROGRESS",
        label: t("dashboard.funnel.colInProgress", "Đang làm (Dự thu)"),
        badgeCount: funnelCounts?.inProgress ?? funnelStatusCounts.inProgress,
      },
      {
        key: "COMPLETED",
        label: t("dashboard.funnel.colCompleted", "Hoàn thành (Doanh thu)"),
        badgeCount: funnelCounts?.completed ?? funnelStatusCounts.completed,
      },
      {
        key: "CANCELLED",
        label: t("dashboard.funnel.colCancelled", "Đã hủy"),
        badgeCount: funnelCounts?.cancelled ?? funnelStatusCounts.cancelled,
      },
    ];
  }

  if (showProfitMetrics) {
    const getCount = (key: string) =>
      key === "ALL"
        ? countDistinctVehicles(cases)
        : countDistinctVehicles(
            cases.filter(
              (c) => normalizeClassificationKey(c.classification) === key,
            ),
          );

    return [
      {
        key: "ALL",
        label: t("cases.classification.all", "Tất cả"),
        badgeCount: getCount("ALL"),
      },
      {
        key: "SUA_CHUA_CHUNG",
        label: t("cases.classification.repair", "Sửa chữa chung"),
        badgeCount: getCount("SUA_CHUA_CHUNG"),
      },
      {
        key: "KY_GUI_NOI_BO",
        label: t("cases.classification.consignment", "Ký gửi / Nội bộ"),
        badgeCount: getCount("KY_GUI_NOI_BO"),
      },
      {
        key: "OJ_NGOAI",
        label: t("cases.classification.outsource", "OJ Ngoài"),
        badgeCount: getCount("OJ_NGOAI"),
      },
      {
        key: "KHAC",
        label: t("cases.classification.other", "Khác"),
        badgeCount: getCount("KHAC"),
      },
    ];
  }

  const debtCases = cases.filter((c) => c.remaining > 0);
  return [
    {
      key: "all",
      label: t("progress.partnerFilterTabs.all", "Tất cả"),
      badgeCount: debtCases.length,
    },
    {
      key: "enterprise",
      label: t("progress.partnerFilterTabs.enterprise", "Doanh nghiệp"),
      badgeCount: debtCases.filter((c) => c.partnerType === "enterprise")
        .length,
    },
    {
      key: "individual",
      label: t("progress.partnerFilterTabs.individual", "Cá nhân"),
      badgeCount: debtCases.filter((c) => c.partnerType === "individual")
        .length,
    },
    {
      key: "insurance",
      label: t("progress.partnerFilterTabs.insurance", "Bảo hiểm"),
      badgeCount: debtCases.filter((c) => c.partnerType === "insurance").length,
    },
  ];
}
