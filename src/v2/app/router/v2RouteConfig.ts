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
  },
  {
    id: "customers",
    path: "/v2/customers",
    title: "Khách hàng",
    permission: { collection: "business_partners", action: "read" },
  },
  {
    id: "purchasing",
    path: "/v2/purchasing",
    title: "Quản lý mua hàng (Purchasing)",
  },
  {
    id: "suppliers",
    path: "/v2/suppliers",
    title: "Nhà cung cấp",
    permission: { collection: "business_partners", action: "read" },
  },
  {
    id: "invoices",
    path: "/v2/invoices",
    title: "Hóa đơn điện tử",
    permission: { collection: "invoices", action: "read" },
  },
  {
    id: "loans",
    path: "/v2/loans",
    title: "Khoản vay & Dòng tiền",
    permission: { collection: "loans", action: "read" },
  },
  { id: "inventory", path: "/v2/inventory", title: "Kho vận (Inventory)" },
  {
    id: "settings",
    path: "/v2/settings",
    title: "Cài đặt cá nhân & phân hệ",
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
    path: "/v2/admin/users",
    title: "Quản lý người dùng",
    isAdmin: true,
    permission: { collection: "admin_users", action: "read" },
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
    id: "garage-goods-receipts",
    path: "/garage-goods-receipts",
    title: "Nhập kho Garage",
    permission: { collection: "garage_goods_receipts", action: "read" },
  },
  {
    id: "garage-goods-receipts",
    path: "/v2/garage-goods-receipts",
    title: "Nhập kho Garage",
    permission: { collection: "garage_goods_receipts", action: "read" },
  },
  {
    id: "garage-procurement",
    path: "/garage-procurement",
    title: "Mua hàng Garage",
    permission: { collection: "garage_procurement_requests", action: "read" },
  },
  {
    id: "garage-procurement",
    path: "/v2/garage-procurement",
    title: "Mua hàng Garage",
    permission: { collection: "garage_procurement_requests", action: "read" },
  },
  // v2-module:garage-goods-receipts:routes
  {
    id: "permission",
    path: "/permission",
    title: "Phân quyền & Vai trò",
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: "permission-v2",
    path: "/v2/permission",
    title: "Phân quyền & Vai trò",
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: "erp-permissions-core",
    path: "/erp-permissions-core",
    title: "Phân quyền & Vai trò",
    permission: { collection: "admin_users", action: "read" },
  },
  {
    id: "erp-permissions-core-v2",
    path: "/v2/erp-permissions-core",
    title: "Phân quyền & Vai trò",
    permission: { collection: "admin_users", action: "read" },
  },
  // v2-module:rbac-roles:routes
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
