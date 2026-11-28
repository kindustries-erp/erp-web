import React, { useState, useMemo, useCallback } from "react";
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
import { getUnifiedProgressColumns } from "./utils/paymentProgressColumns";
import { getUnifiedSummaryRow } from "./utils/paymentSummaryRows";
import {
  calculateTotals,
  trendExtractors,
} from "./GaragePaymentProgressCard.helper";
import { PaymentRowTooltipContent } from "./components/PaymentRowTooltipContent";

export function useGaragePaymentProgressLogic(
  props: GaragePaymentProgressCardProps = {},
) {
  const { t } = useTranslation("garage");

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

  const openMonthDetail = useCallback((item: GarageTrendItem) => {
    setSelectedMonth(item);
    setMonthDrawerOpen(true);
  }, []);

  const closeMonthDetail = useCallback(() => {
    setMonthDrawerOpen(false);
  }, []);

  const collectionProgress = useMemo(
    () => ({
      total: collectionSummary?.totalBilled || 0,
      paid: collectionSummary?.totalPaid || 0,
      rate: collectionSummary?.collectionRate || 0,
    }),
    [collectionSummary],
  );

  const costPaymentProgress = useMemo(
    () => ({
      total: costPaymentSummary?.totalCost || 0,
      paid: costPaymentSummary?.totalPaidCost || 0,
      rate: costPaymentSummary?.paymentRate || 0,
    }),
    [costPaymentSummary],
  );

  const tableId = "garage-payment-progress";
  const listHook = useTableColumnState(tableId);

  // Chỉ hiển thị từ tháng 07/2026 trở đi (neo mốc đối soát dòng tiền)
  const effectiveTrend = useMemo(() => {
    if (!trend || trend.length === 0) return [];
    return trend.filter((item) => item.label >= "2026-07");
  }, [trend]);

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

  const columns = useMemo(
    () => getUnifiedProgressColumns(headerFilter, t, openMonthDetail),
    [headerFilter, t, openMonthDetail],
  );

  const summaryRow = useMemo(
    () => getUnifiedSummaryRow(totals, t),
    [totals, t],
  );

  const getRowTooltip = useCallback(
    (item: GarageTrendItem) =>
      React.createElement(PaymentRowTooltipContent, { item }),
    [],
  );

  const getRowActions = useCallback(
    (item: GarageTrendItem): ActionDropdownItem[] => [
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
    ],
    [t, openMonthDetail],
  );

  return {
    t,
    selectedMonth,
    monthDrawerOpen,
    closeMonthDetail,
    collectionProgress,
    costPaymentProgress,
    tableId,
    listHook,
    processedItems,
    columns,
    summaryRow,
    getRowTooltip,
    getRowActions,
    loading,
  };
}
