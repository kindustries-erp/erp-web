import { MAX_BATCH_ROWS, type TransferQrBatchRow } from "./batchRows";
import { normalizeBankKey, resolveBankBin } from "./resolveBankBin";

/** Dòng đọc từ bảng dán, chưa có id. */
export type ParsedBatchRow = Omit<TransferQrBatchRow, "id">;

export interface ParsePastedRowsResult {
  rows: ParsedBatchRow[];
  /** Đã bỏ dòng tiêu đề (cột đầu là "Ngân hàng" hoặc "Bank") */
  skippedHeader: boolean;
  /** Có dòng bị cắt vì vượt MAX_BATCH_ROWS */
  truncated: boolean;
}

const HEADER_FIRST_CELLS = new Set(["nganhang", "bank"]);

/**
 * Đọc số tiền từ ô dán: chấp nhận "1.500.000", "1,500,000", "1500000",
 * có hoặc không có hậu tố "VND"/"đ". Ô trống trả amount = null (QR tĩnh).
 */
export function parseAmountCell(raw: string): {
  amount: number | null;
  invalid: boolean;
} {
  const cleaned = raw
    .trim()
    .replace(/\s*(vnd|đ)\s*$/i, "")
    .replace(/\s/g, "");
  if (cleaned === "") return { amount: null, invalid: false };
  // Số nguyên thuần, hoặc nhóm nghìn hợp lệ (1.500.000 / 1,500,000).
  // Số thập phân như 150.5 hoặc 1,5 bị đánh dấu lỗi, không tự đoán.
  if (/^\d+$/.test(cleaned)) return { amount: Number(cleaned), invalid: false };
  if (/^\d{1,3}([.,]\d{3})+$/.test(cleaned))
    return { amount: Number(cleaned.replace(/[.,]/g, "")), invalid: false };
  return { amount: null, invalid: true };
}

/**
 * Đọc vùng copy từ Excel (phân cách bằng tab, xuống dòng).
 * Thứ tự cột cố định: Ngân hàng | Số tài khoản | Tên chủ tài khoản | Số tiền | Nội dung.
 * Dòng không đúng ngân hàng vẫn được trả về với bin = null để hiện lỗi cho người dùng.
 */
export function parsePastedRows(text: string): ParsePastedRowsResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  const rows: ParsedBatchRow[] = [];
  let skippedHeader = false;
  let truncated = false;

  for (let index = 0; index < lines.length; index++) {
    const cells = lines[index].split("\t").map((cell) => cell.trim());
    if (
      index === 0 &&
      HEADER_FIRST_CELLS.has(normalizeBankKey(cells[0] ?? ""))
    ) {
      skippedHeader = true;
      continue;
    }
    if (rows.length >= MAX_BATCH_ROWS) {
      truncated = true;
      break;
    }
    const [
      bankText = "",
      accountRaw = "",
      accountName = "",
      amountRaw = "",
      content = "",
    ] = cells;
    const bank = resolveBankBin({ bankCode: bankText });
    const amount = parseAmountCell(amountRaw);
    rows.push({
      bin: bank?.bin ?? null,
      bankCode: bank?.code ?? bankText,
      accountNumber: accountRaw.replace(/\s+/g, ""),
      accountName,
      amount: amount.amount,
      amountInvalid: amount.invalid,
      content,
    });
  }

  return { rows, skippedHeader, truncated };
}
