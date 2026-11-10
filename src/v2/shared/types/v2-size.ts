/**
 * V2Size — Chuẩn hóa thang đo kích thước (T-shirt size) xuyên suốt hệ thống V2.
 * Dùng làm gốc (base) cho các component size chuyên biệt (Drawer, Modal, Input, Badge, Button,...).
 */
export enum V2Size {
  XS = "xs",
  SM = "sm",
  MD = "md",
  LG = "lg",
  XL = "xl",
  XXL = "2xl",
  FULL = "full",
}

/**
 * Hỗ trợ union string literal `${V2Size}` để đảm bảo tương thích 100% với các component cũ
 * truyền chuỗi ký tự trực tiếp mà không bắt buộc phải import enum.
 */
export type V2SizeType = V2Size | `${V2Size}`;
