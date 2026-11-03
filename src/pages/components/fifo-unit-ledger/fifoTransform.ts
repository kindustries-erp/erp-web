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

  // Cờ hiển thị
  /** Dòng trả hàng (OUT điều chỉnh âm): đưa đơn vị về kho. */
  isReturn: boolean;
  /** Số thiếu hàng phát sinh tại dòng này (0 nếu không thiếu). */
  shortageDelta: number;

  // BALANCE (lũy kế từ API, có thể âm khi bán vượt tồn)
  balanceQty: number;
  balanceValue: number;
}

/**
 * Chuyển dòng sổ cái (đã có số liệu FIFO từ API) thành dòng hiển thị.
 * Không tự tính lại hàng đợi: nguồn sự thật là engine phía API, giữ nguyên thứ tự API.
 */
export function buildFlatLedgerRows(rows: LedgerRow[]): LedgerDisplayRow[] {
  let previousShortage = 0;

  return rows.map((row) => {
    const rawQty = parseFloat(row.qty || "0");
    const isAdjNegative = row.isAdjustment && row.adjSign === -1;
    const qty = isAdjNegative ? -rawQty : rawQty;

    let amount = parseFloat(row.preVatAmount || "0");
    if (isAdjNegative) amount = -amount;

    const isOut = row.direction === "OUT";
    const partnerName = isOut ? row.buyerName : row.sellerName;
    const partnerTaxCode = isOut ? row.buyerTaxCode : row.sellerTaxCode;

    const cumulativeShortage = row.shortageQty ?? 0;
    const shortageDelta = Math.max(0, cumulativeShortage - previousShortage);
    previousShortage = cumulativeShortage;

    const display: LedgerDisplayRow = {
      id: row.id,
      transactionDate: row.transactionDate,
      invoiceNo: row.invoiceNo,
      invoiceId: row.invoiceId,
      partnerName,
      partnerTaxCode,
      direction: row.direction as "IN" | "OUT",
      isReturn: isOut && isAdjNegative,
      shortageDelta,
      balanceQty: row.balanceQty ?? 0,
      balanceValue: row.balanceValue ?? 0,
    };

    if (!isOut) {
      display.inQty = qty;
      display.inUnitCost = parseFloat(row.unitCost || "0");
      display.inTotal = amount;
    } else {
      const outCogs = row.calculatedCogs ?? 0;
      display.outQty = qty;
      display.outUnitCost = row.calculatedUnitCost ?? 0;
      display.outCogs = outCogs;
      display.outRevenue = amount;
      display.outSellPrice = qty !== 0 ? amount / qty : 0;
      display.outProfit = amount - outCogs;
      display.outMargin = amount > 0 ? (display.outProfit / amount) * 100 : 0;
    }

    return display;
  });
}
