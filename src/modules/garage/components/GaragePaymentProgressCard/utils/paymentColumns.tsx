import React from "react";
import type { TFunction } from "i18next";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { formatMonth } from "./paymentProgressHelpers";
import { PaymentTotalCostCell } from "../components/PaymentTotalCostCell";
import { PaymentExcludedDebtCell } from "../components/PaymentExcludedDebtCell";

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
      size: 190,
      enableResizing: true,
      headerClassName: "text-center",
      className:
        "text-right font-medium tabular-nums text-foreground font-mono",
      cell: (item: GarageTrendItem) => <PaymentTotalCostCell item={item} />,
    },
    {
      key: "paidCost",
      header: headerFilter.amount(
        "paidCost",
        t("progress.columns.paidCost", "Đã Trả"),
      ),
      size: 180,
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
      size: 180,
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
      size: 170,
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
      size: 170,
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
    {
      key: "excludedDebtCost",
      header: headerFilter.amount(
        "excludedDebtCost",
        t("progress.columns.excludedDebtCost", "Không Theo Dõi Công Nợ"),
      ),
      size: 170,
      enableResizing: true,
      headerClassName: "text-center",
      className: "text-right font-medium tabular-nums font-mono",
      cell: (item: GarageTrendItem) => (
        <PaymentExcludedDebtCell
          amount={item.excludedDebtCost}
          labelTooltipPrefix={t(
            "progress.columns.excludedDebtCost",
            "Không theo dõi công nợ",
          )}
        />
      ),
    },
  ];
}
