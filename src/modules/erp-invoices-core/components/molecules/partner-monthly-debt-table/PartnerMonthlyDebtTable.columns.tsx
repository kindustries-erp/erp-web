import React from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { TableColumnHeaderFilterProps } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { MonthlyDebtTableRow } from "./PartnerMonthlyDebtTable.type";

export interface MonthlyTableSummaryTotals {
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  rate: number;
}

export function getMonthlyDebtTableColumns(
  headerFilter: (
    col: string,
    label: string,
    options?: Partial<TableColumnHeaderFilterProps>,
  ) => any,
  isCustomer: boolean,
  t: TFunction,
): DataTableColumn<MonthlyDebtTableRow>[] {
  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      minSize: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className:
        "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
      cell: (_, idx) => <span className="w-full block text-center">{idx}</span>,
    },
    {
      key: "monthLabel",
      header: headerFilter("monthLabel", t("debts:drawer.month", "Tháng"), {
        align: "center",
      }),
      size: 110,
      minSize: 100,
      enableResizing: true,
      className: "text-center font-medium font-mono text-xs",
      cell: (row) => (
        <span className="font-semibold text-xs text-foreground font-mono">
          {row.monthLabel}
        </span>
      ),
    },
    {
      key: "invoiceCount",
      header: (headerFilter as any).qty(
        "invoiceCount",
        t("debts:drawer.invoiceCount", "Số HĐ"),
      ),
      size: 90,
      minSize: 80,
      enableResizing: true,
      className: "text-right font-mono text-xs",
      cell: (row) => (
        <span className="tabular-nums font-mono text-muted-foreground">
          {row.invoiceCount}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: (headerFilter as any).amount(
        "totalAmount",
        t("debts:drawer.totalAmount", "Tổng tiền"),
      ),
      size: 140,
      minSize: 120,
      enableResizing: true,
      className: "text-right font-mono text-xs",
      cell: (row) => (
        <span className="tabular-nums font-mono font-semibold text-foreground">
          {money(row.totalAmount)}
        </span>
      ),
    },
    {
      key: "paidAmount",
      header: (headerFilter as any).amount(
        "paidAmount",
        isCustomer
          ? t("debts:drawer.collectedAmount", "Đã thu")
          : t("debts:drawer.paidAmount", "Đã trả"),
      ),
      size: 140,
      minSize: 120,
      enableResizing: true,
      className: "text-right font-mono text-xs",
      cell: (row) => (
        <span className="tabular-nums font-mono font-medium text-emerald-700 dark:text-emerald-400">
          {money(row.paidAmount)}
        </span>
      ),
    },
    {
      key: "balanceAmount",
      header: (headerFilter as any).amount(
        "balanceAmount",
        t("debts:drawer.balanceAmount", "Còn nợ"),
      ),
      size: 140,
      minSize: 120,
      enableResizing: true,
      className: "text-right font-mono text-xs",
      cell: (row) => (
        <span
          className={cn(
            "tabular-nums font-mono font-semibold",
            row.balanceAmount > 0
              ? "text-amber-600 dark:text-amber-400 font-bold"
              : "text-muted-foreground",
          )}
        >
          {money(row.balanceAmount)}
        </span>
      ),
    },
    {
      key: "rate",
      header: (headerFilter as any).numeric(
        "rate",
        isCustomer
          ? t("debts:drawer.recoveryRate", "Tỷ lệ thu")
          : t("debts:drawer.paymentRate", "Tỷ lệ trả"),
        {
          align: "right",
          formatOptionLabel: (v: any) => `${Number(v).toFixed(0)}%`,
        },
      ),
      size: 125,
      minSize: 110,
      enableResizing: true,
      className: "text-right text-xs",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5 w-full">
          <span className="font-mono tabular-nums text-xs">{row.rate}%</span>
          <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                row.rate >= 100
                  ? "bg-emerald-500"
                  : row.rate > 0
                    ? "bg-emerald-600"
                    : "bg-transparent",
              )}
              style={{ width: `${Math.min(100, Math.max(0, row.rate))}%` }}
            />
          </div>
        </div>
      ),
    },
  ];
}
