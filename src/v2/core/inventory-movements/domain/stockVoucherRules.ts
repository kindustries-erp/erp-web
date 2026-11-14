import { StockVoucherStatus } from "./stockVoucher";

export const isStockVoucherPosted = (status?: string | null): boolean =>
  status === StockVoucherStatus.POSTED;

/** Tổng thành tiền các dòng; giá trị không hợp lệ được coi là 0 */
export const sumStockVoucherLines = (
  lines: ReadonlyArray<{ amount: number }>,
): number =>
  lines.reduce(
    (acc, line) => acc + (Number.isFinite(line.amount) ? line.amount : 0),
    0,
  );
