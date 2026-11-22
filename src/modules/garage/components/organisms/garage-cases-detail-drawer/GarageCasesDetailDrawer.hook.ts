import { useMemo } from "react";
import { useGarageMonthReceivablesBreakdown } from "@/modules/garage/hooks/useGarageMonthReceivablesBreakdown";
import { useCheckpointVehiclesQuery } from "./GarageCasesDetailDrawer.checkpoint.hook";
import { countDistinctVehicles } from "./components/GarageCasesTableTab.helper";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type { GarageCaseDetailRow } from "./components/GarageCasesTableTab.type";
import {
  useDrawerClassificationRows,
  useDrawerDebtTabState,
} from "./GarageCasesDetailDrawer.tabState.hook";
import type { GarageCasesScope } from "./GarageCasesDetailDrawer.type";
import { useDebtDetailDrillDown } from "../garage-debt-detail-drawer/GarageDebtDetailDrawer.drillDown.hook";
import {
  EMPTY_CATEGORIZED,
  EMPTY_TREND,
  extractDebtCases,
  extractCheckpointVehicleCases,
  countActiveUnpaidCases,
  calculateDebtMetrics,
  buildCheckpointTrend,
  buildDrawerTitle,
  buildPnlSummary,
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

  const { currentTab, partnerDebtType, setPartnerDebtType } =
    useDrawerDebtTabState(activeTab);

  const isReceipt = currentTab === "RECEIPT";

  const { data: checkpointData, isLoading: checkpointLoading } =
    useCheckpointVehiclesQuery(checkpointScope, open);

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
    if (isCheckpoint) return buildCheckpointTrend(checkpointData?.summary);
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

  const {
    receivableClassificationRows,
    payableClassificationRows,
    classificationCount,
  } = useDrawerClassificationRows(safeItem);
  const totalPartnerCount =
    safeCategorized.enterprise.all.length +
    safeCategorized.individual.all.length +
    safeCategorized.insurance.all.length;

  const cases = useMemo<GarageCaseDetailRow[]>(() => {
    if (isCheckpoint) {
      return extractCheckpointVehicleCases(checkpointData?.items || []);
    }
    return extractDebtCases(safeCategorized);
  }, [isCheckpoint, checkpointData?.items, safeCategorized]);

  const casesCount = useMemo(() => {
    // Checkpoint: số XE đã tải (khớp số hàng bảng); tổng của API ở `vehicleTotal`.
    if (isCheckpoint) return countDistinctVehicles(cases);
    return countActiveUnpaidCases(cases, partnerDebtType);
  }, [isCheckpoint, cases, partnerDebtType]);

  const pnlSummary = useMemo(() => {
    if (!isCheckpoint) return undefined;
    return buildPnlSummary(checkpointData?.summary);
  }, [isCheckpoint, checkpointData?.summary]);

  const drillDown = useDebtDetailDrillDown();

  const title = useMemo(
    () =>
      buildDrawerTitle({
        checkpointLabel: isCheckpoint
          ? (checkpointScope?.periodLabel ?? "")
          : undefined,
        monthLabel: monthScope ? safeItem.label : undefined,
        fallback: breakdown?.monthLabel,
      }),
    [
      isCheckpoint,
      checkpointScope?.periodLabel,
      monthScope,
      safeItem.label,
      breakdown?.monthLabel,
    ],
  );

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
    vehicleTotal: checkpointData?.total ?? 0,
    isLoading: isCheckpoint ? checkpointLoading : false,
    ...drillDown,
    horizon: horizonScope?.horizon,
    branchId: horizonScope?.branchId || checkpointScope?.branchId,
    dateFrom: checkpointScope?.dateFrom || horizonScope?.dateFrom,
    dateTo: checkpointScope?.dateTo || horizonScope?.dateTo,
    isCheckpoint,
    showProfitMetrics,
    classification: checkpointScope?.classification,
    classificationName: checkpointScope?.classificationName,
    isFunnel: checkpointScope?.isFunnel,
    initialStatus: checkpointScope?.initialStatus,
  };
}
