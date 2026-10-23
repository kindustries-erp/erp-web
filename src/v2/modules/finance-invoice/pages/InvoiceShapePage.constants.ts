import type { V2FilterGroupItem } from "@/v2/shared/components";
import type { InvoiceDirection } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

/** Nhóm lọc loại hóa đơn thuế (nằm trong popover chế độ xem) */
export const TAX_TABS: V2FilterGroupItem[] = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Mới" },
  { key: "replacement", label: "Thay thế" },
  { key: "adjustment", label: "Điều chỉnh" },
];

export const TAX_FILTER_TITLE = "Loại hóa đơn thuế";

export const VIEW_MODES = [
  { key: "overview", label: "Tổng quan", isSystem: true },
  { key: "audit", label: "Kiểm toán / Đối soát", isSystem: true },
];

/** Bảng danh sách theo chiều hóa đơn; chế độ xem và filter lưu theo từng bảng */
export const invoiceTableId = (direction: InvoiceDirection) =>
  `invoice-shape-${direction}`;
