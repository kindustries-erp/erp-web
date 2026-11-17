import { useCallback, useEffect, useMemo, useState } from "react";
import { useGarageMonthReceivablesBreakdown } from "@/modules/garage/hooks/useGarageMonthReceivablesBreakdown";
import type {
  GarageTrendItem,
  MonthlyReceivablesGroupItem,
} from "@/modules/garage/api/garageDashboardApi";
import { buildMonthClassificationRows } from "../garage-month-detail-drawer/utils/buildMonthClassificationRows";
import type { MonthClassificationRow } from "../garage-month-detail-drawer/components/MonthClassificationTable.type";
import type { DebtDetailScope } from "./GarageDebtDetailDrawer.type";
import {
  EMPTY_CATEGORIZED,
  EMPTY_TREND,
  formatDebtMonth,
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
 * Phần còn lại (tab, panel phải, drill-down) giống nhau.
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
      : (breakdownSummary?.totalBilled ?? mainBilled);

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

  // Drill-down: danh sách phiếu theo phân loại, theo đối tượng, và chi tiết phiếu
  const [classificationDrawer, setClassificationDrawer] = useState<{
    open: boolean;
    filterKey: string;
    filterLabel: string;
  }>({ open: false, filterKey: "", filterLabel: "" });
  const [partnerDrawer, setPartnerDrawer] = useState<{
    open: boolean;
    customerCode?: string | null;
    customerName?: string | null;
    taxCode?: string | null;
    initialCases?: any[];
  }>({ open: false });
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

  const handleSelectClassification = useCallback(
    (row: MonthClassificationRow) =>
      setClassificationDrawer({
        open: true,
        filterKey: row.key,
        filterLabel: row.name,
      }),
    [],
  );

  const handleSelectPartnerGroup = useCallback(
    (group: MonthlyReceivablesGroupItem) =>
      setPartnerDrawer({
        open: true,
        customerCode: group.taxCode || group.key,
        customerName: group.title,
        taxCode: group.taxCode,
        initialCases: group.cases,
      }),
    [],
  );

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
    classificationDrawer,
    setClassificationDrawer,
    partnerDrawer,
    setPartnerDrawer,
    selectedCaseCode,
    setSelectedCaseCode,
    handleSelectClassification,
    handleSelectPartnerGroup,
    horizon: horizonScope?.horizon,
    branchId: horizonScope?.branchId,
  };
}
