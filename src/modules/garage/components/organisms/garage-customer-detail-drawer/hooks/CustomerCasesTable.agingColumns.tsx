import React from "react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { AgingDaysCell } from "../../garage-debts-table/GarageDebtsAgingCell";

interface CreateCustomerCasesAgingColumnsProps {
  headerFilter: any;
  debtType?: "receivables" | "payables";
  t: (key: string, fallback: string) => string;
}

export function createCustomerCasesAgingColumns({
  headerFilter,
  debtType = "receivables",
  t,
}: CreateCustomerCasesAgingColumnsProps): DataTableColumn<any>[] {
  const isPayables = debtType === "payables";

  const getAgingBuckets = (row: any) => {
    const bal = isPayables
      ? Number(row.tienConPhaiChi) || 0
      : Number(row.tienConPhaiThanhToan) || 0;
    const agingDays = Number(row.agingDays) || 0;

    return {
      bal,
      agingDays,
      a0_30: bal > 0 && agingDays <= 30 ? bal : 0,
      a31_60: bal > 0 && agingDays > 30 && agingDays <= 60 ? bal : 0,
      a61_90: bal > 0 && agingDays > 60 && agingDays <= 90 ? bal : 0,
      aOver90: bal > 0 && agingDays > 90 ? bal : 0,
    };
  };

  return [
    {
      key: "aging0_30",
      className:
        "text-right bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs",
      headerClassName:
        "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-right justify-end",
      header: headerFilter.amount(
        "aging0_30",
        t("payables.columns.aging0_30", "0-30 ngày"),
      ),
      size: 120,
      minSize: 110,
      enableResizing: true,
      cell: (row: any) => {
        const { a0_30 } = getAgingBuckets(row);
        return a0_30 !== 0 ? (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {money(a0_30)}
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
      header: headerFilter.amount(
        "aging31_60",
        t("payables.columns.aging31_60", "31-60 ngày"),
      ),
      size: 120,
      minSize: 110,
      enableResizing: true,
      cell: (row: any) => {
        const { a31_60 } = getAgingBuckets(row);
        return a31_60 !== 0 ? (
          <span className="font-semibold text-amber-800 dark:text-amber-300 tabular-nums">
            {money(a31_60)}
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
      header: headerFilter.amount(
        "aging61_90",
        t("payables.columns.aging61_90", "61-90 ngày"),
      ),
      size: 120,
      minSize: 110,
      enableResizing: true,
      cell: (row: any) => {
        const { a61_90 } = getAgingBuckets(row);
        return a61_90 !== 0 ? (
          <span className="font-semibold text-orange-700 dark:text-orange-400 tabular-nums">
            {money(a61_90)}
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
      header: headerFilter.amount(
        "agingOver90",
        t("payables.columns.agingOver90", ">90 ngày"),
      ),
      size: 125,
      minSize: 115,
      enableResizing: true,
      cell: (row: any) => {
        const { aOver90 } = getAgingBuckets(row);
        return aOver90 !== 0 ? (
          <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
            {money(aOver90)}
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
      header: headerFilter(
        "maxAgingDays",
        t("payables.columns.maxAgingDays", "Tuổi nợ & Rủi ro"),
      ),
      size: 160,
      minSize: 140,
      enableResizing: true,
      cell: (row: any) => {
        const { bal, agingDays, a0_30, a31_60, a61_90, aOver90 } =
          getAgingBuckets(row);
        return (
          <AgingDaysCell
            row={{
              balanceAmount: bal,
              maxAgingDays: agingDays,
              aging0_30: a0_30,
              aging31_60: a31_60,
              aging61_90: a61_90,
              agingOver90: aOver90,
            }}
            t={t}
          />
        );
      },
    },
  ];
}
