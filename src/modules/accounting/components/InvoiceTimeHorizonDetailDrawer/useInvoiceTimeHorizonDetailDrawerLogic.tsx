import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { useTimeHorizonInvoices } from "../../hooks/useTimeHorizonInvoices";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import {
  getHorizonMeta,
  formatDailyForecastBarData,
  formatCumulativeForecastData,
  calculateForecastScheduleRows,
  calculateMonthlyBreakdownStats,
  calculateBranchBarData,
  calculateTopPartnersBarData,
  calculateIfrs9ComparisonData,
  calculateTicketSizeDonutItems,
  calculateAgingDonutItems,
} from "./utils";
import { createTimeHorizonInvoiceColumns } from "./components/TimeHorizonInvoiceColumns";
import { createTimeHorizonScheduleColumns } from "./components/TimeHorizonScheduleColumns";
import { createTimeHorizonMonthlyColumns } from "./components/TimeHorizonMonthlyColumns";
import { CHART_COLORS } from "./constants";
import type { InvoiceTimeHorizonDetailDrawerProps } from "./types";

export function useInvoiceTimeHorizonDetailDrawerLogic({
  open,
  horizon,
  dateFrom,
  dateTo,
  branchId,
  onOpenPartnerDetail,
}: InvoiceTimeHorizonDetailDrawerProps) {
  const { t } = useTranslation(["debts", "common"]);

  // Sub-tab navigation: 'invoices' | 'analytics'
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "analytics">(
    "invoices",
  );

  // Direction: 'OUT' (Receivables) | 'IN' (Payables)
  const [direction, setDirection] = useState<"IN" | "OUT">("OUT");

  // Invoices Table State
  const tableState = useTableColumnState(
    `time-horizon-detail-${horizon || "unknown"}`,
  );
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Reset pagination & subtab when open or horizon changes
  useEffect(() => {
    if (open) {
      setActiveSubTab("invoices");
      setPage(1);
    }
  }, [open, horizon]);

  // Auto reset page to 1 when any table filter, search, or direction changes
  useEffect(() => {
    setPage(1);
  }, [
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.dateFrom,
    tableState.dateTo,
    tableState.sorts,
    direction,
  ]);

  const effectiveDateFrom = tableState.dateFrom || dateFrom;
  const effectiveDateTo = tableState.dateTo || dateTo;

  const activeSortStr = tableState.sorts[0];
  const sortOrder = activeSortStr?.startsWith("-")
    ? ("DESC" as const)
    : activeSortStr
      ? ("ASC" as const)
      : undefined;
  const rawField = activeSortStr
    ? activeSortStr.startsWith("-")
      ? activeSortStr.slice(1)
      : activeSortStr
    : undefined;
  const sortBy = rawField
    ? rawField === "invoiceNo"
      ? "invoice_no"
      : rawField === "invoiceDate"
        ? "invoice_date"
        : rawField === "totalAmount"
          ? "total_amount"
          : rawField === "paidAmount"
            ? "paid_amount"
            : rawField === "balanceAmount"
              ? "balance_amount"
              : rawField
    : undefined;

  // Query Invoices
  const { summary, items, total, totalPages, isLoading, isFetching, refetch } =
    useTimeHorizonInvoices({
      horizon: horizon || "nextWeekDue",
      dateFrom: effectiveDateFrom,
      dateTo: effectiveDateTo,
      branchId,
      direction,
      page,
      pageSize,
      sortBy,
      sortOrder,
      columnSearch: tableState.columnSearch,
      columnFilters: tableState.columnFilters,
      enabled: open && Boolean(horizon),
    });

  // Guard against out-of-range page when filtered totalPages changes
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(1);
    }
  }, [totalPages, page]);

  // Internal Invoice Form Modal Hook
  const handleReloadInvoices = useCallback(() => {
    void refetch();
  }, [refetch]);
  const formHook = useErpInvoiceForm(handleReloadInvoices);

  // Horizon Metadata
  const horizonMeta = useMemo(() => {
    return getHorizonMeta(horizon, t);
  }, [horizon, t]);

  const isReceivable = direction === "OUT";
  const isForecastHorizon =
    horizon === "forecastNext7Days" || horizon === "forecastNext30Days";
  const isIfrs9Horizon =
    horizon === "expectedCashflow" || horizon === "defaultRiskProvision";
  const isAgingHorizon = !isForecastHorizon && !isIfrs9Horizon;

  // 1. Forecast Charts Data (Mode 1: T+7 / T+30)
  const dailyForecastBarData = useMemo(() => {
    return formatDailyForecastBarData(
      summary?.dailyForecastTimeline || [],
      isReceivable,
      t,
    );
  }, [summary?.dailyForecastTimeline, isReceivable, t]);

  const cumulativeForecastData = useMemo(() => {
    return formatCumulativeForecastData(
      summary?.dailyForecastTimeline || [],
      isReceivable,
      t,
    );
  }, [summary?.dailyForecastTimeline, isReceivable, t]);

  const forecastCompositionItems = useMemo(() => {
    const mb = summary?.maturityBreakdown;
    if (!mb) return [];
    const dueAmount = isReceivable
      ? mb.outDueInPeriodAmount || 0
      : mb.inDueInPeriodAmount || 0;
    const overdueAmount = isReceivable
      ? mb.outOverdueCarriedAmount || 0
      : mb.inOverdueCarriedAmount || 0;

    return [
      {
        label: isReceivable
          ? t("debts:horizonDrawer.dueInPeriodOut", "Dự thu đúng hạn trong kỳ")
          : t("debts:horizonDrawer.dueInPeriodIn", "Dự chi đúng hạn trong kỳ"),
        value: dueAmount,
        color: CHART_COLORS.emerald,
      },
      {
        label: isReceivable
          ? t("debts:horizonDrawer.overdueCarriedOut", "Nợ quá hạn trôi sang")
          : t(
              "debts:horizonDrawer.overdueCarriedIn",
              "Nợ phải trả quá hạn trôi sang",
            ),
        value: overdueAmount,
        color: CHART_COLORS.amber,
      },
    ].filter((item) => item.value > 0);
  }, [summary?.maturityBreakdown, isReceivable, t]);

  // Schedule Table State & Data
  const forecastScheduleRows = useMemo(() => {
    return calculateForecastScheduleRows(
      summary?.dailyForecastTimeline || [],
      isReceivable,
      t("debts:horizonDrawer.forecastOverdueRow", "Quá hạn trôi sang"),
    );
  }, [summary?.dailyForecastTimeline, isReceivable, t]);

  const scheduleTableState = useTableColumnState(
    "time-horizon-forecast-schedule",
  );
  const filteredSortedScheduleRows = useMemo(() => {
    return filterClientItems(forecastScheduleRows, scheduleTableState);
  }, [forecastScheduleRows, scheduleTableState]);

  const scheduleHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: scheduleTableState,
        items: forecastScheduleRows,
        defaultAlign: "center",
      }),
    [scheduleTableState, forecastScheduleRows],
  );

  const scheduleColumns = useMemo(() => {
    return createTimeHorizonScheduleColumns({
      headerFilter: scheduleHeaderFilter,
      isReceivable,
      t,
    });
  }, [scheduleHeaderFilter, isReceivable, t]);

  const scheduleSummaryRow = useMemo(() => {
    if (filteredSortedScheduleRows.length === 0) return {};
    let totalRecv = 0;
    let totalPay = 0;
    let totalInvs = 0;

    for (const r of filteredSortedScheduleRows) {
      totalRecv += r.receivable;
      totalPay += r.payable;
      totalInvs += r.invoiceCount;
    }

    return {
      displayDate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
        />
      ),
      receivable: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.forecastColReceivable", "Dự thu")}
          itemTitle={t("debts:horizonDrawer.daysUnit", "ngày")}
          subtotalAmount={totalRecv}
          grandTotalAmount={totalRecv}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
        />
      ),
      payable: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.forecastColPayable", "Dự chi")}
          itemTitle={t("debts:horizonDrawer.daysUnit", "ngày")}
          subtotalAmount={totalPay}
          grandTotalAmount={totalPay}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-amber-700 dark:text-amber-400 font-bold"
        />
      ),
      net: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.forecastColNet", "Vị thế ròng")}
          itemTitle={t("debts:horizonDrawer.daysUnit", "ngày")}
          subtotalAmount={totalRecv - totalPay}
          grandTotalAmount={totalRecv - totalPay}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-foreground font-bold"
        />
      ),
      invoiceCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("debts:horizonDrawer.forecastColInvoices", "Số HĐ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalQty={totalInvs}
          grandTotalQty={totalInvs}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedScheduleRows.length}
          totalCount={forecastScheduleRows.length}
          valueClassName="text-foreground font-semibold"
        />
      ),
    };
  }, [filteredSortedScheduleRows, forecastScheduleRows.length, t]);

  // 2. IFRS 9 Exposure Comparison Bar Data (Mode 2: Expected Cashflow / Default Risk Provision)
  const ifrs9ComparisonData = useMemo(() => {
    return calculateIfrs9ComparisonData(
      summary?.agingBreakdown,
      isReceivable,
      horizon,
      t,
    );
  }, [summary?.agingBreakdown, isReceivable, horizon, t]);

  // 3. Top Partners & Branch Breakdown Bar Data (Shared across Mode 2 & Mode 3)
  const topPartnersBarData = useMemo(() => {
    const partners =
      direction === "OUT"
        ? summary?.topReceivablePartners || []
        : summary?.topPayablePartners || [];
    return calculateTopPartnersBarData(partners, isReceivable, t);
  }, [
    summary?.topReceivablePartners,
    summary?.topPayablePartners,
    direction,
    isReceivable,
    t,
  ]);

  const branchBarData = useMemo(() => {
    return calculateBranchBarData(
      summary?.branchBreakdown || [],
      isReceivable,
      t,
    );
  }, [summary?.branchBreakdown, isReceivable, t]);

  // 4. Donut Charts Data (Ticket Size Pareto & Aging Distribution)
  const ticketSizeDonutItems = useMemo(() => {
    return calculateTicketSizeDonutItems(
      summary?.ticketSizeBuckets,
      isReceivable,
      t,
    );
  }, [summary?.ticketSizeBuckets, isReceivable, t]);

  const agingDonutItems = useMemo(() => {
    return calculateAgingDonutItems(summary?.agingBreakdown, isReceivable, t);
  }, [summary?.agingBreakdown, isReceivable, t]);

  const ifrs9StageDonutItems = useMemo(() => {
    const ab = summary?.agingBreakdown;
    if (!ab) return [];
    return [
      {
        name: t("debts:ifrs9.stage1", "Stage 1 (≤30d)"),
        value: isReceivable ? ab.outAging0_30 || 0 : ab.inAging0_30 || 0,
        color: CHART_COLORS.emerald,
      },
      {
        name: t("debts:ifrs9.stage2", "Stage 2 (31-90d)"),
        value: isReceivable
          ? (ab.outAging31_60 || 0) + (ab.outAging61_90 || 0)
          : (ab.inAging31_60 || 0) + (ab.inAging61_90 || 0),
        color: CHART_COLORS.amber,
      },
      {
        name: t("debts:ifrs9.stage3", "Stage 3 (>90d)"),
        value: isReceivable ? ab.outAgingOver90 || 0 : ab.inAgingOver90 || 0,
        color: CHART_COLORS.rose,
      },
    ].filter((x) => x.value > 0);
  }, [summary?.agingBreakdown, isReceivable, t]);

  // 5. Monthly Trend Data (Tab 2 Bottom Section)
  const monthlyBreakdownStats = useMemo(() => {
    return calculateMonthlyBreakdownStats(
      summary?.monthlyTrend || [],
      isReceivable,
    );
  }, [summary?.monthlyTrend, isReceivable]);

  const monthlyTableState = useTableColumnState(
    "time-horizon-monthly-breakdown",
  );
  const filteredSortedMonthlyRows = useMemo(() => {
    return filterClientItems(monthlyBreakdownStats, monthlyTableState);
  }, [monthlyBreakdownStats, monthlyTableState]);

  const monthlyHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: monthlyTableState,
        items: monthlyBreakdownStats,
        defaultAlign: "center",
      }),
    [monthlyTableState, monthlyBreakdownStats],
  );

  const monthlyColumns = useMemo(() => {
    return createTimeHorizonMonthlyColumns({
      headerFilter: monthlyHeaderFilter,
      isReceivable,
      t,
    });
  }, [monthlyHeaderFilter, isReceivable, t]);

  const monthlySummaryRow = useMemo(() => {
    if (filteredSortedMonthlyRows.length === 0) return {};
    let totalCount = 0;
    let totalAmt = 0;
    let totalPaid = 0;
    let totalBal = 0;

    for (const r of filteredSortedMonthlyRows) {
      totalCount += r.invoiceCount;
      totalAmt += r.totalAmount;
      totalPaid += r.paidAmount;
      totalBal += r.balanceAmount;
    }

    const avgRate =
      totalAmt > 0 ? Number(((totalPaid / totalAmt) * 100).toFixed(1)) : 0;

    return {
      monthLabel: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
        />
      ),
      invoiceCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("debts:horizonDrawer.colInvoiceCount", "Số lượng HĐ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalQty={totalCount}
          grandTotalQty={totalCount}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-foreground font-bold"
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t(
            "debts:horizonDrawer.colTotalAmount",
            "Tổng phát sinh",
          )}
          itemTitle={t("debts:horizonDrawer.unitMonth", "tháng")}
          subtotalAmount={totalAmt}
          grandTotalAmount={totalAmt}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-foreground font-bold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            direction === "OUT"
              ? t("debts:horizonDrawer.colPaidOut", "Đã thu")
              : t("debts:horizonDrawer.colPaidIn", "Đã trả")
          }
          itemTitle={t("debts:horizonDrawer.unitMonth", "tháng")}
          subtotalAmount={totalPaid}
          grandTotalAmount={totalPaid}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.colBalanceAmount", "Còn nợ")}
          itemTitle={t("debts:horizonDrawer.unitMonth", "tháng")}
          subtotalAmount={totalBal}
          grandTotalAmount={totalBal}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-destructive font-bold"
        />
      ),
      rate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${avgRate}%`}
          page={1}
          totalPages={1}
          currentPageCount={filteredSortedMonthlyRows.length}
          totalCount={monthlyBreakdownStats.length}
          valueClassName="text-foreground font-bold"
        />
      ),
    };
  }, [filteredSortedMonthlyRows, monthlyBreakdownStats.length, direction, t]);

  // Main Invoices Table Columns & Header Filter
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items,
        defaultAlign: "center",
      }),
    [tableState, items],
  );

  const invoiceColumns = useMemo(() => {
    return createTimeHorizonInvoiceColumns({
      headerFilter,
      isReceivable,
      horizon,
      onOpenInternal: formHook.openInternal,
      onOpenPartnerDetail,
      t,
    });
  }, [
    headerFilter,
    isReceivable,
    horizon,
    formHook.openInternal,
    onOpenPartnerDetail,
    t,
  ]);

  // Invoices Subtotal Summary Row
  const invoicesSummaryRow = useMemo(() => {
    if (!items || items.length === 0) return {};
    let subtotalTotal = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;
    let subtotalExp = 0;
    let subtotalRisk = 0;

    for (const inv of items) {
      subtotalTotal += Number(inv.totalAmount) || 0;
      subtotalPaid += Number(inv.paidAmount) || 0;
      subtotalBal += Number(inv.balanceAmount) || 0;
      subtotalExp += Number(inv.expectedAmount) || 0;
      subtotalRisk += Number(inv.riskAmount) || 0;
    }

    const isExpected = horizon === "expectedCashflow";
    const isRisk = horizon === "defaultRiskProvision";

    const grandTotal =
      direction === "OUT"
        ? summary?.receivableTotalAmount ||
          (totalPages === 1 ? subtotalTotal : 0)
        : summary?.payableTotalAmount || (totalPages === 1 ? subtotalTotal : 0);

    const grandPaid =
      direction === "OUT"
        ? summary?.receivedAmount || (totalPages === 1 ? subtotalPaid : 0)
        : summary?.paidAmount || (totalPages === 1 ? subtotalPaid : 0);

    const grandBalance =
      direction === "OUT"
        ? summary?.receivableAmount || (totalPages === 1 ? subtotalBal : 0)
        : summary?.payableAmount || (totalPages === 1 ? subtotalBal : 0);

    const grandExpected =
      direction === "OUT"
        ? summary?.receivableExpectedAmount ||
          (totalPages === 1 ? subtotalExp : 0)
        : summary?.payableExpectedAmount ||
          (totalPages === 1 ? subtotalExp : 0);

    const grandRisk =
      direction === "OUT"
        ? summary?.receivableRiskAmount || (totalPages === 1 ? subtotalRisk : 0)
        : summary?.payableRiskAmount || (totalPages === 1 ? subtotalRisk : 0);

    return {
      invoiceDate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
        />
      ),
      totalAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t(
            "debts:horizonDrawer.colTotalAmount",
            "Tổng giá trị hóa đơn",
          )}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalTotal}
          grandTotalAmount={grandTotal || subtotalTotal}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-foreground font-bold"
        />
      ),
      paidAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={
            direction === "OUT"
              ? t("debts:horizonDrawer.colPaidOut", "Đã thu")
              : t("debts:horizonDrawer.colPaidIn", "Đã trả")
          }
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalPaid}
          grandTotalAmount={grandPaid || subtotalPaid}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("debts:horizonDrawer.colBalanceAmount", "Còn nợ")}
          itemTitle={t("debts:unitInvoice", "hóa đơn")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={grandBalance || subtotalBal}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName={
            isReceivable
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-amber-700 dark:text-amber-400 font-bold"
          }
        />
      ),
      ...(isExpected && {
        expectedAmount: (
          <SubtotalSummaryCell
            variantType="amount"
            metricTitle={t(
              "debts:horizonDrawer.colExpectedAmount",
              "Dòng tiền kỳ vọng",
            )}
            itemTitle={t("debts:unitInvoice", "hóa đơn")}
            subtotalAmount={subtotalExp}
            grandTotalAmount={grandExpected || subtotalExp}
            page={page}
            totalPages={totalPages}
            currentPageCount={items.length}
            totalCount={total}
            valueClassName="text-indigo-600 dark:text-indigo-400 font-bold"
          />
        ),
      }),
      ...(isRisk && {
        riskAmount: (
          <SubtotalSummaryCell
            variantType="amount"
            metricTitle={t(
              "debts:horizonDrawer.colProvisionAmount",
              "Dự phòng rủi ro",
            )}
            itemTitle={t("debts:unitInvoice", "hóa đơn")}
            subtotalAmount={subtotalRisk}
            grandTotalAmount={grandRisk || subtotalRisk}
            page={page}
            totalPages={totalPages}
            currentPageCount={items.length}
            totalCount={total}
            valueClassName="text-rose-600 dark:text-rose-400 font-bold"
          />
        ),
      }),
    };
  }, [
    items,
    summary,
    page,
    totalPages,
    total,
    horizon,
    direction,
    isReceivable,
    t,
  ]);

  return {
    t,
    activeSubTab,
    setActiveSubTab,
    direction,
    setDirection,
    tableState,
    page,
    setPage,
    pageSize,
    setPageSize,
    summary,
    items,
    total,
    totalPages,
    isLoading: isLoading || isFetching,
    horizonMeta,
    isForecastHorizon,
    isIfrs9Horizon,
    isAgingHorizon,
    formHook,
    invoiceColumns,
    invoicesSummaryRow,
    dailyForecastBarData,
    cumulativeForecastData,
    forecastCompositionItems,
    forecastScheduleRows,
    scheduleTableState,
    filteredSortedScheduleRows,
    scheduleColumns,
    scheduleSummaryRow,
    ifrs9ComparisonData,
    topPartnersBarData,
    branchBarData,
    ticketSizeDonutItems,
    agingDonutItems,
    ifrs9StageDonutItems,
    monthlyBreakdownStats,
    monthlyTableState,
    filteredSortedMonthlyRows,
    monthlyColumns,
    monthlySummaryRow,
  };
}
