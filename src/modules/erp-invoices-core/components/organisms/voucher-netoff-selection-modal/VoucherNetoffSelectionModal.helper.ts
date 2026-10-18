import { type SettlementType } from "./types";

/**
 * Tính toán tổng số tiền cấn trừ ròng (Net Amount) theo chiều đối soát
 * - Với HĐ mua vào / PAYMENT: Giao dịch Chi (+) trừ Giao dịch Thu hoàn tiền (-)
 * - Với HĐ bán ra / RECEIPT: Giao dịch Thu (+) trừ Giao dịch Chi hoàn tiền (-)
 */
export function calculateTotalNetOff(
  selectedIds: string[],
  netOffAmounts: Record<string, number>,
  selectedTxns: Record<string, any>,
  settlementType: SettlementType,
): number {
  return selectedIds.reduce((sum, id) => {
    const val = netOffAmounts[id];
    const txn = selectedTxns[id];
    if (val === undefined || isNaN(val) || !txn) return sum;

    const debit = parseFloat(txn.debitAmount) || 0;
    const credit = parseFloat(txn.creditAmount) || 0;

    if (settlementType === "PAYMENT") {
      // Chi tiền NCC: Debit (+), Credit hoàn tiền (-)
      if (debit > 0) return sum + val;
      if (credit > 0) return sum - val;
    } else {
      // Thu tiền khách: Credit (+), Debit hoàn tiền (-)
      if (credit > 0) return sum + val;
      if (debit > 0) return sum - val;
    }

    return sum + val;
  }, 0);
}

/**
 * Tính toán nợ còn lại sau cấn trừ
 */
export function calculateRemainingAfterNetOff(
  currentRemaining: number,
  totalCurrentNetOff: number,
): number {
  return Math.max(0, currentRemaining - totalCurrentNetOff);
}

/**
 * Kiểm tra xem tổng cấn trừ có vượt quá nợ còn lại không
 */
export function checkIsOverRemaining(
  currentRemaining: number,
  totalCurrentNetOff: number,
): boolean {
  return currentRemaining > 0 && totalCurrentNetOff > currentRemaining;
}
