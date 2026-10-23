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
  { key: "tax", label: "Thuế & Kê khai", isSystem: true },
];

/** Bảng danh sách theo chiều hóa đơn; giữ nguyên tableId chuẩn của ERP để tái sử dụng preference */
export const invoiceTableId = (direction: InvoiceDirection) =>
  `erp-invoices-table-${direction}`;
