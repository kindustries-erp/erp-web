import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type {
  GaragePaymentProgressCardProps,
  PaymentProgressTotals,
} from "./types";
import {
  getReceiptColumns,
  getPaymentColumns,
} from "./utils/paymentProgressColumns";
import {
  getReceiptSummaryRow,
  getPaymentSummaryRow,
} from "./utils/paymentSummaryRows";

export function useGaragePaymentProgressLogic({
  collectionSummary,
  costPaymentSummary,
  trend = [],
  loading = false,
}: GaragePaymentProgressCardProps) {
  const { t } = useTranslation("garage");
  const [activeTab, setActiveTab] = useState<"RECEIPT" | "PAYMENT">("RECEIPT");
  const isReceipt = activeTab === "RECEIPT";

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

  // Table Column State Hook (Client-side for trend breakdown table)
  const tableId = isReceipt
    ? "garage-payment-progress-receipt"
    : "garage-payment-progress-payment";
  const listHook = useTableColumnState(tableId);

  // Chỉ hiển thị từ tháng 07/2026 trở đi
  const effectiveTrend = useMemo(() => {
    if (!trend || trend.length === 0) return [];
    return trend.filter((t) => t.label >= "2026-07");
  }, [trend]);

  // Process and sort trend data using universal client-side filter
  const processedItems = useMemo(() => {
    return filterClientItems(effectiveTrend, listHook, {
      dateField: "label",
      customExtractors: {
        tienCoThue: (item: GarageTrendItem) =>
          item.tienCoThue || item.totalBilled || 0,
        paid: (item: GarageTrendItem) => item.paid || 0,
        receivable: (item: GarageTrendItem) => item.receivable || 0,
        receivableWithInvoice: (item: GarageTrendItem) =>
          item.receivableWithInvoice || 0,
        receivableNoInvoice: (item: GarageTrendItem) =>
          item.receivableNoInvoice || 0,
        cost: (item: GarageTrendItem) => item.cost || 0,
        paidCost: (item: GarageTrendItem) => item.paidCost || 0,
        payableCost: (item: GarageTrendItem) => item.payableCost || 0,
        payableCostWithInvoice: (item: GarageTrendItem) =>
          item.payableCostWithInvoice || 0,
        payableCostNoInvoice: (item: GarageTrendItem) =>
          item.payableCostNoInvoice || 0,
        revenue: (item: GarageTrendItem) => item.revenue || 0,
      },
    });
  }, [effectiveTrend, listHook]);

  const totals = useMemo<PaymentProgressTotals>(() => {
    return processedItems.reduce(
      (acc: PaymentProgressTotals, item: GarageTrendItem) => ({
        caseCount: acc.caseCount + (item.caseCount || 0),
        revenue: acc.revenue + (item.revenue || 0),
        billed: acc.billed + (item.tienCoThue || item.totalBilled || 0),
        paid: acc.paid + (item.paid || 0),
        receivable: acc.receivable + (item.receivable || 0),
        receivableWithInvoice:
          acc.receivableWithInvoice + (item.receivableWithInvoice || 0),
        receivableNoInvoice:
          acc.receivableNoInvoice + (item.receivableNoInvoice || 0),
        cost: acc.cost + (item.cost || 0),
        paidCost: acc.paidCost + (item.paidCost || 0),
        payableCost: acc.payableCost + (item.payableCost || 0),
        payableCostWithInvoice:
          acc.payableCostWithInvoice + (item.payableCostWithInvoice || 0),
        payableCostNoInvoice:
          acc.payableCostNoInvoice + (item.payableCostNoInvoice || 0),
      }),
      {
        caseCount: 0,
        revenue: 0,
        billed: 0,
        paid: 0,
        receivable: 0,
        receivableWithInvoice: 0,
        receivableNoInvoice: 0,
        cost: 0,
        paidCost: 0,
        payableCost: 0,
        payableCostWithInvoice: 0,
        payableCostNoInvoice: 0,
      },
    );
  }, [processedItems]);

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
          icon: <Eye className="w-3.5 h-3.5" />,
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
