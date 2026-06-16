import {
  type OperationalDocument,
  type OperationalVariant,
} from "../api/operationalApi";

export const variantTitle: Record<OperationalVariant, string> = {
  sales: "Bán hàng / Đơn sửa xe",
  purchase: "Mua hàng",
  expenses: "Chi phí vận hành",
  receivables: "Công nợ phải thu mới",
  payables: "Công nợ phải trả mới",
  inventory: "Kho (Tổng hợp tồn)",
};

export const invoiceOptions = [
  { value: "NO_INVOICE", label: "Chưa có hóa đơn" },
  { value: "HAS_INVOICE", label: "Đã có hóa đơn" },
  { value: "NOT_REQUIRED", label: "Không yêu cầu" },
];

export const salesStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Hủy" },
];

export const purchaseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
];

export const expenseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "CANCELLED", label: "Hủy" },
];

export const recurrenceOptions = [
  { value: "ONE_TIME", label: "Một lần" },
  { value: "MONTHLY", label: "Hàng tháng" },
  { value: "QUARTERLY", label: "Hàng quý" },
  { value: "YEARLY", label: "Hàng năm" },
];

export const lineTypeOptions = [
  { value: "SERVICE", label: "Dịch vụ" },
  { value: "PRODUCT", label: "Hàng hóa" },
  { value: "PART", label: "Phụ tùng" },
  { value: "EXPENSE", label: "Chi phí" },
];

export const newTempId = () =>
  `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function getDocNo(row: OperationalDocument) {
  return row.order_no || row.purchase_no || row.expense_no || "—";
}

export function getPartner(row: OperationalDocument) {
  return (
    row.customer_name_snapshot || row.supplier_name_snapshot || row.title || "—"
  );
}
