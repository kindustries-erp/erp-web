import {
  LayoutDashboard,
  Boxes,
  FileText,
  Package,
  Settings,
} from "lucide-react";
import {
  V2SidebarSectionData,
  V2SidebarNavItem,
} from "@/v2/shared/components/organisms/v2-sidebar";
import { V2_ROUTES, type V2RouteDef } from "@/v2/app/router/v2RouteConfig";
import type { V2PermissionRequirement } from "@/v2/shared/hooks/useV2HasPermission";
import { NAV_DEFS, SECTION_DEFS } from "./v2Navigation.config";

export type TranslationFn = (key: string, fallback?: string) => string;

export type V2PermissionCheck = (
  requirement?: V2PermissionRequirement,
) => boolean;

/** Ẩn mục menu mà route cùng `id` đòi quyền người dùng không có */
export function filterV2NavItems<T extends { id: string }>(
  items: T[],
  can: V2PermissionCheck,
  routes: V2RouteDef[] = V2_ROUTES,
): T[] {
  return items.filter((item) =>
    can(routes.find((route) => route.id === item.id)?.permission),
  );
}

/** Như `filterV2NavItems`, và bỏ luôn nhóm không còn mục nào */
export function filterV2NavSections(
  sections: V2SidebarSectionData[],
  can: V2PermissionCheck,
  routes: V2RouteDef[] = V2_ROUTES,
): V2SidebarSectionData[] {
  return sections
    .map((section) => ({
      ...section,
      items: filterV2NavItems(section.items, can, routes),
    }))
    .filter((section) => section.items.length > 0);
}

export function getV2NavItems(t: TranslationFn): V2SidebarNavItem[] {
  return [
    {
      id: "dashboard",
      label: t("nav.items.dashboard", "Tổng quan"),
      icon: LayoutDashboard,
      href: "/v2",
    },
    {
      id: "sales-orders",
      label: t("nav.items.erpSalesOrders", "Đơn bán hàng"),
      icon: Boxes,
      href: "/v2/sales-orders",
    },
    {
      id: "purchasing",
      label: t("nav.items.purchasing", "Mua hàng"),
      icon: FileText,
      href: "/v2/purchasing",
    },
    {
      id: "inventory",
      label: t("nav.items.inventoryGroup", "Kho vận"),
      icon: Package,
      href: "/v2/inventory",
    },
    {
      id: "settings",
      label: t("nav.sections.settings", "Cài đặt"),
      icon: Settings,
      href: "/v2/settings",
    },
  ];
}

export function getV2NavigationSections(
  t: TranslationFn,
): V2SidebarSectionData[] {
  return SECTION_DEFS.map((sec) => ({
    id: sec.id,
    label: t(sec.labelKey, sec.fallback),
    items: NAV_DEFS.filter((item) => item.sectionId === sec.id).map((item) => ({
      id: item.id,
      label: t(item.labelKey, item.fallback),
      icon: item.icon,
      href: item.href,
    })),
  }));
}

export const DEFAULT_V2_NAV_ITEMS = getV2NavItems((_, fb) => fb ?? "");
export const DEFAULT_V2_SECTIONS = getV2NavigationSections((_, fb) => fb ?? "");
