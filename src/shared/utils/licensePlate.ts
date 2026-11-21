/**
 * Chuẩn hóa biển số xe, cùng quy tắc với erp-api (`src/common/utils/license-plate.ts`):
 * bỏ dấu tiếng Việt, `Đ`/`đ` thành `D`, viết hoa, chỉ giữ `A-Z` và `0-9`
 * (loại `-`, `.`, khoảng trắng và mọi ký tự đặc biệt).
 * `51a-123.45` thành `51A12345`; `29-MĐ1 123.45` thành `29MD112345`; `null` hoặc `---` thành `""`.
 *
 * Giá trị hiển thị vẫn là chuỗi gốc; hàm này chỉ dùng để so khớp, gom xe và tìm kiếm.
 */
export function normalizePlate(plate?: string | null): string {
  if (!plate) return "";
  return plate
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Đđ]/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/** Hai biển là cùng một xe: cả hai còn ký tự hợp lệ và bằng nhau sau chuẩn hóa. */
export function isSamePlate(a?: string | null, b?: string | null): boolean {
  const na = normalizePlate(a);
  return na.length > 0 && na === normalizePlate(b);
}

/** Biển (đã chuẩn hóa) chứa chuỗi tìm kiếm (cũng được chuẩn hóa); chuỗi tìm rỗng thì không khớp. */
export function plateContains(
  plate?: string | null,
  keyword?: string | null,
): boolean {
  const nk = normalizePlate(keyword);
  return nk.length > 0 && normalizePlate(plate).includes(nk);
}
