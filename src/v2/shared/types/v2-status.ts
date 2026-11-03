/**
 * Trạng thái chứng từ tiêu chuẩn dùng chung toàn hệ thống ERP V2
 * (Phiếu nhập kho, Đơn mua hàng, Hóa đơn, Phiếu thu/chi, Báo giá, v.v.)
 */
export enum V2DocumentStatus {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
  CANCELLED = "CANCELLED",
}

/**
 * Trạng thái thực thể / danh mục tổng quát trong hệ thống ERP V2
 */
export enum V2EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}
