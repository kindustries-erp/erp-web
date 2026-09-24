import React from "react";
import type { TFunction } from "i18next";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { formatMonth } from "./paymentProgressHelpers";

export function getPaymentColumns(
  headerFilter: any,
  t: TFunction,
  openMonthDetail: (item: GarageTrendItem) => void,
): DataTableColumn<GarageTrendItem>[] {
  return [
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
      header: headerFilter.month("label", t("progress.columns.month", "Tháng")),
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
  ];
}
