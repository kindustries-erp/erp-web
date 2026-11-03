import type { LedgerDisplayRow } from "./fifoTransform";

export const QTY_FILTER_COLUMNS = ["inQty", "outQty", "balanceQty"];

export const MONEY_FILTER_COLUMNS = [
  "inTotal",
  "outCogs",
  "balanceValue",
  "outRevenue",
  "outProfit",
  "inUnitCost",
  "outUnitCost",
  "outSellPrice",
];

export function formatQty(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatMoney(value: number): string {
  return value.toLocaleString() + " ₫";
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + "%";
}

/** Chuỗi hiển thị của một ô để so khớp với lựa chọn lọc. */
export function formatFilterValue(column: string, value: unknown): string {
  const raw = String(value || "");
  if (QTY_FILTER_COLUMNS.includes(column)) {
    return formatQty(Number(value || 0));
  }
  if (MONEY_FILTER_COLUMNS.includes(column)) {
    return formatMoney(Number(value || 0));
  }
  if (column === "outMargin") {
    return formatPercent(Number(value || 0));
  }
  return raw;
}

function matchesDateRange(row: LedgerDisplayRow, range: string): boolean {
  const [from, to] = range.split("|");
  if (!from && !to) return true;
  if (!row.transactionDate) return false;
  const d = row.transactionDate.split("T")[0];
  const matchesFrom = !from || d >= from;
  const matchesTo = !to || d <= to;
  return matchesFrom && matchesTo;
}

/**
 * Lọc các dòng theo mọi cột ngoại trừ `colToSkip`.
 * Dùng để tính lựa chọn lọc: mỗi cột chỉ thấy giá trị còn lại sau các bộ lọc khác.
 */
export function filterRowsExcluding(
  rows: LedgerDisplayRow[],
  columnSearch: Record<string, string>,
  columnFilters: Record<string, string[]>,
  colToSkip: string,
): LedgerDisplayRow[] {
  let result = [...rows];

  const dateRange = columnSearch["transactionDate"];
  if (colToSkip !== "transactionDate" && dateRange) {
    result = result.filter((r) => matchesDateRange(r, dateRange));
  }

  Object.entries(columnSearch).forEach(([col, searchVal]) => {
    if (!searchVal || col === "transactionDate" || col === colToSkip) return;
    result = result.filter((e) => {
      const val = e[col as keyof typeof e];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchVal.toLowerCase());
    });
  });

  Object.entries(columnFilters).forEach(([col, selectedVals]) => {
    if (!selectedVals || !selectedVals.length || col === colToSkip) return;
    result = result.filter((e) =>
      selectedVals.includes(formatFilterValue(col, e[col as keyof typeof e])),
    );
  });

  return result;
}
