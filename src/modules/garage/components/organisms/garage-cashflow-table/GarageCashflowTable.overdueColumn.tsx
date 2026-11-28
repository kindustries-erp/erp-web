import React from "react";
import {
  ColumnValueType,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import type { CashflowTranslate } from "./GarageCashflowTable.options";

const OPTION_KEY = "garage.cashflow.optionLabels.overdue";
const DAY_MS = 86_400_000;

/** Số ngày quá hạn = hôm nay (giờ VN) − ngày dự thu chi. Cùng cách tính với bộ lọc ở API. */
export function getOverdueDays(
  transDate: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const due = Date.parse(`${(transDate || "").slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(due)) return null;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(now);
  return Math.round((Date.parse(`${today}T00:00:00Z`) - due) / DAY_MS);
}

/** Giá trị khớp tham số `overdueDays` của API. */
export const getOverdueOptions = (tr: CashflowTranslate) => [
  { label: tr(`${OPTION_KEY}.notDue`, "Chưa đến hạn"), value: "NOT_DUE" },
  { label: tr(`${OPTION_KEY}.d1_30`, "1–30 ngày"), value: "D1_30" },
  { label: tr(`${OPTION_KEY}.d31_90`, "31–90 ngày"), value: "D31_90" },
  { label: tr(`${OPTION_KEY}.d90Plus`, "Trên 90 ngày"), value: "D90_PLUS" },
];

const overdueClass = (days: number): string => {
  if (days > 90) return "text-rose-600 dark:text-rose-400 font-semibold";
  if (days > 30) return "text-orange-600 dark:text-orange-400 font-medium";
  return "text-amber-600 dark:text-amber-400";
};

export const renderOverdueCell = (
  row: GarageCashflowVoucher,
  tr: CashflowTranslate,
) => {
  const days = getOverdueDays(row.transDate);
  if (days === null) return <span className="text-muted-foreground">—</span>;
  if (days <= 0) {
    return (
      <span className="text-muted-foreground text-xs">
        {tr(`${OPTION_KEY}.notDue`, "Chưa đến hạn")}
      </span>
    );
  }
  return <span className={`tabular-nums ${overdueClass(days)}`}>{days}</span>;
};

export const createOverdueColumn = (
  filterBuilder: any,
  tr: CashflowTranslate,
): DataTableColumn<GarageCashflowVoucher> => ({
  key: "overdueDays",
  size: 130,
  className: "text-right",
  headerClassName: "text-right",
  header: filterBuilder(
    "overdueDays",
    tr("garage.cashflow.columns.overdueDays", "Quá hạn (ngày)"),
    {
      valueType: ColumnValueType.SELECT,
      filterOptions: getOverdueOptions(tr),
      enableSelectAllMatching: false,
    },
  ),
  cell: (row) => renderOverdueCell(row, tr),
});
