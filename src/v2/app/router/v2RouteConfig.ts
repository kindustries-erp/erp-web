import type { V2PermissionRequirement } from "@/v2/shared/hooks/useV2HasPermission";

export interface V2RouteDef {
  /** Trùng `id` của mục menu tương ứng */
  id: string;
  /** Tiền tố đường dẫn, ví dụ `/v2/sales-orders` */
  path: string;
  title: string;
  /** Không khai báo nghĩa là mọi người dùng đăng nhập đều vào được */
  permission?: V2PermissionRequirement;
}

/** `id` của trang chủ khi không khớp route nào */
export const V2_DEFAULT_ROUTE_ID = "dashboard";

export const V2_ROUTES: V2RouteDef[] = [
  {
    id: "sales-orders",
    path: "/v2/sales-orders",
    title: "Đơn bán hàng (Sales Orders)",
  },
  {
    id: "purchasing",
    path: "/v2/purchasing",
    title: "Quản lý mua hàng (Purchasing)",
  },
  { id: "inventory", path: "/v2/inventory", title: "Kho vận (Inventory)" },
  {
    id: "settings",
    path: "/v2/settings",
    title: "Cấu hình hệ thống (Settings)",
  },
];

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
