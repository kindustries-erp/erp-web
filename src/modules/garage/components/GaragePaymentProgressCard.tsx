import React, { useState, useMemo } from "react";
import { Wallet, Truck, Table as TableIcon, Eye } from "lucide-react";
import { money, shortMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";

import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { GarageMonthDetailDrawer } from "./GarageMonthDetailDrawer";

import {
  GarageCollectionSummary,
  GarageCostPaymentSummary,
  GarageTrendItem,
} from "../api/garageDashboardApi";

interface GaragePaymentProgressCardProps {
  collectionSummary?: GarageCollectionSummary;
  costPaymentSummary?: GarageCostPaymentSummary;
  trend?: GarageTrendItem[];
  loading?: boolean;
}

export function GaragePaymentProgressCard({
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

  // Receipt (Collection) stats
  const totalBilled = collectionSummary?.totalBilled || 0;
  const totalRevenue = collectionSummary?.totalRevenue || 0;
  const totalPaid = collectionSummary?.totalPaid || 0;
  const totalReceivable = collectionSummary?.totalReceivable || 0;
  const collectionRate = collectionSummary?.collectionRate || 0;

  // Payment (Cost) stats
  const totalCost = costPaymentSummary?.totalCost || 0;
  const totalPaidCost = costPaymentSummary?.totalPaidCost || 0;
  const totalPayableCost = costPaymentSummary?.totalPayableCost || 0;
  const costPaymentRate = costPaymentSummary?.paymentRate || 0;

  const currentRate = isReceipt ? collectionRate : costPaymentRate;
  const currentTotal = isReceipt ? totalBilled : totalCost;
  const currentPaid = isReceipt ? totalPaid : totalPaidCost;

  // Table Column State Hook (Client-side for trend breakdown table)
  const tableId = isReceipt
    ? "garage-payment-progress-receipt"
    : "garage-payment-progress-payment";
  const listHook = useTableColumnState(tableId);

  // Rate badge color helper (Neutral business style with subtle completion tint)
  const getBadgeVariant = (rate: number, isReceiptTab: boolean = true) => {
    if (rate >= 100) {
      return isReceiptTab
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
        : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
    }
    return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80";
  };

  // Progress bar color helper matching Garage Trend Chart (#059669 for Revenue / #ea580c for Cost)
  const getProgressColor = (rate: number, isReceiptTab: boolean = true) => {
    if (isReceiptTab) {
      return rate >= 100
        ? "bg-[#059669] dark:bg-emerald-500"
        : "bg-[#059669]/85 dark:bg-emerald-500/85";
    } else {
      return rate >= 100
        ? "bg-[#ea580c] dark:bg-orange-500"
        : "bg-[#ea580c]/85 dark:bg-orange-500/85";
    }
  };

  const formatMonth = (m: string) => {
    const parts = m.split("-");
    if (parts.length === 2) return `Tháng ${parts[1]}/${parts[0]}`;
    return m;
  };

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
        tienCoThue: (item) => item.tienCoThue || item.totalBilled || 0,
        payableCost: (item) => item.payableCost || 0,
        cost: (item) => item.cost || 0,
        revenue: (item) => item.revenue || 0,
        receivable: (item) => item.receivable || 0,
        withInvoice: (item) => item.billedWithInvoice || 0,
        noInvoice: (item) => item.billedNoInvoice || 0,
        withInvoiceCost: (item) => item.costWithInvoice || 0,
        noInvoiceCost: (item) => item.costNoInvoice || 0,
      },
    });
  }, [effectiveTrend, listHook]);

  const totalCases = useMemo(() => {
    return effectiveTrend.reduce((sum, item) => sum + (item.caseCount || 0), 0);
  }, [effectiveTrend]);

  const totalBilledWithInvoice = useMemo(
    () =>
      effectiveTrend.reduce(
        (sum, item) => sum + (item.billedWithInvoice || 0),
        0,
      ),
    [effectiveTrend],
  );
  const totalPaidWithInvoice = useMemo(
    () =>
      effectiveTrend.reduce(
        (sum, item) => sum + (item.paidWithInvoice || 0),
        0,
      ),
    [effectiveTrend],
  );
  const overallRateWithInvoice =
    totalBilledWithInvoice > 0
      ? Math.min(
          100,
          Math.round((totalPaidWithInvoice / totalBilledWithInvoice) * 1000) /
            10,
        )
      : 0;

  const totalBilledNoInvoice = useMemo(
    () =>
      effectiveTrend.reduce(
        (sum, item) => sum + (item.billedNoInvoice || 0),
        0,
      ),
    [effectiveTrend],
  );
  const totalPaidNoInvoice = useMemo(
    () =>
      effectiveTrend.reduce((sum, item) => sum + (item.paidNoInvoice || 0), 0),
    [effectiveTrend],
  );
  const overallRateNoInvoice =
    totalBilledNoInvoice > 0
      ? Math.min(
          100,
          Math.round((totalPaidNoInvoice / totalBilledNoInvoice) * 1000) / 10,
        )
      : 0;

  const totalCostWithInvoice = useMemo(
    () =>
      effectiveTrend.reduce(
        (sum, item) => sum + (item.costWithInvoice || 0),
        0,
      ),
    [effectiveTrend],
  );
  const totalPaidCostWithInvoice = useMemo(
    () =>
      effectiveTrend.reduce(
        (sum, item) => sum + (item.paidCostWithInvoice || 0),
        0,
      ),
    [effectiveTrend],
  );
  const overallCostRateWithInvoice =
    totalCostWithInvoice > 0
      ? Math.min(
          100,
          Math.round((totalPaidCostWithInvoice / totalCostWithInvoice) * 1000) /
            10,
        )
      : 100;

  const totalCostNoInvoice = useMemo(
    () =>
      effectiveTrend.reduce((sum, item) => sum + (item.costNoInvoice || 0), 0),
    [effectiveTrend],
  );
  const totalPaidCostNoInvoice = useMemo(
    () =>
      effectiveTrend.reduce(
        (sum, item) => sum + (item.paidCostNoInvoice || 0),
        0,
      ),
    [effectiveTrend],
  );
  const overallCostRateNoInvoice =
    totalCostNoInvoice > 0
      ? Math.min(
          100,
          Math.round((totalPaidCostNoInvoice / totalCostNoInvoice) * 1000) / 10,
        )
      : 100;

  // 1-line Column Header Filter Builder (Client-side auto extract options)
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        items: effectiveTrend,
        defaultAlign: "center",
      }),
    [listHook, effectiveTrend],
  );

  // Columns for RECEIPT Tab (Khách hàng)
  const receiptColumns: DataTableColumn<GarageTrendItem>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "label",
        header: headerFilter.month(
          "label",
          t("progress.columns.month", "Tháng"),
        ),
        size: 130,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (item: GarageTrendItem) => (
          <div className="flex items-center justify-center gap-1.5 cursor-pointer group/month">
            <span className="font-semibold text-foreground group-hover/month:text-primary group-hover/month:underline transition-colors">
              {formatMonth(item.label)}
            </span>
          </div>
        ),
      },
      {
        key: "caseCount",
        header: headerFilter.qty(
          "caseCount",
          t("progress.columns.caseCount", "Số vụ việc"),
        ),
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center tabular-nums text-muted-foreground",
        cell: (item: GarageTrendItem) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            {item.caseCount} phiếu
          </span>
        ),
      },
      {
        key: "revenue",
        header: headerFilter.amount(
          "revenue",
          t("progress.columns.revenue", "Doanh Thu"),
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-medium tabular-nums text-foreground font-mono",
        cell: (item: GarageTrendItem) => money(item.revenue),
      },
      {
        key: "receivable",
        header: headerFilter.amount(
          "receivable",
          t("progress.columns.receivable", "Còn Phải Thu"),
        ),
        size: 140,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (item: GarageTrendItem) => (
          <Tooltip
            content={
              item.receivable > 0
                ? `Còn phải thu: ${money(item.receivable)}`
                : undefined
            }
            side="top"
          >
            <span
              className={
                item.receivable > 0
                  ? "font-mono font-bold text-foreground text-[12px] tabular-nums cursor-default"
                  : "font-mono text-muted-foreground/60 text-[11px] cursor-default"
              }
            >
              {item.receivable > 0 ? shortMoney(item.receivable) : "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "tienCoThue",
        header: headerFilter.amount(
          "tienCoThue",
          t("progress.columns.totalBilled", "Tổng Phải Thu"),
        ),
        size: 195,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const billed = item.tienCoThue || item.totalBilled || 0;
          const paid = item.paid || 0;
          const rate =
            item.collectionRate || (billed > 0 ? (paid / billed) * 100 : 0);

          return (
            <Tooltip
              content={
                <span className="font-mono text-[11px]">
                  {money(paid)}&nbsp;/&nbsp;{money(billed)}
                </span>
              }
              side="top"
            >
              <div className="flex flex-col gap-1 w-full max-w-[195px] cursor-default">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground text-[11.5px] tracking-tight">
                    {shortMoney(paid)}
                  </span>
                  <span className="text-muted-foreground/75 font-mono text-[10px] font-normal tracking-tight">
                    / {shortMoney(billed)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`font-medium px-1 py-0 text-[10px] border tabular-nums ${getBadgeVariant(rate, true)}`}
                  >
                    {rate.toFixed(1)}%
                  </Badge>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full ${getProgressColor(rate, true)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "withInvoice",
        header: headerFilter.amount(
          "billedWithInvoice",
          t("progress.columns.withInvoice", "Có HĐ"),
        ),
        size: 195,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const billed = item.billedWithInvoice || 0;
          const paid = item.paidWithInvoice || 0;
          const rate = item.rateWithInvoice || 0;
          const cases = item.caseCountWithInvoice || 0;

          return (
            <Tooltip
              content={
                <span className="font-mono text-[11px]">
                  {money(paid)}&nbsp;/&nbsp;{money(billed)}&nbsp;({cases}p)
                </span>
              }
              side="top"
            >
              <div className="flex flex-col gap-1 w-full max-w-[195px] cursor-default">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground text-[11.5px] tracking-tight">
                    {shortMoney(paid)}
                  </span>
                  <span className="text-muted-foreground/75 font-mono text-[10px] font-normal tracking-tight">
                    / {shortMoney(billed)} ({cases}p)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`font-medium px-1 py-0 text-[10px] border tabular-nums ${getBadgeVariant(rate, true)}`}
                  >
                    {rate.toFixed(1)}%
                  </Badge>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full ${getProgressColor(rate, true)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "noInvoice",
        header: headerFilter.amount(
          "billedNoInvoice",
          t("progress.columns.noInvoice", "Không HĐ"),
        ),
        size: 195,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const billed = item.billedNoInvoice || 0;
          const paid = item.paidNoInvoice || 0;
          const rate = item.rateNoInvoice || 0;
          const cases = item.caseCountNoInvoice || 0;

          return (
            <Tooltip
              content={
                <span className="font-mono text-[11px]">
                  {money(paid)}&nbsp;/&nbsp;{money(billed)}&nbsp;({cases}p)
                </span>
              }
              side="top"
            >
              <div className="flex flex-col gap-1 w-full max-w-[195px] cursor-default">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground text-[11.5px] tracking-tight">
                    {shortMoney(paid)}
                  </span>
                  <span className="text-muted-foreground/75 font-mono text-[10px] font-normal tracking-tight">
                    / {shortMoney(billed)} ({cases}p)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`font-medium px-1 py-0 text-[10px] border tabular-nums ${getBadgeVariant(rate, true)}`}
                  >
                    {rate.toFixed(1)}%
                  </Badge>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full ${getProgressColor(rate, true)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
    ],
    [headerFilter, t],
  );

  // Columns for PAYMENT Tab (Nhà cung cấp / Chi phí)
  const paymentColumns: DataTableColumn<GarageTrendItem>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "label",
        header: headerFilter.month(
          "label",
          t("progress.columns.month", "Tháng"),
        ),
        size: 130,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (item: GarageTrendItem) => (
          <div className="flex items-center justify-center gap-1.5 cursor-pointer group/month">
            <span className="font-semibold text-foreground group-hover/month:text-primary group-hover/month:underline transition-colors">
              {formatMonth(item.label)}
            </span>
          </div>
        ),
      },
      {
        key: "caseCount",
        header: headerFilter.qty(
          "caseCount",
          t("progress.columns.caseCount", "Số vụ việc"),
        ),
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center tabular-nums text-muted-foreground",
        cell: (item: GarageTrendItem) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            {item.caseCount} phiếu
          </span>
        ),
      },
      {
        key: "payableCost",
        header: headerFilter.amount(
          "payableCost",
          t("progress.columns.payableCost", "Còn Phải Trả"),
        ),
        size: 140,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (item: GarageTrendItem) => (
          <Tooltip
            content={
              item.payableCost > 0
                ? `Còn phải trả: ${money(item.payableCost)}`
                : undefined
            }
            side="top"
          >
            <span
              className={
                item.payableCost > 0
                  ? "font-mono font-bold text-foreground text-[12px] tabular-nums cursor-default"
                  : "font-mono text-muted-foreground/60 text-[11px] cursor-default"
              }
            >
              {item.payableCost > 0 ? shortMoney(item.payableCost) : "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "cost",
        header: headerFilter.amount(
          "cost",
          t("progress.columns.cost", "Tổng Phải Trả"),
        ),
        size: 195,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const cost = item.cost || 0;
          const paid = item.paidCost || 0;
          const rate =
            item.costPaymentRate || (cost > 0 ? (paid / cost) * 100 : 0);

          return (
            <Tooltip
              content={
                <span className="font-mono text-[11px]">
                  {money(paid)}&nbsp;/&nbsp;{money(cost)}
                </span>
              }
              side="top"
            >
              <div className="flex flex-col gap-1 w-full max-w-[195px] cursor-default">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground text-[11.5px] tracking-tight">
                    {shortMoney(paid)}
                  </span>
                  <span className="text-muted-foreground/75 font-mono text-[10px] font-normal tracking-tight">
                    / {shortMoney(cost)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`font-medium px-1 py-0 text-[10px] border tabular-nums ${getBadgeVariant(rate, false)}`}
                  >
                    {rate.toFixed(1)}%
                  </Badge>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full ${getProgressColor(rate, false)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "withInvoiceCost",
        header: headerFilter.amount(
          "costWithInvoice",
          t("progress.columns.withInvoiceCost", "Có HĐ"),
        ),
        size: 195,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const cost = item.costWithInvoice || 0;
          const paid = item.paidCostWithInvoice || 0;
          const rate = item.costRateWithInvoice || 0;

          return (
            <Tooltip
              content={
                <span className="font-mono text-[11px]">
                  {money(paid)}&nbsp;/&nbsp;{money(cost)}
                </span>
              }
              side="top"
            >
              <div className="flex flex-col gap-1 w-full max-w-[195px] cursor-default">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground text-[11.5px] tracking-tight">
                    {shortMoney(paid)}
                  </span>
                  <span className="text-muted-foreground/75 font-mono text-[10px] font-normal tracking-tight">
                    / {shortMoney(cost)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`font-medium px-1 py-0 text-[10px] border tabular-nums ${getBadgeVariant(rate, false)}`}
                  >
                    {rate.toFixed(1)}%
                  </Badge>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full ${getProgressColor(rate, false)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "noInvoiceCost",
        header: headerFilter.amount(
          "costNoInvoice",
          t("progress.columns.noInvoiceCost", "Không HĐ"),
        ),
        size: 195,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item: GarageTrendItem) => {
          const cost = item.costNoInvoice || 0;
          const paid = item.paidCostNoInvoice || 0;
          const rate = item.costRateNoInvoice || 0;

          return (
            <Tooltip
              content={
                <span className="font-mono text-[11px]">
                  {money(paid)}&nbsp;/&nbsp;{money(cost)}
                </span>
              }
              side="top"
            >
              <div className="flex flex-col gap-1 w-full max-w-[195px] cursor-default">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono font-bold text-foreground text-[11.5px] tracking-tight">
                    {shortMoney(paid)}
                  </span>
                  <span className="text-muted-foreground/75 font-mono text-[10px] font-normal tracking-tight">
                    / {shortMoney(cost)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`font-medium px-1 py-0 text-[10px] border tabular-nums ${getBadgeVariant(rate, false)}`}
                  >
                    {rate.toFixed(1)}%
                  </Badge>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className={`h-full rounded-full ${getProgressColor(rate, false)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          );
        },
      },
    ],
    [headerFilter, t],
  );

  // Summary row for RECEIPT Tab
  const receiptSummaryRow = useMemo(
    () => ({
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      label: (
        <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
          {t("progress.summary.total", "TỔNG CỘNG")}
        </span>
      ),
      caseCount: (
        <span className="font-bold text-center block tabular-nums text-foreground">
          {totalCases} phiếu
        </span>
      ),
      revenue: (
        <span className="font-bold text-right block tabular-nums text-foreground font-mono">
          {money(totalRevenue)}
        </span>
      ),
      tienCoThue: (
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-mono">
            <span className="font-bold text-foreground">
              {money(totalPaid)}
            </span>
            <span className="text-muted-foreground/75 font-normal text-[10px]">
              {" "}
              / {money(totalBilled)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-1.5 py-0 text-[10px] border tabular-nums ${getBadgeVariant(collectionRate, true)} w-fit`}
          >
            {collectionRate.toFixed(1)}%
          </Badge>
        </div>
      ),
      receivable: (
        <span
          className={`font-mono font-bold text-right block tabular-nums text-sm ${
            totalReceivable > 0 ? "text-foreground" : "text-muted-foreground/60"
          }`}
        >
          {money(totalReceivable)}
        </span>
      ),
      withInvoice: (
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-mono">
            <span className="font-bold text-foreground">
              {money(totalPaidWithInvoice)}
            </span>
            <span className="text-muted-foreground/75 font-normal text-[10px]">
              {" "}
              / {money(totalBilledWithInvoice)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-1.5 py-0 text-[10px] border tabular-nums ${getBadgeVariant(overallRateWithInvoice, true)} w-fit`}
          >
            {overallRateWithInvoice.toFixed(1)}%
          </Badge>
        </div>
      ),
      noInvoice: (
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-mono">
            <span className="font-bold text-foreground">
              {money(totalPaidNoInvoice)}
            </span>
            <span className="text-muted-foreground/75 font-normal text-[10px]">
              {" "}
              / {money(totalBilledNoInvoice)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-1.5 py-0 text-[10px] border tabular-nums ${getBadgeVariant(overallRateNoInvoice, true)} w-fit`}
          >
            {overallRateNoInvoice.toFixed(1)}%
          </Badge>
        </div>
      ),
    }),
    [
      totalCases,
      totalRevenue,
      totalBilled,
      totalPaid,
      totalReceivable,
      collectionRate,
      totalPaidWithInvoice,
      totalBilledWithInvoice,
      overallRateWithInvoice,
      totalPaidNoInvoice,
      totalBilledNoInvoice,
      overallRateNoInvoice,
      t,
    ],
  );

  // Summary row for PAYMENT Tab
  const paymentSummaryRow = useMemo(
    () => ({
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      label: (
        <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
          {t("progress.summary.total", "TỔNG CỘNG")}
        </span>
      ),
      caseCount: (
        <span className="font-bold text-center block tabular-nums text-foreground">
          {totalCases} phiếu
        </span>
      ),
      cost: (
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-mono">
            <span className="font-bold text-foreground">
              {money(totalPaidCost)}
            </span>
            <span className="text-muted-foreground/75 font-normal text-[10px]">
              {" "}
              / {money(totalCost)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-1.5 py-0 text-[10px] border tabular-nums ${getBadgeVariant(costPaymentRate, false)} w-fit`}
          >
            {costPaymentRate.toFixed(1)}%
          </Badge>
        </div>
      ),
      payableCost: (
        <span
          className={`font-mono font-bold text-right block tabular-nums text-sm ${
            totalPayableCost > 0
              ? "text-foreground"
              : "text-muted-foreground/60"
          }`}
        >
          {money(totalPayableCost)}
        </span>
      ),
      withInvoiceCost: (
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-mono">
            <span className="font-bold text-foreground">
              {money(totalPaidCostWithInvoice)}
            </span>
            <span className="text-muted-foreground/75 font-normal text-[10px]">
              {" "}
              / {money(totalCostWithInvoice)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-1.5 py-0 text-[10px] border tabular-nums ${getBadgeVariant(overallCostRateWithInvoice, false)} w-fit`}
          >
            {overallCostRateWithInvoice.toFixed(1)}%
          </Badge>
        </div>
      ),
      noInvoiceCost: (
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-mono">
            <span className="font-bold text-foreground">
              {money(totalPaidCostNoInvoice)}
            </span>
            <span className="text-muted-foreground/75 font-normal text-[10px]">
              {" "}
              / {money(totalCostNoInvoice)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`font-medium px-1.5 py-0 text-[10px] border tabular-nums ${getBadgeVariant(overallCostRateNoInvoice, false)} w-fit`}
          >
            {overallCostRateNoInvoice.toFixed(1)}%
          </Badge>
        </div>
      ),
    }),
    [
      totalCases,
      totalCost,
      totalPaidCost,
      totalPayableCost,
      costPaymentRate,
      totalPaidCostWithInvoice,
      totalCostWithInvoice,
      overallCostRateWithInvoice,
      totalPaidCostNoInvoice,
      totalCostNoInvoice,
      overallCostRateNoInvoice,
      t,
    ],
  );

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

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              {isReceipt ? (
                <Wallet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Truck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              )}
              Tiến độ Dòng tiền & Công nợ Dịch vụ
            </h4>
          </div>

          {/* Tab Switcher matching Overview Page */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "RECEIPT" | "PAYMENT")}
          >
            <TabsList className="h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] p-1 gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
              <TabsTrigger
                value="RECEIPT"
                className={cn(
                  "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
                  "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:hover:text-slate-300",
                  "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:font-semibold whitespace-nowrap",
                )}
              >
                <Wallet
                  className={cn(
                    "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                    "w-0 h-0 opacity-0 mr-0",
                    "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
                  )}
                />
                <span className="text-[13px] tracking-tight">
                  {t("progress.tabs.receivable", "Phải Thu")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="PAYMENT"
                className={cn(
                  "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
                  "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:hover:text-slate-300",
                  "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:font-semibold whitespace-nowrap",
                )}
              >
                <Truck
                  className={cn(
                    "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                    "w-0 h-0 opacity-0 mr-0",
                    "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
                  )}
                />
                <span className="text-[13px] tracking-tight">
                  {t("progress.tabs.payable", "Phải Trả")}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
          {/* Progress Bar & Rate Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {isReceipt
                    ? "Tỷ lệ hoàn tất thu tiền dịch vụ"
                    : "Tỷ lệ hoàn tất chi trả chi phí / NCC"}
                </span>
                <Badge
                  variant="outline"
                  className={`font-semibold px-2 py-0.5 text-xs border ${getBadgeVariant(currentRate, isReceipt)}`}
                >
                  {currentRate.toFixed(1)}% Hoàn tất
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {isReceipt ? "Đã thu" : "Đã trả"}{" "}
                <strong className="text-foreground font-bold font-mono">
                  {money(currentPaid)}
                </strong>{" "}
                <span className="text-muted-foreground/75 font-normal font-mono">
                  / Tổng {money(currentTotal)}
                </span>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(currentRate, isReceipt)}`}
                style={{
                  width: `${loading ? 0 : Math.min(100, Math.max(0, currentRate))}%`,
                }}
              />
            </div>
          </div>

          {/* Section: Standardized DataTable Breakdown by Month */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-primary" />
                  Chi tiết{" "}
                  {isReceipt ? "Phải thu & Đã thu" : "Phải trả & Đã trả"} theo
                  từng tháng
                </span>
                {listHook.activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={listHook.resetFilters}
                    className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full"
                  >
                    <span>Xóa bộ lọc ({listHook.activeFilterCount})</span>
                  </button>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                So sánh chi tiết từng tháng (Phải thu = Doanh thu + VAT, Đã thu
                thực tế và Dư nợ)
              </span>
            </div>

            <DataTable
              items={processedItems}
              getRowKey={(item) => item.label}
              variant="spreadsheet"
              emptyLabel={t(
                "progress.empty",
                "Chưa có dữ liệu giao dịch trong kỳ",
              )}
              loading={loading}
              columns={isReceipt ? receiptColumns : paymentColumns}
              summaryRow={isReceipt ? receiptSummaryRow : paymentSummaryRow}
              enableColumnResizing={true}
              tableId={tableId}
              rowHoverActions={getRowActions}
              onRowClick={openMonthDetail}
            />
          </div>

          {/* Footnote Note */}
          <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 italic bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
            <span>*</span>
            <span>
              {isReceipt
                ? "Tổng tiền dịch vụ hiển thị theo đúng số tiền thực tế khách hàng phải thanh toán (Doanh thu thuần + Thuế GTGT VAT). Dữ liệu được tính từ mốc đối soát dòng tiền tháng 07/2026 trở đi."
                : "Tổng chi phí hiển thị theo giá vốn phụ tùng & chi phí gia công thực tế phát sinh. Dữ liệu được tính từ mốc đối soát dòng tiền tháng 07/2026 trở đi."}
            </span>
          </div>
        </div>
      </div>

      {/* Month detail drawer */}
      <GarageMonthDetailDrawer
        open={monthDrawerOpen}
        item={selectedMonth}
        activeTab={activeTab}
        onClose={() => setMonthDrawerOpen(false)}
      />
    </>
  );
}
