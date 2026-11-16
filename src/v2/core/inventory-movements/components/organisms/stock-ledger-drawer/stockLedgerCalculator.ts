import type { StockTransactionRow } from "../../../domain/stockBalance";

export type CostingMethod = "WEIGHTED_AVG" | "FIFO";

export interface StockLedgerDisplayRow {
  id: string;
  transactionDate: string;
  createdAt?: string;
  transactionType: string;
  documentType: string;
  documentId: string;
  documentNo?: string;

  // 9-cột phẳng thiết yếu
  qtyIn: number;
  inUnitCost: number;
  inTotal: number;

  qtyOut: number;
  outUnitCost: number;
  outTotal: number;

  qtyAdjusted: number;
  unitCost: number;

  balanceQty: number;
  balanceUnitCost: number;
  balanceValue: number;
  isNegativeBalance: boolean;
}

export interface StockLedgerTotals {
  totalInQty: number;
  totalInValue: number;
  totalOutQty: number;
  totalOutValue: number;
  totalAdjustedQty: number;
  finalBalanceQty: number;
  finalBalanceValue: number;
}

interface FifoLayer {
  qty: number;
  unitCost: number;
}

const round = (val: number, decimals = 2) => {
  const p = Math.pow(10, decimals);
  return Math.round(val * p) / p;
};

/**
 * Tính toán toàn bộ Thẻ kho (dòng hiển thị + tổng cộng) theo phương pháp giá vốn được chọn.
 * Nhận chuỗi giao dịch, tự chuẩn hóa theo thời gian tăng dần và trả về kết quả mới nhất lên đầu.
 */
