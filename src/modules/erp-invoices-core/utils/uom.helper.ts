/**
 * uom.helper.ts
 *
 * Helper thuần túy định dạng Đơn vị tính (ĐVT / UOM) phía giao diện:
 * - Tự động loại bỏ khoảng trắng thừa và chuẩn hóa sang UPPERCASE
 * - Trả về fallback "—" nếu không có dữ liệu
 */

export function formatUom(uom?: string | null, fallback = "—"): string {
  if (!uom) return fallback;
  const trimmed = uom.trim().replace(/\s+/g, " ").toUpperCase();
  return trimmed.length > 0 ? trimmed : fallback;
}
