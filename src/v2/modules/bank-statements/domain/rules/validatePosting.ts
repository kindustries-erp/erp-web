import type {
  PostingDraftLine,
  PostingValidationResult,
} from "../entities/cashTransaction";

/** Bỏ dòng trống (không số tiền, không TK) và làm tròn số tiền để gửi API */
export function normalizePostingLines(
  lines: PostingDraftLine[],
  fallbackDescription: string,
) {
  return lines
    .map((line) => ({
      accountId: line.accountId,
      debit: Number(line.debit || 0),
      credit: Number(line.credit || 0),
      description: line.description || fallbackDescription || "",
    }))
    .filter((line) => line.debit > 0 || line.credit > 0 || line.accountId);
}

/**
 * Chặn lỗi trước khi gửi API: thiếu ngày, không có dòng, dòng thiếu TK, lệch Nợ/Có.
 * API vẫn là chốt cuối; hàm này chỉ giúp báo lỗi sớm và rõ ràng.
 */
export function validatePosting(
  postingDate: string,
  lines: PostingDraftLine[],
  fallbackDescription: string,
): PostingValidationResult {
  if (!postingDate) return { ok: false, error: "MISSING_POSTING_DATE" };

  const normalized = normalizePostingLines(lines, fallbackDescription);
  if (normalized.length === 0) return { ok: false, error: "NO_LINES" };
  if (normalized.some((line) => !line.accountId))
    return { ok: false, error: "MISSING_ACCOUNT" };

  const totalDebit = normalized.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = normalized.reduce((sum, line) => sum + line.credit, 0);
  if (Math.abs(totalDebit - totalCredit) >= 0.01)
    return { ok: false, error: "UNBALANCED" };

  return { ok: true };
}
