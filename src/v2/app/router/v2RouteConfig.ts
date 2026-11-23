import { V2AdminRouteId } from "@/v2/shared/types";
import type { V2PermissionRequirement } from "@/v2/shared/hooks/useV2HasPermission";

export interface V2RouteDef {
  /** Trùng `id` của mục menu tương ứng */
  id: string;
  /** Tiền tố đường dẫn, ví dụ `/v2/sales-orders` hoặc `/v2/admin/dashboard` */
  path: string;
  title: string;
  /** Route thuộc khu vực Quản trị Admin */
  isAdmin?: boolean;
  /** Không khai báo nghĩa là mọi người dùng đăng nhập đều vào được */
  permission?: V2PermissionRequirement;
}

/** `id` của trang chủ khi không khớp route nào */
export const V2_DEFAULT_ROUTE_ID = "dashboard";
export const V2_DEFAULT_ADMIN_ROUTE_ID = V2AdminRouteId.DASHBOARD;

export const V2_ROUTES: V2RouteDef[] = [
  // --- Standard / Operational Routes (Không dùng tiền tố /ops) ---
  {
    id: "sales-orders",
    path: "/v2/sales-orders",
    title: "Đơn bán hàng (Sales Orders)",
    permission: { collection: "sales_orders", action: "read" },
  },
  {
    id: "customers",
    path: "/v2/customers",
    title: "Khách hàng",
    permission: { collection: "business_partners", action: "read" },
  },
  {
    id: "after-sales",
    path: "/v2/after-sales",
    title: "Sau bán hàng & Bảo hành",
    permission: { collection: "sales_orders", action: "read" },
  },
  {
    id: "purchasing",
    path: "/v2/purchasing",
    title: "Quản lý mua hàng (Purchasing)",
    permission: { collection: "purchase_orders", action: "read" },
  },
  {
    id: "purchasing-orders",
    path: "/v2/purchasing",
    title: "Đơn mua hàng",
    permission: { collection: "purchase_orders", action: "read" },
  },
  {
    id: "suppliers",
    path: "/v2/suppliers",
    title: "Nhà cung cấp",
    permission: { collection: "business_partners", action: "read" },
  },
  {
    id: "inventory",
    path: "/v2/inventory",
    title: "Kho vận (Inventory)",
    permission: { collection: "inventory_items", action: "read" },
  },
  {
    id: "inventory-stock",
    path: "/v2/inventory",
    title: "Tồn kho thực tế",
    permission: { collection: "inventory_items", action: "read" },
  },
  {
    id: "inventory-vouchers",
    path: "/v2/inventory-vouchers",
    title: "Chứng từ kho",
    permission: { collection: "inventory_vouchers", action: "read" },
  },
  {
    id: "bom",
    path: "/v2/bom",
    title: "Định mức BOM",
    permission: { collection: "bom", action: "read" },
  },
  {
    id: "production",
    path: "/v2/production",
    title: "Lệnh sản xuất",
    permission: { collection: "production", action: "read" },
  },
  {
    id: "invoices",
    path: "/v2/invoices",
    title: "Hóa đơn điện tử",
    permission: { collection: "invoices", action: "read" },
  },
  {
    id: "cashflow",
    path: "/v2/cashflow",
    title: "Sổ quỹ & Sao kê",
    permission: { collection: "garage_cashflow", action: "read" },
  },
  {
    id: "loans",
    path: "/loans-tool",
    title: "Khoản vay & Dòng tiền",
    permission: { collection: "loans", action: "read" },
  },
  {
    id: "settings",
    path: "/v2/settings",
    title: "Cài đặt cá nhân & phân hệ",
  },
  {
    id: "settings-app",
    path: "/v2/settings",
    title: "Cài đặt chung",
  },

  // --- Admin / Management Routes (Dưới tiền tố /v2/admin) ---
  {
    id: V2AdminRouteId.DASHBOARD,
    path: "/v2/admin/dashboard",
    title: "Tổng quan Quản trị",
    isAdmin: true,
  },
  {
    id: V2AdminRouteId.SALES_REPORTS,
    path: "/v2/admin/reports/sales",
    title: "Báo cáo bán hàng",
    isAdmin: true,
  },
  {
    id: V2AdminRouteId.INVENTORY_REPORTS,
    path: "/v2/admin/reports/inventory",
    title: "Báo cáo kho vận",
    isAdmin: true,
  },
  {
    id: V2AdminRouteId.USERS,
    path: "/users-management",
    title: "Quản lý người dùng",
    isAdmin: true,
    permission: { collection: "admin_users", action: "manage" },
  },
  {
    id: V2AdminRouteId.PERMISSIONS,
    path: "/v2/admin/roles-permissions",
    title: "Phân quyền & Vai trò",
    isAdmin: true,
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: V2AdminRouteId.AUDIT_LOGS,
    path: "/v2/admin/audit-logs",
    title: "Nhật ký hoạt động",
    isAdmin: true,
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: V2AdminRouteId.SETTINGS,
    path: "/v2/admin/settings",
    title: "Cấu hình hệ thống",
    isAdmin: true,
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: "garage-stock-vouchers",
    path: "/garage-stock-vouchers",
    title: "Chứng từ kho Garage",
    permission: { collection: "garage_stock_vouchers", action: "read" },
  },
  {
    id: "garage-stock-balances",
    path: "/garage-stock-balances",
    title: "Tồn kho Garage",
    permission: { collection: "garage_stock_ledger", action: "read" },
  },
  {
    id: "garage-procurement",
    path: "/garage-procurement",
    title: "Mua hàng Garage",
    permission: { collection: "garage_procurement_requests", action: "read" },
  },
  {
    id: "permission",
    path: "/permission",
    title: "Phân quyền & Vai trò",
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: "users-management",
    path: "/users-management",
    title: "Quản lý tài khoản",
    permission: { collection: "admin_users", action: "manage" },
  },
  {
    id: "employees-management",
    path: "/employees-management",
    title: "Quản lý nhân viên",
    permission: { collection: "employees", action: "read" },
  },
  {
    id: "file-attachments-management",
    path: "/file-attachments",
    title: "Quản lý tài liệu",
    permission: { collection: "attachments", action: "read" },
  },
  // plop:v2-routes
];

export function isAdminPath(pathname: string): boolean {
  return pathname === "/v2/admin" || pathname.startsWith("/v2/admin/");
}

/** Khớp theo tiền tố đường dẫn, ưu tiên route dài nhất */
export function resolveV2Route(
  pathname: string,
  routes: V2RouteDef[] = V2_ROUTES,
): V2RouteDef | null {
  const matches = routes.filter(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
  );
  if (matches.length === 0) return null;
  return matches.reduce((best, route) =>
    route.path.length > best.path.length ? route : best,
  );
}
