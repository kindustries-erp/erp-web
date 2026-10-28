import type { LedgerDisplayRow } from "./fifoTransform";

export interface FifoFlatTableTotals {
  inQty: number;
  outQty: number;
  inValue: number;
  outValue: number;
  outRevenue: number;
  outProfit: number;
  balanceQty: number;
  balanceValue: number;
}

/**
 * Tổng cộng các dòng đang hiển thị. Tồn cuối lấy từ dòng mới nhất:
 * dòng đầu danh sách khi không sắp xếp, hoặc dòng có ngày lớn nhất khi có sắp xếp.
 */
export function computeTotals(
  rows: LedgerDisplayRow[],
  sorts: string[],
): FifoFlatTableTotals {
  let latestRow = rows[0];
  if (sorts.length > 0) {
    latestRow = [...rows].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime(),
    )[0];
  }

  return rows.reduce<FifoFlatTableTotals>(
    (acc, r) => {
      acc.inQty += r.inQty || 0;
      acc.inValue += r.inTotal || 0;
      acc.outQty += r.outQty || 0;
      acc.outValue += r.outCogs || 0;
      acc.outRevenue += r.outRevenue || 0;
      acc.outProfit += r.outProfit || 0;
      return acc;
    },
    {
      inQty: 0,
      inValue: 0,
      outQty: 0,
      outValue: 0,
      outRevenue: 0,
      outProfit: 0,
      balanceQty: latestRow?.balanceQty || 0,
      balanceValue: latestRow?.balanceValue || 0,
    },
  );
}
