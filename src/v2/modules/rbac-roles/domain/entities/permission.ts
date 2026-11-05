export type CrudAction = "create" | "read" | "update" | "delete";

export const CRUD_ACTIONS: { action: CrudAction; labelKey: string }[] = [
  { action: "read", labelKey: "v2.rbacRoles.actions.read" },
  { action: "create", labelKey: "v2.rbacRoles.actions.createAction" },
  { action: "update", labelKey: "v2.rbacRoles.actions.updateAction" },
  { action: "delete", labelKey: "v2.rbacRoles.actions.deleteAction" },
];

export interface CorePermissionItem {
  id?: string;
  roleId?: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown> | null;
}

export type PermissionMap = Record<string, Record<CrudAction, boolean>>;

export interface ResourceItem {
  resource: string;
  label: string;
}

export interface GroupedResource {
  groupKey: string;
  label: string;
  items: ResourceItem[];
}

export const FALLBACK_RESOURCES: ResourceItem[] = [
  { resource: "admin_users", label: "Người dùng (Admin Users)" },
  { resource: "employees", label: "Nhân viên" },
  { resource: "business_partners", label: "Đối tác kinh doanh" },
  { resource: "purchase_orders", label: "Đơn mua hàng" },
  { resource: "purchase_requests", label: "Yêu cầu mua hàng" },
  { resource: "sales_orders", label: "Đơn bán hàng" },
  { resource: "sales_reports", label: "Báo cáo bán hàng" },
  { resource: "purchasing_reports", label: "Báo cáo mua hàng" },
  { resource: "inventory_items", label: "Hàng hoá tồn kho" },
  { resource: "inventory_vouchers", label: "Chứng từ kho" },
  { resource: "goods_receipts", label: "Phiếu nhập kho" },
  { resource: "goods_issues", label: "Phiếu xuất kho" },
  { resource: "inventory_adjustments", label: "Điều chỉnh kho" },
  { resource: "bom", label: "Định mức sản xuất (BOM)" },
  { resource: "production", label: "Lệnh sản xuất" },
  { resource: "garage", label: "Garage dịch vụ" },
  { resource: "garage_debts", label: "Công nợ Garage" },
  { resource: "garage_cashflow", label: "Thu chi xưởng Garage" },
  { resource: "garage_goods_receipts", label: "Nhập kho Garage" },
  { resource: "garage_procurement_requests", label: "Yêu cầu mua hàng Garage" },
  { resource: "garage_procurement_orders", label: "Đơn mua hàng Garage" },
  { resource: "vinfast", label: "Phụ tùng VinFast" },
  { resource: "vehicles", label: "Xe cộ & Phương tiện" },
  { resource: "invoices", label: "Hóa đơn điện tử" },
  { resource: "invoice_debts", label: "Công nợ hóa đơn" },
  { resource: "bank_statements", label: "Sao kê ngân hàng" },
  { resource: "cash_statements", label: "Sổ quỹ tiền mặt" },
  { resource: "journal_entries", label: "Bút toán sổ nhật ký" },
  { resource: "accounting_configs", label: "Cấu hình kế toán" },
  { resource: "payment_vouchers", label: "Phiếu thu / Phiếu chi" },
  { resource: "activity_logs", label: "Nhật ký hoạt động" },
  { resource: "email_ingest", label: "Hộp thư hệ thống" },
  { resource: "sys_tags", label: "Thẻ hệ thống" },
  { resource: "attachments", label: "Tệp đính kèm" },
];
