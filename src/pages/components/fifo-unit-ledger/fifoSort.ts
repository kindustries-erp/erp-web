import type { LedgerDisplayRow } from "./fifoTransform";

/** Các cột số được so sánh theo giá trị số (chuỗi rỗng và null coi là 0). */
const NUMERIC_SORT_COLUMNS = new Set([
  "inQty",
  "outQty",
  "balanceQty",
  "inTotal",
  "outCogs",
  "balanceValue",
  "outRevenue",
  "outProfit",
]);

/**
 * Sắp xếp theo tiêu chí đầu tiên ("-cột" là giảm dần). Sắp xếp tại chỗ trên mảng truyền vào.
 */
export function sortRows(
  rows: LedgerDisplayRow[],
  sorts: string[],
): LedgerDisplayRow[] {
  if (sorts.length === 0) return rows;

  const sortStr = sorts[0];
  const direction = sortStr.startsWith("-") ? "desc" : "asc";
  const column = sortStr.replace("-", "") as keyof LedgerDisplayRow;

  return rows.sort((a, b) => {
    let valA: any = a[column];
    let valB: any = b[column];

    if (NUMERIC_SORT_COLUMNS.has(column)) {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (typeof valA === "string" && typeof valB === "string") {
      return direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
