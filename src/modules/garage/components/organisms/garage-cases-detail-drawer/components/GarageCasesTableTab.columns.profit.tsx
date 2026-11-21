import React from "react";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { money } from "@/shared/utils/format";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

type Translate = (key: string, fallback: string) => string;

/** Cột "Số lệnh" (chỉ chế độ có chỉ số lợi nhuận). */
export function createCaseCountColumn(
  t: Translate,
): V2Column<GarageCaseDetailRow> {
  return {
    key: "caseCount",
    label: t("cases.columns.caseCount", "Số lệnh"),
    size: 80,
    align: TableColumnAlign.CENTER,
    className: "text-center text-xs font-mono font-bold tabular-nums",
    cell: (row: GarageCaseDetailRow) => row.caseCount ?? 1,
    summary: {
      variant: "amount" as const,
      accessor: (r: GarageCaseDetailRow) => r.caseCount ?? 1,
    },
  } as V2Column<GarageCaseDetailRow>;
}

/** Ba cột doanh thu, chi phí, lợi nhuận gộp. */
export function createProfitColumns(
  t: Translate,
): V2Column<GarageCaseDetailRow>[] {
  return [
    {
      key: "revenue",
      label: t("cases.columns.revenue", "Doanh thu thuần"),
      size: 125,
      align: TableColumnAlign.RIGHT,
      className:
        "text-right font-mono font-semibold text-xs tabular-nums text-foreground",
      cell: (row) => money(row.revenue ?? 0),
      summary: {
        variant: "amount",
        accessor: (r) => r.revenue ?? 0,
      },
    },
    {
      key: "cost",
      label: t("cases.columns.cost", "Chi phí"),
      size: 120,
      align: TableColumnAlign.RIGHT,
      className:
        "text-right font-mono font-semibold text-xs tabular-nums text-muted-foreground",
      cell: (row) => money(row.cost ?? 0),
      summary: {
        variant: "amount",
        accessor: (r) => r.cost ?? 0,
      },
    },
    {
      key: "profit",
      label: t("cases.columns.profit", "Lợi nhuận gộp"),
      size: 125,
      align: TableColumnAlign.RIGHT,
      className: "text-right font-mono font-bold text-xs tabular-nums",
      cell: (row) => {
        const val = row.profit ?? 0;
        return (
          <span
            className={
              val >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600"
            }
          >
            {money(val)}
          </span>
        );
      },
      summary: {
        variant: "amount",
        accessor: (r) => r.profit ?? 0,
      },
    },
  ];
}
