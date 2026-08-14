import { LedgerRow } from "./useFifoUnitLedger";

export interface LedgerDisplayRow {
  id: string;
  transactionDate: string;
  invoiceNo: string;
  invoiceId: string;
  partnerName: string;
  partnerTaxCode?: string;
  direction: "IN" | "OUT";

  // IN
  inQty?: number;
  inUnitCost?: number;
  inTotal?: number;

  // OUT
  outQty?: number;
  outUnitCost?: number; // FIFO COGS unit
  outSellPrice?: number;
  outCogs?: number;
  outRevenue?: number;
  outProfit?: number;
  outMargin?: number;

  // BALANCE
  balanceQty: number;
  balanceValue: number;
}

export function buildFlatLedgerRows(rows: LedgerRow[]): LedgerDisplayRow[] {
  const displayRows: LedgerDisplayRow[] = [];

  const inQueue: { qty: number; unitCost: number }[] = [];

  // Sort rows chronologically (oldest first) to simulate FIFO correctly
  const sortedRows = [...rows].sort(
    (a, b) =>
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime(),
  );

  for (const row of sortedRows) {
    const rawQty = parseFloat(row.qty || "0");
    const isAdjNegative = row.isAdjustment && row.adjSign === -1;
    const qty = isAdjNegative ? -rawQty : rawQty;

    let amount = parseFloat(row.preVatAmount || "0");
    if (isAdjNegative) amount = -amount;

    const isOut = row.direction === "OUT";
    const partnerName = isOut ? row.buyerName : row.sellerName;
    const partnerTaxCode = isOut ? row.buyerTaxCode : row.sellerTaxCode;

    if (!isOut) {
      if (qty > 0) {
        inQueue.push({ qty, unitCost: parseFloat(row.unitCost || "0") });
      } else if (qty < 0) {
        let qToReverse = Math.abs(qty);
        while (qToReverse > 0 && inQueue.length > 0) {
          const batch = inQueue[0];
          if (batch.qty <= qToReverse) {
            qToReverse -= batch.qty;
            inQueue.shift();
          } else {
            batch.qty -= qToReverse;
            qToReverse = 0;
          }
        }
      }
    } else {
      if (qty > 0) {
        let qNeeded = qty;
        while (qNeeded > 0 && inQueue.length > 0) {
          const batch = inQueue[0];
          if (batch.qty <= qNeeded) {
            qNeeded -= batch.qty;
            inQueue.shift();
          } else {
            batch.qty -= qNeeded;
            qNeeded = 0;
          }
        }
      }
    }

    let balanceQty = 0;
    let balanceValue = 0;
    for (const q of inQueue) {
      balanceQty += q.qty;
      balanceValue += q.qty * q.unitCost;
    }

    // Rounding floats to avoid precision issues
    balanceQty = Math.round(balanceQty * 1000) / 1000;

    let inQty, inUnitCost, inTotal;
    let outQty,
      outUnitCost,
      outSellPrice,
      outCogs,
      outRevenue,
      outProfit,
      outMargin;

    if (!isOut) {
      inQty = qty;
      inUnitCost = parseFloat(row.unitCost || "0");
      inTotal = amount;
    } else {
      outQty = qty;
      outUnitCost = row.calculatedUnitCost || 0;
      outCogs = row.calculatedCogs || 0;
      outRevenue = amount;
      outSellPrice = qty !== 0 ? amount / qty : 0;
      outProfit = amount - outCogs;
      outMargin = amount > 0 ? (outProfit / amount) * 100 : 0;
    }

    displayRows.push({
      id: row.id,
      transactionDate: row.transactionDate,
      invoiceNo: row.invoiceNo,
      invoiceId: row.invoiceId,
      partnerName,
      partnerTaxCode,
      direction: row.direction as "IN" | "OUT",

      inQty,
      inUnitCost,
      inTotal,

      outQty,
      outUnitCost,
      outSellPrice,
      outCogs,
      outRevenue,
      outProfit,
      outMargin,

      balanceQty,
      balanceValue,
    });
  }

  return displayRows;
}
