import React, { useState, useMemo } from "react";
import { Wallet, Truck, Table as TableIcon, Eye } from "lucide-react";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { cn } from "@/shared/utils";

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
        paid: (item) => item.paid || 0,
        receivable: (item) => item.receivable || 0,
        receivableWithInvoice: (item) => item.receivableWithInvoice || 0,
        receivableNoInvoice: (item) => item.receivableNoInvoice || 0,
        cost: (item) => item.cost || 0,
        paidCost: (item) => item.paidCost || 0,
        payableCost: (item) => item.payableCost || 0,
        payableCostWithInvoice: (item) => item.payableCostWithInvoice || 0,
        payableCostNoInvoice: (item) => item.payableCostNoInvoice || 0,
        revenue: (item) => item.revenue || 0,
      },
    });
  }, [effectiveTrend, listHook]);

  const totals = useMemo(() => {
    return processedItems.reduce(
      (acc, item) => ({
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
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (item: GarageTrendItem) => (
          <div
            className="flex items-center justify-center gap-1.5 cursor-pointer group/month"
            onClick={() => openMonthDetail(item)}
          >
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
        size: 110,
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
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-medium tabular-nums text-foreground font-mono",
        cell: (item: GarageTrendItem) => money(item.revenue),
      },
      {
        key: "tienCoThue",
        header: headerFilter.amount(
          "tienCoThue",
          t("progress.columns.totalBilled", "Tổng Phải Thu"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-medium tabular-nums text-foreground font-mono",
        cell: (item: GarageTrendItem) => {
          const total = item.tienCoThue || item.totalBilled || 0;
          const paid = item.paid || 0;
          const bal = item.receivable || 0;
          if (total <= 0) {
            return (
              <span className="text-muted-foreground/40 font-normal select-none">
                —
              </span>
            );
          }
          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && total > 0;
          const rate =
            item.collectionRate ?? (total > 0 ? (paid / total) * 100 : 0);

          const tooltipText = isAllPaid
            ? `Đã thu đủ 100%: ${money(paid)}`
            : isUnpaid
              ? `Chưa thu (0%): Còn phải thu ${money(bal)} / Tổng ${money(total)}`
              : `Đã thu: ${money(paid)} / ${money(total)} (${rate.toFixed(1)}%) • Còn phải thu: ${money(bal)}`;

          return (
            <Tooltip content={tooltipText} side="top">
              <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAllPaid
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : isUnpaid
                          ? "bg-transparent"
                          : "bg-emerald-600 dark:bg-emerald-500",
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "paid",
        header: headerFilter.amount(
          "paid",
          t("progress.columns.paid", "Đã Thu"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-medium tabular-nums text-foreground font-mono",
        cell: (item: GarageTrendItem) => money(item.paid || 0),
      },
      {
        key: "receivable",
        header: headerFilter.amount(
          "receivable",
          t("progress.columns.receivable", "Còn Phải Thu"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (item: GarageTrendItem) => {
          const val = item.receivable || 0;
          return (
            <Tooltip
              content={val > 0 ? `Còn phải thu: ${money(val)}` : undefined}
              side="top"
            >
              <span
                className={
                  val > 0
                    ? "font-mono font-bold text-foreground text-[12px] tabular-nums cursor-default"
                    : "font-mono text-muted-foreground/60 text-[11px] cursor-default"
                }
              >
                {val > 0 ? money(val) : "—"}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "receivableWithInvoice",
        header: headerFilter.amount(
          "receivableWithInvoice",
          t("progress.columns.receivableWithInvoice", "Còn Phải Thu Có HĐ"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums font-mono",
        cell: (item: GarageTrendItem) => {
          const val = item.receivableWithInvoice || 0;
          return (
            <span
              className={
                val > 0
                  ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
                  : "font-mono text-muted-foreground/60 text-[11px]"
              }
            >
              {val > 0 ? money(val) : "—"}
            </span>
          );
        },
      },
      {
        key: "receivableNoInvoice",
        header: headerFilter.amount(
          "receivableNoInvoice",
          t("progress.columns.receivableNoInvoice", "Còn Phải Thu Không HĐ"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums font-mono",
        cell: (item: GarageTrendItem) => {
          const val = item.receivableNoInvoice || 0;
          return (
            <span
              className={
                val > 0
                  ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
                  : "font-mono text-muted-foreground/60 text-[11px]"
              }
            >
              {val > 0 ? money(val) : "—"}
            </span>
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
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center font-medium",
        cell: (item: GarageTrendItem) => (
          <div
            className="flex items-center justify-center gap-1.5 cursor-pointer group/month"
            onClick={() => openMonthDetail(item)}
          >
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
        size: 110,
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
        key: "cost",
        header: headerFilter.amount(
          "cost",
          t("progress.columns.cost", "Tổng Phải Trả"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-medium tabular-nums text-foreground font-mono",
        cell: (item: GarageTrendItem) => {
          const total = item.cost || 0;
          const paid = item.paidCost || 0;
          const bal = item.payableCost || 0;
          if (total <= 0) {
            return (
              <span className="text-muted-foreground/40 font-normal select-none">
                —
              </span>
            );
          }
          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && total > 0;
          const rate =
            item.costPaymentRate ?? (total > 0 ? (paid / total) * 100 : 0);

          const tooltipText = isAllPaid
            ? `Đã trả đủ 100%: ${money(paid)}`
            : isUnpaid
              ? `Chưa trả (0%): Còn phải trả ${money(bal)} / Tổng ${money(total)}`
              : `Đã trả: ${money(paid)} / ${money(total)} (${rate.toFixed(1)}%) • Còn phải trả: ${money(bal)}`;

          return (
            <Tooltip content={tooltipText} side="top">
              <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAllPaid
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : isUnpaid
                          ? "bg-transparent"
                          : "bg-slate-600 dark:bg-slate-400",
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "paidCost",
        header: headerFilter.amount(
          "paidCost",
          t("progress.columns.paidCost", "Đã Trả"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-right font-medium tabular-nums text-foreground font-mono",
        cell: (item: GarageTrendItem) => money(item.paidCost || 0),
      },
      {
        key: "payableCost",
        header: headerFilter.amount(
          "payableCost",
          t("progress.columns.payableCost", "Còn Phải Trả"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (item: GarageTrendItem) => {
          const val = item.payableCost || 0;
          return (
            <Tooltip
              content={val > 0 ? `Còn phải trả: ${money(val)}` : undefined}
              side="top"
            >
              <span
                className={
                  val > 0
                    ? "font-mono font-bold text-foreground text-[12px] tabular-nums cursor-default"
                    : "font-mono text-muted-foreground/60 text-[11px] cursor-default"
                }
              >
                {val > 0 ? money(val) : "—"}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "payableCostWithInvoice",
        header: headerFilter.amount(
          "payableCostWithInvoice",
          t("progress.columns.payableCostWithInvoice", "Còn Phải Trả Có HĐ"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums font-mono",
        cell: (item: GarageTrendItem) => {
          const val = item.payableCostWithInvoice || 0;
          return (
            <span
              className={
                val > 0
                  ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
                  : "font-mono text-muted-foreground/60 text-[11px]"
              }
            >
              {val > 0 ? money(val) : "—"}
            </span>
          );
        },
      },
      {
        key: "payableCostNoInvoice",
        header: headerFilter.amount(
          "payableCostNoInvoice",
          t("progress.columns.payableCostNoInvoice", "Còn Phải Trả Không HĐ"),
        ),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right font-medium tabular-nums font-mono",
        cell: (item: GarageTrendItem) => {
          const val = item.payableCostNoInvoice || 0;
          return (
            <span
              className={
                val > 0
                  ? "font-mono font-bold text-foreground text-[12px] tabular-nums"
                  : "font-mono text-muted-foreground/60 text-[11px]"
              }
            >
              {val > 0 ? money(val) : "—"}
            </span>
          );
        },
      },
    ],
    [headerFilter, t],
  );

  // Summary row for RECEIPT Tab (Khách hàng)
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
          {totals.caseCount} phiếu
        </span>
      ),
      revenue: (
        <span className="font-bold text-right block tabular-nums text-foreground font-mono">
          {money(totals.revenue)}
        </span>
      ),
      tienCoThue: (
        <Tooltip
          content={
            totals.billed > 0
              ? `Đã thu: ${money(totals.paid)} / ${money(totals.billed)} (${(totals.billed > 0 ? (totals.paid / totals.billed) * 100 : 0).toFixed(1)}%) • Còn phải thu: ${money(totals.receivable)}`
              : undefined
          }
          side="top"
        >
          <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
            <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
              <span className="font-bold text-foreground font-mono">
                {money(totals.billed)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  totals.receivable <= 0 && totals.paid > 0
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : totals.paid <= 0
                      ? "bg-transparent"
                      : "bg-emerald-600 dark:bg-emerald-500",
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, totals.billed > 0 ? (totals.paid / totals.billed) * 100 : 0))}%`,
                }}
              />
            </div>
          </div>
        </Tooltip>
      ),
      paid: (
        <span className="font-bold text-right block tabular-nums text-foreground font-mono">
          {money(totals.paid)}
        </span>
      ),
      receivable: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.receivable > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {money(totals.receivable)}
        </span>
      ),
      receivableWithInvoice: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.receivableWithInvoice > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {money(totals.receivableWithInvoice)}
        </span>
      ),
      receivableNoInvoice: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.receivableNoInvoice > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {money(totals.receivableNoInvoice)}
        </span>
      ),
    }),
    [totals, t],
  );

  // Summary row for PAYMENT Tab (Nhà cung cấp / Chi phí)
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
          {totals.caseCount} phiếu
        </span>
      ),
      cost: (
        <Tooltip
          content={
            totals.cost > 0
              ? `Đã trả: ${money(totals.paidCost)} / ${money(totals.cost)} (${(totals.cost > 0 ? (totals.paidCost / totals.cost) * 100 : 0).toFixed(1)}%) • Còn phải trả: ${money(totals.payableCost)}`
              : undefined
          }
          side="top"
        >
          <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
            <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
              <span className="font-bold text-foreground font-mono">
                {money(totals.cost)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  totals.payableCost <= 0 && totals.paidCost > 0
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : totals.paidCost <= 0
                      ? "bg-transparent"
                      : "bg-slate-600 dark:bg-slate-400",
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, totals.cost > 0 ? (totals.paidCost / totals.cost) * 100 : 0))}%`,
                }}
              />
            </div>
          </div>
        </Tooltip>
      ),
      paidCost: (
        <span className="font-bold text-right block tabular-nums text-foreground font-mono">
          {money(totals.paidCost)}
        </span>
      ),
      payableCost: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.payableCost > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {money(totals.payableCost)}
        </span>
      ),
      payableCostWithInvoice: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.payableCostWithInvoice > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {money(totals.payableCostWithInvoice)}
        </span>
      ),
      payableCostNoInvoice: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.payableCostNoInvoice > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {money(totals.payableCostNoInvoice)}
        </span>
      ),
    }),
    [totals, t],
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
          <PillTabs<"RECEIPT" | "PAYMENT">
            value={activeTab}
            onValueChange={setActiveTab}
            size="sm"
            items={[
              {
                value: "RECEIPT",
                label: t("progress.tabs.receivable", "Phải Thu"),
                icon: Wallet,
              },
              {
                value: "PAYMENT",
                label: t("progress.tabs.payable", "Phải Trả"),
                icon: Truck,
              },
            ]}
            className="w-auto"
          />
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
