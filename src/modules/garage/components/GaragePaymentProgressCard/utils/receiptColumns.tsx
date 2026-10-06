import React from "react";
import type { TFunction } from "i18next";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { formatMonth } from "./paymentProgressHelpers";
import { PaymentTotalBilledCell } from "../components/PaymentTotalBilledCell";
import { PaymentExcludedDebtCell } from "../components/PaymentExcludedDebtCell";

export function getReceiptColumns(
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
      key: "revenue",
      header: headerFilter.amount(
        "revenue",
        t("progress.columns.revenue", "Doanh Thu"),
      ),
      size: 180,
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
      size: 190,
      enableResizing: true,
      headerClassName: "text-center",
      className:
        "text-right font-medium tabular-nums text-foreground font-mono",
      cell: (item: GarageTrendItem) => <PaymentTotalBilledCell item={item} />,
    },
    {
      key: "paid",
      header: headerFilter.amount("paid", t("progress.columns.paid", "Đã Thu")),
      size: 180,
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
      size: 180,
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
      size: 170,
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
      size: 170,
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
    {
      key: "excludedDebtAmount",
      header: headerFilter.amount(
        "excludedDebtAmount",
        t("progress.columns.excludedDebt", "Không Theo Dõi Công Nợ"),
      ),
      size: 170,
      enableResizing: true,
      headerClassName: "text-center",
      className: "text-right font-medium tabular-nums font-mono",
      cell: (item: GarageTrendItem) => (
        <PaymentExcludedDebtCell
          amount={item.excludedDebtAmount}
          caseCount={item.excludedDebtCaseCount}
          labelTooltipPrefix={t(
            "progress.columns.excludedDebt",
            "Không theo dõi công nợ",
          )}
        />
      ),
    },
  ];
}
