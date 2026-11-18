import {
  buildBatchFileName,
  isBatchRowValid,
  validateBatchRow,
  type TransferQrBatchErrors,
  type TransferQrBatchRow,
} from "./batchRows";
import { buildVietQrPayload, sanitizeTransferContent } from "./vietQrPayload";

/** Chữ hiển thị dưới mỗi mã QR trong PDF và lưới. */
export interface BatchRowCaption {
  accountName: string;
  bankCode: string;
  accountNumber: string;
  amount: number | null;
  content: string;
}

export interface TransferQrBatchRowView {
  row: TransferQrBatchRow;
  /** Số thứ tự hiển thị (1-based) và tên file tương ứng */
  index: number;
  fileName: string;
  errors: TransferQrBatchErrors;
  valid: boolean;
  /** Chuỗi VietQR đã mã hóa, null khi dòng chưa hợp lệ */
  payload: string | null;
  qrDataUrl: string | null;
  caption: BatchRowCaption;
}

/** Dòng chưa nhập gì: được bỏ khi dán thêm từ Excel. */
export const isEmptyBatchRow = (row: TransferQrBatchRow): boolean =>
  !row.bin &&
  !row.accountNumber &&
  !row.accountName &&
  row.amount === null &&
  !row.amountInvalid &&
  !row.content;

/** Tính trạng thái hiển thị của một dòng từ dữ liệu và cache ảnh QR theo payload. */
export function buildBatchRowView(
  row: TransferQrBatchRow,
  position: number,
  qrByPayload: Readonly<Record<string, string>>,
): TransferQrBatchRowView {
  const valid = isBatchRowValid(row);
  const payload =
    valid && row.bin
      ? buildVietQrPayload({
          bin: row.bin,
          accountNumber: row.accountNumber,
          amount: row.amount,
          content: row.content,
        })
      : null;
  return {
    row,
    index: position + 1,
    fileName: buildBatchFileName(position + 1, row),
    errors: validateBatchRow(row),
    valid,
    payload,
    qrDataUrl: payload ? (qrByPayload[payload] ?? null) : null,
    caption: {
      accountName: row.accountName,
      bankCode: row.bankCode || row.bin || "",
      accountNumber: row.accountNumber,
      amount: row.amount,
      content: sanitizeTransferContent(row.content),
    },
  };
}