export function calculateStockLedger(
  rawTransactions: StockTransactionRow[],
  costingMethod: CostingMethod = "WEIGHTED_AVG",
): {
  rows: StockLedgerDisplayRow[];
  totals: StockLedgerTotals;
} {
  if (!rawTransactions || rawTransactions.length === 0) {
    return {
      rows: [],
      totals: {
        totalInQty: 0,
        totalInValue: 0,
        totalOutQty: 0,
        totalOutValue: 0,
        totalAdjustedQty: 0,
        finalBalanceQty: 0,
        finalBalanceValue: 0,
      },
    };
  }

  // Backend trả về mảng DESC (mới nhất trước), đảo ngược để có thứ tự phát sinh ASC chuẩn xác
  const reversed = [...rawTransactions].reverse();
  const sortedAsc = reversed.sort((a, b) => {
    const diff =
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime();
    if (diff !== 0) return diff;
    if (a.createdAt && b.createdAt) {
      const createdDiff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (createdDiff !== 0) return createdDiff;
    }
    return 0;
  });

  const displayRowsAsc: StockLedgerDisplayRow[] = [];
  const layers: FifoLayer[] = [];

  let runningQty = 0;
  let runningValue = 0;
  let runningAvgCost = 0;

  for (const tx of sortedAsc) {
    const rawQtyIn = Number(tx.qtyIn ?? 0);
    const rawQtyOut = Number(tx.qtyOut ?? 0);
    const recordedCost = Number(tx.unitCost ?? 0);

    const isAdjustment =
      tx.transactionType === "ADJUSTMENT" ||
      tx.transactionType === "ADJUSTMENT_CANCEL" ||
      tx.transactionType === "INVENTORY_COUNT";

    let qtyIn = 0;
    let inUnitCost = 0;
    let inTotal = 0;
    let qtyOut = 0;
    let outUnitCost = 0;
    let outTotal = 0;
    let qtyAdjusted = 0;

    if (isAdjustment) {
      qtyAdjusted = rawQtyIn > 0 ? rawQtyIn : -rawQtyOut;
      if (qtyAdjusted > 0) {
        inUnitCost = recordedCost;
        inTotal = round(qtyAdjusted * inUnitCost, 2);
        runningQty = round(runningQty + qtyAdjusted, 3);
        runningValue = round(runningValue + inTotal, 2);
        runningAvgCost =
          runningQty > 0 ? round(runningValue / runningQty, 2) : 0;
        layers.push({ qty: qtyAdjusted, unitCost: recordedCost });
      } else if (qtyAdjusted < 0) {
        const absQty = Math.abs(qtyAdjusted);
        if (costingMethod === "FIFO") {
          let need = absQty;
          let consumedVal = 0;
          for (let i = 0; i < layers.length && need > 0; i++) {
            const layer = layers[i];
            if (layer.qty <= 0) continue;
            const take = Math.min(layer.qty, need);
            consumedVal += take * layer.unitCost;
            layer.qty = round(layer.qty - take, 3);
            need = round(need - take, 3);
          }
          outTotal = round(consumedVal, 2);
          outUnitCost = absQty > 0 ? round(consumedVal / absQty, 2) : 0;
          runningQty = round(runningQty - absQty, 3);
          runningValue = round(
            layers.reduce((sum, l) => sum + l.qty * l.unitCost, 0),
            2,
          );
          runningAvgCost =
            runningQty > 0 ? round(runningValue / runningQty, 2) : 0;
        } else {
          outUnitCost = runningAvgCost > 0 ? runningAvgCost : recordedCost;
          outTotal = round(absQty * outUnitCost, 2);
          runningQty = round(runningQty - absQty, 3);
          runningValue = Math.max(0, round(runningValue - outTotal, 2));
          runningAvgCost =
            runningQty > 0 ? round(runningValue / runningQty, 2) : 0;
        }
      }
    } else if (rawQtyIn > 0) {
      qtyIn = rawQtyIn;
      inUnitCost = recordedCost;
      inTotal = round(qtyIn * inUnitCost, 2);
      runningQty = round(runningQty + qtyIn, 3);
      runningValue = round(runningValue + inTotal, 2);
      runningAvgCost = runningQty > 0 ? round(runningValue / runningQty, 2) : 0;
      layers.push({ qty: qtyIn, unitCost: recordedCost });
    } else if (rawQtyOut > 0) {
      qtyOut = rawQtyOut;
      if (costingMethod === "FIFO") {
        let need = qtyOut;
        let consumedVal = 0;

        for (let i = 0; i < layers.length && need > 0; i++) {
          const layer = layers[i];
          if (layer.qty <= 0) continue;

          const take = Math.min(layer.qty, need);
          consumedVal += take * layer.unitCost;
          layer.qty = round(layer.qty - take, 3);
          need = round(need - take, 3);
        }

        outTotal = round(consumedVal, 2);
        outUnitCost = qtyOut > 0 ? round(consumedVal / qtyOut, 2) : 0;
        runningQty = round(runningQty - qtyOut, 3);
        runningValue = round(
          layers.reduce((sum, l) => sum + l.qty * l.unitCost, 0),
          2,
        );
        runningAvgCost =
          runningQty > 0 ? round(runningValue / runningQty, 2) : 0;
      } else {
        // WEIGHTED_AVG
        outUnitCost = runningAvgCost > 0 ? runningAvgCost : recordedCost;
        outTotal = round(qtyOut * outUnitCost, 2);
        runningQty = round(runningQty - qtyOut, 3);
        runningValue = Math.max(0, round(runningValue - outTotal, 2));
        runningAvgCost =
          runningQty > 0 ? round(runningValue / runningQty, 2) : 0;
      }
    }

    const currentBalanceValue =
      costingMethod === "FIFO"
        ? round(
            layers.reduce((sum, l) => sum + l.qty * l.unitCost, 0),
            2,
          )
        : runningValue;

    const currentAvgCost =
      runningQty > 0 ? round(currentBalanceValue / runningQty, 2) : 0;

    const unitCost =
      qtyIn > 0
        ? inUnitCost
        : qtyOut > 0
          ? outUnitCost
          : isAdjustment
            ? recordedCost
            : currentAvgCost || recordedCost;

    displayRowsAsc.push({
      id: tx.id,
      transactionDate: tx.transactionDate,
      createdAt: tx.createdAt,
      transactionType: tx.transactionType,
      documentType: tx.documentType,
      documentId: tx.documentId,
      documentNo: tx.documentNo,
      qtyIn,
      inUnitCost,
      inTotal,
      qtyOut,
      outUnitCost,
      outTotal,
      qtyAdjusted,
      unitCost,
      balanceQty: runningQty,
      balanceUnitCost: currentAvgCost,
      balanceValue: currentBalanceValue,
      isNegativeBalance: runningQty < 0,
    });
  }

  // Tính totals
  const totalInQty = round(
    displayRowsAsc.reduce((sum, r) => sum + r.qtyIn, 0),
    3,
  );
  const totalInValue = round(
    displayRowsAsc.reduce((sum, r) => sum + r.inTotal, 0),
    2,
  );
  const totalOutQty = round(
    displayRowsAsc.reduce((sum, r) => sum + r.qtyOut, 0),
    3,
  );
  const totalOutValue = round(
    displayRowsAsc.reduce((sum, r) => sum + r.outTotal, 0),
    2,
  );
  const totalAdjustedQty = round(
    displayRowsAsc.reduce((sum, r) => sum + r.qtyAdjusted, 0),
    3,
  );

  const lastRow = displayRowsAsc[displayRowsAsc.length - 1];
  const finalBalanceQty = lastRow?.balanceQty ?? 0;
  const finalBalanceValue = lastRow?.balanceValue ?? 0;

  // Hiển thị mới nhất lên đầu (DESC)
  const rows = [...displayRowsAsc].reverse();

  return {
    rows,
    totals: {
      totalInQty,
      totalInValue,
      totalOutQty,
      totalOutValue,
      totalAdjustedQty,
      finalBalanceQty,
      finalBalanceValue,
    },
  };
}
