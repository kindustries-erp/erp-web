import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ForecastScheduleRow } from "../types";

export interface CreateScheduleColumnsParams {
  headerFilter: (
    field: string,
    title: string,
    options?: any,
  ) => React.ReactNode;
  isReceivable?: boolean;
  t: (key: string, fallback?: any) => string;
}

export function createTimeHorizonScheduleColumns({
  headerFilter,
  t,
}: CreateScheduleColumnsParams): DataTableColumn<ForecastScheduleRow>[] {
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
      key: "displayDate",
      header: headerFilter(
        "displayDate",
        t("debts:horizonDrawer.forecastColDate", "Ngày dự kiến"),
      ),
      size: 140,
      minSize: 120,
      enableResizing: true,
      cell: (row) => {
        const isOverdue = row.dateKey === "OVERDUE";
        return isOverdue ? (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-medium"
          >
            {row.displayDate}
          </Badge>
        ) : (
          <span className="font-medium text-xs text-foreground">
            {row.displayDate}
          </span>
        );
      },
    },
    {
      key: "receivable",
      header: headerFilter(
        "receivable",
        t("debts:horizonDrawer.forecastColReceivable", "Dự thu"),
      ),
      size: 130,
      minSize: 110,
      enableResizing: true,
      className:
        "text-right font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold",
      headerClassName: "text-right",
      cell: (row) => <span>+{money(row.receivable)}</span>,
    },
    {
      key: "payable",
      header: headerFilter(
        "payable",
        t("debts:horizonDrawer.forecastColPayable", "Dự chi"),
      ),
      size: 130,
      minSize: 110,
      enableResizing: true,
      className:
        "text-right font-mono text-xs tabular-nums text-amber-700 dark:text-amber-400 font-semibold",
      headerClassName: "text-right",
      cell: (row) => <span>-{money(row.payable)}</span>,
    },
    {
      key: "net",
      header: headerFilter(
        "net",
        t("debts:horizonDrawer.forecastColNet", "Vị thế ròng"),
      ),
      size: 135,
      minSize: 115,
      enableResizing: true,
      className: "text-right font-mono text-xs tabular-nums font-bold",
      headerClassName: "text-right",
      cell: (row) => (
        <span
          className={cn(
            row.net >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          {row.net >= 0 ? "+" : ""}
          {money(row.net)}
        </span>
      ),
    },
    {
      key: "invoiceCount",
      header: headerFilter(
        "invoiceCount",
        t("debts:horizonDrawer.forecastColInvoices", "Số HĐ"),
      ),
      size: 80,
      minSize: 70,
      enableResizing: true,
      className: "text-center font-mono text-xs text-muted-foreground",
      headerClassName: "text-center",
      cell: (row) => <span>{row.invoiceCount}</span>,
    },
  ];
}
