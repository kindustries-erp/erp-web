export type NetOffPartnerType = "CUSTOMER" | "SUPPLIER";

/** Hóa đơn còn mở của đối tác, lấy từ `GET /erp-invoices/debts/:taxCode/invoices` */
export interface NetOffOpenInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  balanceAmount: number;
  taxInvoiceStatus?: number | null;
}

/** Một dòng phân bổ: số tiền VND gắn cho một hóa đơn */
export interface NetOffLine {
  invoiceId: string;
  amount: number;
}

export type NetOffValidationError =
  | "empty"
  | "nonPositive"
  | "overBalance"
  | "overUnallocated";

export const toCents = (value: number): number => Math.round(value * 100);

/** Hóa đơn điều chỉnh giảm (status 3) và số âm không cấn trừ theo công nợ, khớp backend */
export const isAllocatableInvoice = (invoice: NetOffOpenInvoice): boolean =>
  invoice.balanceAmount > 0 &&
  invoice.totalAmount > 0 &&
  invoice.taxInvoiceStatus !== 3;

export const getAllocatableInvoices = (
  invoices: NetOffOpenInvoice[],
): NetOffOpenInvoice[] => invoices.filter(isAllocatableInvoice);

export const sumLinesCents = (lines: NetOffLine[]): number =>
  lines.reduce((sum, line) => sum + toCents(line.amount), 0);

/** Số chưa phân bổ còn lại của giao dịch sau khi trừ các dòng đang nhập */
export const remainingUnallocated = (
  unallocatedAmount: number,
  lines: NetOffLine[],
): number => (toCents(unallocatedAmount) - sumLinesCents(lines)) / 100;

/** Kiểm tra toàn bộ dòng phân bổ; trả về mã lỗi đầu tiên gặp, hoặc null nếu hợp lệ */
export function validateNetOffLines({
  lines,
  invoices,
  unallocatedAmount,
}: {
  lines: NetOffLine[];
  invoices: NetOffOpenInvoice[];
  unallocatedAmount: number;
}): NetOffValidationError | null {
  if (lines.length === 0) return "empty";
  if (lines.some((line) => toCents(line.amount) <= 0)) return "nonPositive";

  const balanceById = new Map(
    invoices.map((invoice) => [invoice.id, invoice.balanceAmount]),
  );
  const overBalance = lines.some((line) => {
    const balance = balanceById.get(line.invoiceId);
    return balance === undefined || toCents(line.amount) > toCents(balance);
  });
  if (overBalance) return "overBalance";

  if (sumLinesCents(lines) > toCents(unallocatedAmount)) {
    return "overUnallocated";
  }
  return null;
}
