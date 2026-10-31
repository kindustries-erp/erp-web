import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShieldCheck,
  FileText,
  Settings,
} from "lucide-react";
import { V2AdminRouteId, V2AdminSectionId } from "@/v2/shared/types";
import type {
  RawNavDef,
  RawSectionDef,
} from "../v2-app-layout/v2Navigation.config";

export const ADMIN_NAV_DEFS: RawNavDef[] = [
  {
    id: V2AdminRouteId.DASHBOARD,
    sectionId: V2AdminSectionId.OVERVIEW,
    labelKey: "v2.admin.nav.items.dashboard",
    fallback: "Tổng quan Quản trị",
    icon: LayoutDashboard,
    href: "/v2/admin/dashboard",
  },
  {
    id: V2AdminRouteId.SALES_REPORTS,
    sectionId: V2AdminSectionId.REPORTS,
    labelKey: "v2.admin.nav.items.salesReport",
    fallback: "Báo cáo bán hàng",
    icon: BarChart3,
    href: "/v2/admin/reports/sales",
  },
  {
    id: V2AdminRouteId.INVENTORY_REPORTS,
    sectionId: V2AdminSectionId.REPORTS,
    labelKey: "v2.admin.nav.items.inventoryReport",
    fallback: "Báo cáo kho vận",
    icon: BarChart3,
    href: "/v2/admin/reports/inventory",
  },
  {
    id: V2AdminRouteId.USERS,
    sectionId: V2AdminSectionId.ACCESS,
    labelKey: "v2.admin.nav.items.users",
    fallback: "Người dùng & Tài khoản",
    icon: Users,
    href: "/v2/admin/users",
  },
  {
    id: V2AdminRouteId.PERMISSIONS,
    sectionId: V2AdminSectionId.ACCESS,
    labelKey: "v2.admin.nav.items.permissions",
    fallback: "Phân quyền & Vai trò",
    icon: ShieldCheck,
    href: "/v2/admin/roles-permissions",
  },
  {
    id: V2AdminRouteId.AUDIT_LOGS,
    sectionId: V2AdminSectionId.ACCESS,
    labelKey: "v2.admin.nav.items.auditLogs",
    fallback: "Nhật ký hoạt động",
    icon: FileText,
    href: "/v2/admin/audit-logs",
  },
  {
    id: V2AdminRouteId.SETTINGS,
    sectionId: V2AdminSectionId.SYSTEM,
    labelKey: "v2.admin.nav.items.settings",
    fallback: "Cấu hình hệ thống",
    icon: Settings,
    href: "/v2/admin/settings",
  },
];

export const ADMIN_SECTION_DEFS: RawSectionDef[] = [
  {
    id: V2AdminSectionId.OVERVIEW,
    labelKey: "v2.admin.nav.sections.overview",
    fallback: "ĐIỀU HÀNH",
  },
  {
    id: V2AdminSectionId.REPORTS,
    labelKey: "v2.admin.nav.sections.reports",
    fallback: "BÁO CÁO CẤP CAO",
  },
  {
    id: V2AdminSectionId.ACCESS,
    labelKey: "v2.admin.nav.sections.access",
    fallback: "BẢO MẬT & TRUY CẬP",
  },
  {
    id: V2AdminSectionId.SYSTEM,
    labelKey: "v2.admin.nav.sections.system",
    fallback: "HỆ THỐNG",
  },
];
