import type { PageKey } from "@/shared/types";

/**
 * Flat list of all application routes.
 * Each entry maps a PageKey to its human-readable label and
 * the module/group it belongs to.
 */
export interface RouteConfig {
  key: PageKey;
  label: string;
  group: string;
}

export const ROUTES: RouteConfig[] = [
  { key: "dashboard", label: "Bảng điều khiển", group: "dashboard" },
  { key: "cashflow", label: "Tổng hợp dòng tiền", group: "cashflow" },
  { key: "cashflow-vouchers", label: "Phiếu thu chi", group: "cashflow" },
  { key: "bank-statement", label: "Sao kê Ngân hàng", group: "cashflow" },
  { key: "cash-statement", label: "Sao kê Tiền mặt", group: "cashflow" },
  { key: "cash-fund", label: "Tiền mặt", group: "cashflow" },
  { key: "bank-deposit", label: "UNT / UNC", group: "cashflow" },
  { key: "attachments", label: "Quản lý tài liệu", group: "admin" },
  { key: "email-inbox", label: "Hộp thư", group: "system" },
  { key: "attachments", label: "Quản lý tài liệu", group: "admin" },
  { key: "settings-cash-fund", label: "Quỹ tiền mặt", group: "settings" },
  { key: "settings-bank", label: "Tài khoản ngân hàng", group: "settings" },
  { key: "settings-accounts", label: "Hệ thống tài khoản", group: "settings" },
  { key: "receivables", label: "Phải thu", group: "debt" },
  { key: "payables", label: "Phải trả", group: "debt" },
  { key: "ledger", label: "Sổ cái", group: "reports" },
  { key: "journal", label: "Nhật ký chung", group: "reports" },
  { key: "partners", label: "Đối tác", group: "partners" },
  { key: "employees", label: "Nhân sự", group: "hr" },
  { key: "invoice-dashboard", label: "Tổng quan hóa đơn", group: "dashboard" },

  { key: "customers", label: "Khách hàng", group: "sales" },
  {
    key: "sales-report-dashboard",
    label: "Tổng quan bán hàng",
    group: "sales",
  },
  { key: "purchasing", label: "Đơn mua hàng", group: "purchasing" },
  {
    key: "purchasing-report-dashboard",
    label: "Tổng quan mua hàng",
    group: "purchasing",
  },
  { key: "suppliers", label: "Nhà cung cấp", group: "purchasing" },
  { key: "permissions", label: "Phân quyền & Vai trò", group: "system" },
  {
    key: "erp-permissions-core",
    label: "Phân quyền & Vai trò",
    group: "system",
  },
  { key: "sys-tags", label: "Quản lý thẻ", group: "system" },
  { key: "settings-branch", label: "Chi nhánh", group: "settings" },
];
