import { VIETQR_BANKS, type VietQrBank } from "../constants/vietQrBanks";

/** Chuẩn hóa để so khớp: bỏ dấu, đ→d, chỉ giữ chữ và số, viết thường. */
export const normalizeBankKey = (raw: string): string =>
  raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const MIN_FUZZY_ALIAS_LENGTH = 4;

/**
 * Khớp dữ liệu ngân hàng tự do (mã, tên, tên gọi khác) sang ngân hàng VietQR.
 * Ưu tiên khớp đúng; nếu không có thì thử khớp chứa một alias đủ dài.
 * Trả null khi không khớp được.
 */
export function resolveBankBin(input: {
  bankCode?: string | null;
  bankName?: string | null;
}): VietQrBank | null {
  const keys = [input.bankCode, input.bankName]
    .map((value) => normalizeBankKey(value ?? ""))
    .filter((key) => key.length > 0);

  for (const key of keys) {
    const exact = VIETQR_BANKS.find(
      (bank) =>
        normalizeBankKey(bank.code) === key ||
        normalizeBankKey(bank.shortName) === key ||
        bank.bin === key ||
        bank.aliases.some((alias) => normalizeBankKey(alias) === key),
    );
    if (exact) return exact;
  }

  // Khớp mờ: lấy alias dài nhất nằm trong khóa. Hai ngân hàng khác nhau cùng
  // độ dài alias thì không đoán, trả null cho khóa đó.
  for (const key of keys) {
    let best: { bank: VietQrBank; length: number } | null = null;
    let ambiguous = false;
    for (const bank of VIETQR_BANKS) {
      for (const alias of bank.aliases) {
        const aliasKey = normalizeBankKey(alias);
        if (aliasKey.length < MIN_FUZZY_ALIAS_LENGTH || !key.includes(aliasKey))
          continue;
        if (!best || aliasKey.length > best.length) {
          best = { bank, length: aliasKey.length };
          ambiguous = false;
        } else if (aliasKey.length === best.length && best.bank !== bank) {
          ambiguous = true;
        }
      }
    }
    if (best && !ambiguous) return best.bank;
  }

  return null;
}
