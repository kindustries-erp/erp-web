import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

/** Chiều cấn trừ: PAYMENT = chi tiền (giao dịch có debit), RECEIPT = thu tiền (có credit) */
export type NetOffSide = "RECEIPT" | "PAYMENT";

export interface NetOffSelection {
  txn: BankTransactionLinkDto;
  amount: number;
}

/** Chuỗi hoặc số từ backend thành số; không hợp lệ thì 0 */
export function toAmount(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : 0;
}

/** Số tiền gốc của giao dịch: debit nếu có, không thì credit */
export function grossAmount(txn: BankTransactionLinkDto): number {
  const debit = toAmount(txn.debitAmount);
  return debit > 0 ? debit : toAmount(txn.creditAmount);
}

/** Giao dịch đúng chiều cấn trừ của hóa đơn */
export function matchesSide(
  txn: BankTransactionLinkDto,
  side: NetOffSide,
): boolean {
  return side === "PAYMENT"
    ? toAmount(txn.debitAmount) > 0
    : toAmount(txn.creditAmount) > 0;
}

/** Số tiền còn có thể cấn trừ của giao dịch (gốc trừ đã cấn trừ) */
export function remainingOf(txn: BankTransactionLinkDto): number {
  return Math.max(0, grossAmount(txn) - toAmount(txn.netOffAmount));
}

/** Kẹp số tiền nhập vào khoảng [0, tối đa] */
export function clampAmount(value: number, max: number): number {
  return Math.min(Math.max(0, value), max);
}

/** Payload gửi lên cha: chỉ các dòng có số tiền > 0 (đúng contract `{id, amount}[]`) */
export function buildNetOffItems(
  selected: Record<string, NetOffSelection>,
): { id: string; amount: number }[] {
  return Object.entries(selected)
    .filter(([, row]) => row.amount > 0)
    .map(([id, row]) => ({ id, amount: row.amount }));
}

export function sumSelected(selected: Record<string, NetOffSelection>): number {
  return Object.values(selected).reduce((sum, row) => sum + row.amount, 0);
}
