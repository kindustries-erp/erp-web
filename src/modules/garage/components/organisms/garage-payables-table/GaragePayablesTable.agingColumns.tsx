import React from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import type { SupplierDebtItem } from "./GaragePayablesTable.type";
import { SupplierAgingDaysCell } from "./GaragePayablesTable.cells";

interface CreateAgingColumnsProps {
  createFilterProps: (columnKey: string, queryPrefix: string) => any;
  t: (key: string, fallback: string) => string;
}

export function createAgingColumns({
  createFilterProps,
  t,
}: CreateAgingColumnsProps): DataTableColumn<SupplierDebtItem>[] {
  return [
    {
      key: "aging0_30",
      className:
        "text-right bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs",
      headerClassName:
        "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-right justify-end",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.aging0_30", "0-30 ngày")}
          {...createFilterProps("aging0_30", "garage-aging0-30-options")}
          align="right"
        />
      ),
      size: 145,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => {
        const val = Number(row.aging0_30) || 0;
        return val > 0 ? (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {money(val)}
          </span>
        ) : (
          <span className="text-muted-foreground/30 font-normal select-none">
            —
          </span>
        );
      },
    },
    {
      key: "aging31_60",
      className:
        "text-right bg-amber-50/40 dark:bg-amber-950/20 font-mono text-xs",
      headerClassName:
        "bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-right justify-end",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.aging31_60", "31-60 ngày")}
          {...createFilterProps("aging31_60", "garage-aging31-60-options")}
          align="right"
        />
      ),
      size: 145,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => {
        const val = Number(row.aging31_60) || 0;
        return val > 0 ? (
          <span className="font-semibold text-amber-800 dark:text-amber-300 tabular-nums">
            {money(val)}
          </span>
        ) : (
          <span className="text-muted-foreground/30 font-normal select-none">
            —
          </span>
        );
      },
    },
    {
      key: "aging61_90",
      className:
        "text-right bg-orange-50/40 dark:bg-orange-950/20 font-mono text-xs",
      headerClassName:
        "bg-orange-50/80 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-semibold text-right justify-end",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.aging61_90", "61-90 ngày")}
          {...createFilterProps("aging61_90", "garage-aging61-90-options")}
          align="right"
        />
      ),
      size: 145,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => {
        const val = Number(row.aging61_90) || 0;
        return val > 0 ? (
          <span className="font-semibold text-orange-700 dark:text-orange-400 tabular-nums">
            {money(val)}
          </span>
        ) : (
          <span className="text-muted-foreground/30 font-normal select-none">
            —
          </span>
        );
      },
    },
    {
      key: "agingOver90",
      className:
        "text-right bg-rose-50/40 dark:bg-rose-950/20 font-mono text-xs",
      headerClassName:
        "bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold text-right justify-end",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.agingOver90", ">90 ngày")}
          {...createFilterProps("agingOver90", "garage-agingOver90-options")}
          align="right"
        />
      ),
      size: 150,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => {
        const val = Number(row.agingOver90) || 0;
        return val > 0 ? (
          <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
            {money(val)}
          </span>
        ) : (
          <span className="text-muted-foreground/30 font-normal select-none">
            —
          </span>
        );
      },
    },
    {
      key: "maxAgingDays",
      className: "text-left",
      header: (
        <TableColumnHeaderFilter
          title={t("payables.columns.maxAgingDays", "Tuổi nợ & Rủi ro")}
          {...createFilterProps("maxAgingDays", "garage-maxAging-options")}
          align="center"
        />
      ),
      size: 210,
      minSize: 180,
      enableResizing: true,
      cell: (row: SupplierDebtItem) => (
        <SupplierAgingDaysCell row={row} t={t} />
      ),
    },
  ];
}
