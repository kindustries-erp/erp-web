import { VIETQR_BANKS } from "../constants/vietQrBanks";
import {
  buildTransferQrFileName,
  isValidAccountNumber,
  isValidVndAmount,
} from "./vietQrPayload";

/** Số lệnh tối đa trong một lần tạo QR hàng loạt. */
export const MAX_BATCH_ROWS = 50;

export interface TransferQrBatchRow {
  id: string;
  /** Mã BIN Napas; null khi chưa chọn hoặc không khớp được ngân hàng */
  bin: string | null;
  /** Mã viết tắt hiển thị và dùng cho tên file, ví dụ VCB */
  bankCode: string;
  accountNumber: string;
  accountName: string;
  /** null = để trống (QR tĩnh) */
  amount: number | null;
  /** Số tiền dán vào không đọc được; báo lỗi thay vì âm thầm bỏ qua */
  amountInvalid: boolean;
  content: string;
}

export type TransferQrBatchField =
  | "bin"
  | "accountNumber"
  | "accountName"
  | "amount";

export type TransferQrBatchErrorCode =
  | "required"
  | "invalidAccountNumber"
  | "invalidAmount";

export type TransferQrBatchErrors = Partial<
  Record<TransferQrBatchField, TransferQrBatchErrorCode>
>;

export function createBatchRow(
  id: string,
  init: Partial<Omit<TransferQrBatchRow, "id">> = {},
): TransferQrBatchRow {
  return {
    id,
    bin: null,
    bankCode: "",
    accountNumber: "",
    accountName: "",
    amount: null,
    amountInvalid: false,
    content: "",
    ...init,
  };
}

/**
 * Chọn ngân hàng trong bảng: BIN và mã viết tắt luôn đi cùng nhau, để tên file
 * và chữ dưới QR khớp với BIN đã mã hóa (không giữ mã cũ từ chuỗi dán).
 */
export function bankFieldsFromBin(
  bin: string | null,
): Pick<TransferQrBatchRow, "bin" | "bankCode"> {
  const code = VIETQR_BANKS.find((bank) => bank.bin === bin)?.code ?? "";
  return { bin, bankCode: code };
}

export function validateBatchRow(
  row: TransferQrBatchRow,
): TransferQrBatchErrors {
  const errors: TransferQrBatchErrors = {};
  if (!row.bin) errors.bin = "required";
  if (!row.accountNumber) errors.accountNumber = "required";
  else if (!isValidAccountNumber(row.accountNumber))
    errors.accountNumber = "invalidAccountNumber";
  if (
    row.amountInvalid ||
    (row.amount !== null && !isValidVndAmount(row.amount))
  )
    errors.amount = "invalidAmount";
  return errors;
}

export function isBatchRowValid(row: TransferQrBatchRow): boolean {
  return Object.keys(validateBatchRow(row)).length === 0;
}

/**
 * Tên file trong ZIP/PNG: có số thứ tự đầu để hai dòng giống nhau không trùng tên.
 * Ví dụ: 01_QR_VCB_0123456789_1500000.png
 */
export function buildBatchFileName(
  index: number,
  row: TransferQrBatchRow,
): string {
  const seq = String(index).padStart(2, "0");
  const base = buildTransferQrFileName({
    bankCode: row.bankCode || row.bin || "BANK",
    accountNumber: row.accountNumber,
    amount: row.amount,
  });
  return `${seq}_${base}`;
}
