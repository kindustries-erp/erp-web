import * as React from "react";
import type {
  V2SidebarNavItem,
  V2SidebarSectionData,
  V2BreadcrumbItem,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { getV2AdminNavigationSections } from "../navigation";
import type { V2AdminLayoutProps } from "../V2AdminLayout.type";

export type UseV2AdminNavProps = Pick<
  V2AdminLayoutProps,
  | "appName"
  | "tenantName"
  | "userName"
  | "branchName"
  | "sections"
  | "onNavigate"
>;

export function useV2AdminNav({
  appName,
  tenantName,
  userName,
  branchName,
  sections,
  onNavigate,
}: UseV2AdminNavProps = {}) {
  const { t, locale } = useV2Translation();

  const effectiveAppName = appName ?? t("v2.admin.app.name", "ERP Admin");
  const effectiveTenantName =
    tenantName ?? t("v2.admin.app.tenantName", "Enterprise Ecosystem");
  const effectiveUserName =
    userName ?? t("v2.sidebar.userFallback", "Quản trị viên");
  const effectiveBranchName =
    branchName ?? t("v2.topbar.mainBranch", "Chi nhánh chính");

  const dynamicSections: V2SidebarSectionData[] = React.useMemo(
    () => sections ?? getV2AdminNavigationSections(t),
    [sections, t, locale],
  );

  const fallbackBreadcrumbs: V2BreadcrumbItem[] = React.useMemo(
    () => [{ label: t("v2.admin.nav.items.dashboard", "Tổng quan Quản trị") }],
    [t, locale],
  );

  const handleNavigate = React.useCallback(
    (item: V2SidebarNavItem) => {
      onNavigate?.(item);
    },
    [onNavigate],
  );

  const handleMobileNavigate = React.useCallback(
    (item: { id: string; label?: string; href?: string; icon?: any }) => {
      onNavigate?.({
        id: item.id,
        label: item.label ?? item.id,
        href: item.href ?? `#${item.id}`,
        icon: item.icon,
      });
    },
    [onNavigate],
  );

  return {
    t,
    locale,
    effectiveAppName,
    effectiveTenantName,
    effectiveUserName,
    effectiveBranchName,
    dynamicSections,
    fallbackBreadcrumbs,
    handleNavigate,
    handleMobileNavigate,
  };
}
