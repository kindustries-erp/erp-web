import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGarageMonthReceivablesBreakdown } from "@/modules/garage/hooks/useGarageMonthReceivablesBreakdown";
import { garageDashboardApi } from "@/modules/garage/api/garageDashboardApi";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type { GarageCaseDetailRow } from "./components/GarageCasesTableTab.type";
import { buildMonthClassificationRows } from "../garage-month-detail-drawer/utils/buildMonthClassificationRows";
import type { MonthClassificationRow } from "../garage-month-detail-drawer/components/MonthClassificationTable.type";
import type { GarageCasesScope } from "./GarageCasesDetailDrawer.type";
import { useDebtDetailDrillDown } from "../garage-debt-detail-drawer/GarageDebtDetailDrawer.drillDown.hook";
import {
  EMPTY_CATEGORIZED,
  EMPTY_TREND,
  formatDebtMonth,
  extractDebtCases,
  extractCheckpointCases,
  countActiveUnpaidCases,
  calculateDebtMetrics,
} from "./GarageCasesDetailDrawer.helper";

interface UseGarageCasesDetailDrawerArgs {
  open: boolean;
  scope: GarageCasesScope | null;
  activeTab?: "RECEIPT" | "PAYMENT";
  showProfitMetrics?: boolean;
}

export function useGarageCasesDetailDrawer({
  open,
  scope,
  activeTab = "RECEIPT",
  showProfitMetrics = false,
}: UseGarageCasesDetailDrawerArgs) {
  const isCheckpoint = scope?.kind === "checkpoint";
  const checkpointScope = isCheckpoint ? scope : null;
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

  // 1. Nhánh dữ liệu Checkpoint (Doanh thu / P&L theo khoảng ngày)
  const { data: checkpointData, isLoading: checkpointLoading } = useQuery({
    queryKey: [
      "garage",
      "casesDetailCheckpoint",
      checkpointScope?.dateFrom,
      checkpointScope?.dateTo,
      checkpointScope?.branchId,
    ],
    queryFn: () =>
      garageDashboardApi.getCheckpointCases({
        date_from: checkpointScope!.dateFrom,
        date_to: checkpointScope!.dateTo,
        page: 1,
        pageSize: 500,
      }),
    enabled: Boolean(
      open &&
      isCheckpoint &&
      checkpointScope?.dateFrom &&
      checkpointScope?.dateTo,
    ),
  });

  // 2. Nhánh dữ liệu Công nợ (Tuổi nợ / Tháng)
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
    enabled: Boolean(open && !isCheckpoint && scope),
  });

  const safeItem = useMemo<GarageTrendItem>(() => {
    if (isCheckpoint) {
      const s = checkpointData?.summary;
      return {
        ...EMPTY_TREND,
        tienCoThue: s?.totalTienCoThue || 0,
        paid: s?.totalPaid || 0,
        receivable: s?.totalRemaining || 0,
        collectionRate: s?.collectionRate || 0,
        revenue: s?.totalRevenue || 0,
        cost: s?.totalCost || 0,
        profit: s?.totalProfit || 0,
        caseCount: s?.totalCount || 0,
      };
    }
    return monthScope?.item ?? breakdownTrend ?? EMPTY_TREND;
  }, [isCheckpoint, checkpointData?.summary, monthScope, breakdownTrend]);

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
        ...receivableClassificationRows.map(
          (row: MonthClassificationRow) => row.key,
        ),
        ...payableClassificationRows.map(
          (row: MonthClassificationRow) => row.key,
        ),
      ]).size,
    [receivableClassificationRows, payableClassificationRows],
  );
  const totalPartnerCount =
    safeCategorized.enterprise.all.length +
    safeCategorized.individual.all.length +
    safeCategorized.insurance.all.length;

  const cases = useMemo<GarageCaseDetailRow[]>(() => {
    if (isCheckpoint) {
      return extractCheckpointCases(checkpointData?.items || []);
    }
    return extractDebtCases(safeCategorized);
  }, [isCheckpoint, checkpointData?.items, safeCategorized]);

  const casesCount = useMemo(() => {
    if (isCheckpoint) return cases.length;
    return countActiveUnpaidCases(cases, partnerDebtType);
  }, [isCheckpoint, cases, partnerDebtType]);

  const pnlSummary = useMemo(() => {
    if (!isCheckpoint) return undefined;
    const s = checkpointData?.summary;
    return {
      totalRevenue: s?.totalRevenue || 0,
      totalCost: s?.totalCost || 0,
      totalProfit: s?.totalProfit || 0,
      margin:
        (s?.totalRevenue || 0) > 0
          ? ((s?.totalProfit || 0) / (s?.totalRevenue || 1)) * 100
          : 0,
    };
  }, [isCheckpoint, checkpointData?.summary]);

  const drillDown = useDebtDetailDrillDown();

  const title = useMemo(() => {
    if (isCheckpoint) {
      return checkpointScope?.periodLabel
        ? `Vụ việc Dịch vụ Garage · ${checkpointScope.periodLabel}`
        : "Vụ việc Dịch vụ Garage";
    }
    if (monthScope) {
      return formatDebtMonth(safeItem.label);
    }
    return breakdown?.monthLabel || "Chi tiết mốc tuổi nợ";
  }, [
    isCheckpoint,
    checkpointScope,
    monthScope,
    safeItem.label,
    breakdown?.monthLabel,
  ]);

  return {
    title,
    isReceipt,
    currentTab,
    mainRate: isCheckpoint
      ? checkpointData?.summary?.collectionRate || 0
      : mainRate,
    partnerDebtType,
    setPartnerDebtType,
    safeItem,
    pnlSummary,
    checkpointSummary: checkpointData?.summary,
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
    cases,
    casesCount,
    isLoading: isCheckpoint ? checkpointLoading : false,
    ...drillDown,
    horizon: horizonScope?.horizon,
    branchId: horizonScope?.branchId || checkpointScope?.branchId,
    dateFrom: checkpointScope?.dateFrom || horizonScope?.dateFrom,
    dateTo: checkpointScope?.dateTo || horizonScope?.dateTo,
    isCheckpoint,
    showProfitMetrics,
  };
}
