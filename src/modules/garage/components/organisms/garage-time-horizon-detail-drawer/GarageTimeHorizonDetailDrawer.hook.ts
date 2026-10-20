import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { garageDebtsAnalyticsApi } from "@/modules/garage/api/garageDebtsAnalyticsApi";
import { useGarageMonthReceivablesBreakdown } from "@/modules/garage/hooks/useGarageMonthReceivablesBreakdown";
import { buildMonthClassificationRows } from "@/modules/garage/components/organisms/garage-month-detail-drawer/utils/buildMonthClassificationRows";
import type { MonthlyReceivablesGroupItem } from "@/modules/garage/api/garageDashboardApi";
import type { MonthClassificationRow } from "@/modules/garage/components/organisms/garage-month-detail-drawer/components/MonthClassificationTable.type";
import type { GarageTimeHorizonDetailDrawerProps } from "./GarageTimeHorizonDetailDrawer.type";

const EMPTY_CATEGORIZED = {
  all: [],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: { billed: 0, paid: 0, remaining: 0, caseCount: 0, partnerCount: 0 },
};

export function useGarageTimeHorizonDetailDrawer(
  props: GarageTimeHorizonDetailDrawerProps,
) {
  const { open, horizon, dateFrom, dateTo, branchId } = props;
  const { t } = useTranslation(["garage", "debts", "common"]);

  const [activeTab, setActiveTab] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");
  const [partnerDebtType, setPartnerDebtType] = useState<
    "receivables" | "payables"
  >("receivables");
  const isReceipt = activeTab === "RECEIPT";

  // 1. Phân rã theo Nghiệp vụ & Đối tượng qua receivables breakdown
  const {
    breakdown,
    trendItem,
    summary: breakdownSummary,
    insuranceCategorized,
    enterpriseCategorized,
    individualCategorized,
    warning: vatWarningInfo,
    isLoading: isBreakdownLoading,
  } = useGarageMonthReceivablesBreakdown({
    horizon: horizon || undefined,
    branchId,
    dateFrom,
    dateTo,
    enabled: Boolean(open && horizon),
  });

  const safeCategorized = useMemo(
    () => ({
      insurance: insuranceCategorized ?? EMPTY_CATEGORIZED,
      enterprise: enterpriseCategorized ?? EMPTY_CATEGORIZED,
      individual: individualCategorized ?? EMPTY_CATEGORIZED,
    }),
    [insuranceCategorized, enterpriseCategorized, individualCategorized],
  );

  // 2. Query danh sách vụ việc chi tiết theo mốc thời gian (Tab 3)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const casesQuery = useQuery({
    queryKey: [
      "garage-time-horizon-cases",
      horizon,
      dateFrom,
      dateTo,
      branchId,
      page,
      pageSize,
    ],
    queryFn: () =>
      horizon
        ? garageDebtsAnalyticsApi.getTimeHorizonCases(horizon, {
            date_from: dateFrom,
            date_to: dateTo,
            branch_id: branchId,
            page,
            pageSize,
          })
        : null,
    enabled: Boolean(open && horizon),
    staleTime: 30000,
  });

  // 3. Phân loại nghiệp vụ rows
  const safeTrendItem = useMemo(
    () =>
      trendItem ?? {
        label: horizon || "",
        totalBilled: 0,
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
      },
    [trendItem, horizon],
  );

  const receivableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeTrendItem, "receivables"),
    [safeTrendItem],
  );

  const payableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeTrendItem, "payables"),
    [safeTrendItem],
  );

  const totalBilled =
    safeTrendItem.tienCoThue ?? safeTrendItem.totalBilled ?? 0;
  const totalCost = safeTrendItem.cost ?? 0;
  const mainRate = isReceipt
    ? safeTrendItem.collectionRate
    : safeTrendItem.costPaymentRate;

  // 4. Sub-drawers states
  const [classificationDrawerState, setClassificationDrawerState] = useState<{
    open: boolean;
    filterType: "CLASSIFICATION";
    filterKey: string;
    filterLabel: string;
  }>({
    open: false,
    filterType: "CLASSIFICATION",
    filterKey: "",
    filterLabel: "",
  });

  const [partnerMonthDrawerState, setPartnerMonthDrawerState] = useState<{
    open: boolean;
    customerCode?: string | null;
    customerName?: string | null;
    taxCode?: string | null;
    initialCases?: any[];
  }>({ open: false });

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

  const handleSelectClassification = (row: MonthClassificationRow) => {
    setClassificationDrawerState({
      open: true,
      filterType: "CLASSIFICATION",
      filterKey: row.key,
      filterLabel: row.name,
    });
  };

  const handleSelectPartnerGroup = (group: MonthlyReceivablesGroupItem) => {
    setPartnerMonthDrawerState({
      open: true,
      customerCode: group.taxCode || group.key,
      customerName: group.title,
      taxCode: group.taxCode,
      initialCases: group.cases,
    });
  };

  return {
    t,
    activeTab,
    setActiveTab,
    isReceipt,
    partnerDebtType,
    setPartnerDebtType,
    breakdown,
    breakdownSummary,
    trendItem: safeTrendItem,
    safeCategorized,
    vatWarningInfo,
    receivableClassificationRows,
    payableClassificationRows,
    totalBilled,
    totalCost,
    mainRate,
    page,
    setPage,
    pageSize,
    setPageSize,
    casesSummary: casesQuery.data?.summary,
    items: casesQuery.data?.items || [],
    total: casesQuery.data?.total || 0,
    totalPages: casesQuery.data?.totalPages || 1,
    isLoading: isBreakdownLoading || casesQuery.isLoading,
    classificationDrawerState,
    setClassificationDrawerState,
    partnerMonthDrawerState,
    setPartnerMonthDrawerState,
    selectedCaseCode,
    setSelectedCaseCode,
    handleSelectClassification,
    handleSelectPartnerGroup,
  };
}
