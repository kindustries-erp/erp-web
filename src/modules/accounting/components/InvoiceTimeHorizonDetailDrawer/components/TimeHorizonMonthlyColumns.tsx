import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { MonthlyBreakdownRow } from "../types";

export interface CreateMonthlyColumnsParams {
  headerFilter: (
    field: string,
    title: string,
    options?: any,
  ) => React.ReactNode;
  isReceivable: boolean;
  t: (key: string, fallback?: any) => string;
}

export function createTimeHorizonMonthlyColumns({
  headerFilter,
  isReceivable,
  t,
}: CreateMonthlyColumnsParams): DataTableColumn<MonthlyBreakdownRow>[] {
  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      minSize: 40,
      enableResizing: false,
      className:
        "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
      headerClassName: "text-center w-[40px] min-w-[40px]",
      cell: (_, idx) => <span>{idx}</span>,
    },
    {
      key: "monthLabel",
      header: headerFilter(
        "monthLabel",
        t("debts:horizonDrawer.colMonth", "Tháng"),
      ),
      size: 130,
      minSize: 110,
      enableResizing: true,
      cell: (row) => (
        <span className="font-semibold text-xs text-foreground">
          {row.monthLabel}
        </span>
      ),
    },
    {
      key: "invoiceCount",
      header: headerFilter(
        "invoiceCount",
        t("debts:horizonDrawer.colInvoiceCount", "Số lượng HĐ"),
      ),
      size: 100,
      minSize: 85,
      enableResizing: true,
      className: "text-center font-mono text-xs text-muted-foreground",
      headerClassName: "text-center",
      cell: (row) => <span>{row.invoiceCount}</span>,
    },
    {
      key: "totalAmount",
      header: headerFilter(
        "totalAmount",
        t("debts:horizonDrawer.colTotalAmount", "Tổng phát sinh"),
      ),
      size: 135,
      minSize: 115,
      enableResizing: true,
      className: "text-right font-mono text-xs tabular-nums font-medium",
      headerClassName: "text-right",
      cell: (row) => <span>{money(row.totalAmount)}</span>,
    },
    {
      key: "paidAmount",
      header: headerFilter(
        "paidAmount",
        isReceivable
          ? t("debts:horizonDrawer.colPaidOut", "Đã thu")
          : t("debts:horizonDrawer.colPaidIn", "Đã trả"),
      ),
      size: 130,
      minSize: 110,
      enableResizing: true,
      className:
        "text-right font-mono text-xs tabular-nums text-muted-foreground",
      headerClassName: "text-right",
      cell: (row) => <span>{money(row.paidAmount)}</span>,
    },
    {
      key: "balanceAmount",
      header: headerFilter(
        "balanceAmount",
        t("debts:horizonDrawer.colBalanceAmount", "Còn nợ"),
      ),
      size: 135,
      minSize: 115,
      enableResizing: true,
      className: "text-right font-mono text-xs tabular-nums font-semibold",
      headerClassName: "text-right",
      cell: (row) => (
        <span
          className={cn(
            isReceivable
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          {money(row.balanceAmount)}
        </span>
      ),
    },
    {
      key: "rate",
      header: headerFilter(
        "rate",
        t("debts:horizonDrawer.colCompletionRate", "Tỷ lệ hoàn tất"),
      ),
      size: 110,
      minSize: 95,
      enableResizing: true,
      className: "text-center",
      headerClassName: "text-center",
      cell: (row) => {
        const isHigh = row.rate >= 80;
        const isLow = row.rate < 40;
        return (
          <Badge
            variant={isHigh ? "default" : isLow ? "destructive" : "secondary"}
            className="font-mono text-[10px]"
          >
            {row.rate}%
          </Badge>
        );
      },
    },
  ];
}
