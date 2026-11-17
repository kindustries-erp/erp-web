import { useEffect, useMemo, useState } from "react";
import { useGarageMonthReceivablesBreakdown } from "@/modules/garage/hooks/useGarageMonthReceivablesBreakdown";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type { DebtRemainingCaseRow } from "./components/DebtRemainingCasesTab.type";
import { buildMonthClassificationRows } from "../garage-month-detail-drawer/utils/buildMonthClassificationRows";
import type { DebtDetailScope } from "./GarageDebtDetailDrawer.type";
import { useDebtDetailDrillDown } from "./GarageDebtDetailDrawer.drillDown.hook";
import {
  EMPTY_CATEGORIZED,
  EMPTY_TREND,
  formatDebtMonth,
  extractUnpaidCases,
  countActiveUnpaidCases,
  calculateDebtMetrics,
} from "./GarageDebtDetailDrawer.helper";

interface UseGarageDebtDetailDrawerArgs {
  open: boolean;
  scope: DebtDetailScope | null;
  activeTab: "RECEIPT" | "PAYMENT";
}

/**
 * Dữ liệu và trạng thái của drawer công nợ dùng chung cho hai scope:
 * - tháng: dữ liệu lấy từ dòng xu hướng đã chọn;
 * - mốc tuổi nợ: dữ liệu lấy từ breakdown theo mốc.
 */
export function useGarageDebtDetailDrawer({
  open,
  scope,
  activeTab,
}: UseGarageDebtDetailDrawerArgs) {
  const monthScope = scope?.kind === "month" ? scope : null;
  const horizonScope = scope?.kind === "horizon" ? scope : null;

  const [currentTab, setCurrentTab] = useState<"RECEIPT" | "PAYMENT">(
    activeTab,
  );
  const [partnerDebtType, setPartnerDebtType] = useState<
    "receivables" | "payables"
  >(activeTab === "PAYMENT" ? "payables" : "receivables");

  useEffect(() => {
    setCurrentTab(activeTab);
    setPartnerDebtType(activeTab === "PAYMENT" ? "payables" : "receivables");
  }, [activeTab]);

  const isReceipt = currentTab === "RECEIPT";

  const {
    breakdown,
    trendItem: breakdownTrend,
    summary: breakdownSummary,
    insuranceCategorized,
    enterpriseCategorized,
    individualCategorized,
    warning: vatWarningInfo,
  } = useGarageMonthReceivablesBreakdown({
    month: monthScope?.item.label,
    horizon: horizonScope?.horizon,
    branchId: horizonScope?.branchId,
    dateFrom: horizonScope?.dateFrom,
    dateTo: horizonScope?.dateTo,
    enabled: Boolean(open && scope),
  });

  const safeItem = useMemo<GarageTrendItem>(
    () => monthScope?.item ?? breakdownTrend ?? EMPTY_TREND,
    [monthScope, breakdownTrend],
  );

  const safeCategorized = useMemo(
    () => ({
      insurance: insuranceCategorized ?? EMPTY_CATEGORIZED,
      enterprise: enterpriseCategorized ?? EMPTY_CATEGORIZED,
      individual: individualCategorized ?? EMPTY_CATEGORIZED,
    }),
    [insuranceCategorized, enterpriseCategorized, individualCategorized],
  );

  const { totalBilled, totalCost, mainRate, effectiveBreakdownTotal } = useMemo(
    () =>
      calculateDebtMetrics(
        safeItem,
        isReceipt,
        partnerDebtType,
        breakdownSummary?.totalBilled,
      ),
    [safeItem, isReceipt, partnerDebtType, breakdownSummary?.totalBilled],
  );

  const receivableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeItem, "receivables"),
    [safeItem],
  );
  const payableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeItem, "payables"),
    [safeItem],
  );
  const classificationCount = useMemo(
    () =>
      new Set([
        ...receivableClassificationRows.map((row) => row.key),
        ...payableClassificationRows.map((row) => row.key),
      ]).size,
    [receivableClassificationRows, payableClassificationRows],
  );
  const totalPartnerCount =
    safeCategorized.enterprise.all.length +
    safeCategorized.individual.all.length +
    safeCategorized.insurance.all.length;

  const unpaidCases = useMemo<DebtRemainingCaseRow[]>(
    () => extractUnpaidCases(safeCategorized),
    [safeCategorized],
  );

  const unpaidCasesCount = useMemo(
    () => countActiveUnpaidCases(unpaidCases, partnerDebtType),
    [unpaidCases, partnerDebtType],
  );

  const drillDown = useDebtDetailDrillDown();

  const title = monthScope
    ? formatDebtMonth(safeItem.label)
    : breakdown?.monthLabel || "Chi tiết mốc tuổi nợ";

  return {
    title,
    isReceipt,
    currentTab,
    mainRate,
    partnerDebtType,
    setPartnerDebtType,
    safeItem,
    breakdownSummary,
    vatWarningInfo,
    safeCategorized,
    totalBilled,
    totalCost,
    effectiveBreakdownTotal,
    receivableClassificationRows,
    payableClassificationRows,
    classificationCount,
    totalPartnerCount,
    unpaidCases,
    unpaidCasesCount,
    ...drillDown,
    horizon: horizonScope?.horizon,
    branchId: horizonScope?.branchId,
  };
}
