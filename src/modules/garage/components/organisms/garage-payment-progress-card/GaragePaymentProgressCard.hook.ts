import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import {
  garageDashboardApi,
  type GarageTrendItem,
} from "../../../api/garageDashboardApi";
import type { GaragePaymentProgressCardProps } from "./GaragePaymentProgressCard.type";
import {
  getReceiptColumns,
  getPaymentColumns,
} from "./utils/paymentProgressColumns";
import {
  getReceiptSummaryRow,
  getPaymentSummaryRow,
} from "./utils/paymentSummaryRows";
import {
  calculateTotals,
  trendExtractors,
} from "./GaragePaymentProgressCard.helper";

export function useGaragePaymentProgressLogic(
  props: GaragePaymentProgressCardProps = {},
) {
  const { t } = useTranslation("garage");
  const [activeTab, setActiveTab] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");
  const isReceipt = activeTab === "RECEIPT";

  // Self-fetching fallback when parent does not pass data props
  const shouldFetchSelf =
    !props.collectionSummary && !props.costPaymentSummary && !props.trend;

  const { data: selfStats, isLoading: isSelfLoading } = useQuery({
    queryKey: ["garage-dashboard-stats"],
    queryFn: () => garageDashboardApi.getStats(),
    enabled: shouldFetchSelf,
  });

  const collectionSummary =
    props.collectionSummary ?? selfStats?.collectionSummary;
  const costPaymentSummary =
    props.costPaymentSummary ?? selfStats?.costPaymentSummary;
  const trend = props.trend ?? selfStats?.trend ?? [];
  const loading = props.loading ?? (shouldFetchSelf && isSelfLoading);

  // Month detail drawer state
  const [selectedMonth, setSelectedMonth] = useState<GarageTrendItem | null>(
    null,
  );
  const [monthDrawerOpen, setMonthDrawerOpen] = useState(false);

  const openMonthDetail = (item: GarageTrendItem) => {
    setSelectedMonth(item);
    setMonthDrawerOpen(true);
  };

  const closeMonthDetail = () => {
    setMonthDrawerOpen(false);
  };

  // Receipt (Collection) stats
  const totalBilled = collectionSummary?.totalBilled || 0;
  const totalPaid = collectionSummary?.totalPaid || 0;
  const collectionRate = collectionSummary?.collectionRate || 0;

  // Payment (Cost) stats
  const totalCost = costPaymentSummary?.totalCost || 0;
  const totalPaidCost = costPaymentSummary?.totalPaidCost || 0;
  const costPaymentRate = costPaymentSummary?.paymentRate || 0;

  const currentRate = isReceipt ? collectionRate : costPaymentRate;
  const currentTotal = isReceipt ? totalBilled : totalCost;
  const currentPaid = isReceipt ? totalPaid : totalPaidCost;

  // Table Column State Hook
  const tableId = isReceipt
    ? "garage-payment-progress-receipt"
    : "garage-payment-progress-payment";
  const listHook = useTableColumnState(tableId);

  // Chỉ hiển thị từ tháng 07/2026 trở đi (neo mốc đối soát dòng tiền)
  const effectiveTrend = useMemo(() => {
    if (!trend || trend.length === 0) return [];
    return trend.filter((t) => t.label >= "2026-07");
  }, [trend]);

  // Process and sort trend data using universal client-side filter
  const processedItems = useMemo(() => {
    return filterClientItems(effectiveTrend, listHook, {
      dateField: "label",
      customExtractors: trendExtractors,
    });
  }, [effectiveTrend, listHook]);

  const totals = useMemo(
    () => calculateTotals(processedItems),
    [processedItems],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        items: effectiveTrend,
        defaultAlign: "center",
      }),
    [listHook, effectiveTrend],
  );

  const receiptColumns = useMemo(
    () => getReceiptColumns(headerFilter, t, openMonthDetail),
    [headerFilter, t],
  );

  const paymentColumns = useMemo(
    () => getPaymentColumns(headerFilter, t, openMonthDetail),
    [headerFilter, t],
  );

  const receiptSummaryRow = useMemo(
    () => getReceiptSummaryRow(totals, t),
    [totals, t],
  );

  const paymentSummaryRow = useMemo(
    () => getPaymentSummaryRow(totals, t),
    [totals, t],
  );

  const columns = isReceipt ? receiptColumns : paymentColumns;
  const summaryRow = isReceipt ? receiptSummaryRow : paymentSummaryRow;

  const getRowActions = (item: GarageTrendItem): ActionDropdownItem[] => [
    {
      groupLabel: t("common.actions", "TRA CỨU"),
      items: [
        {
          label: t("progress.viewMonthDetail", "Xem chi tiết đối soát tháng"),
          icon: React.createElement(Eye, { className: "w-3.5 h-3.5" }),
          onClick: () => openMonthDetail(item),
        },
      ],
    },
  ];

  return {
    t,
    activeTab,
    setActiveTab,
    isReceipt,
    selectedMonth,
    monthDrawerOpen,
    closeMonthDetail,
    currentRate,
    currentTotal,
    currentPaid,
    tableId,
    listHook,
    processedItems,
    columns,
    summaryRow,
    getRowActions,
    loading,
  };
}
