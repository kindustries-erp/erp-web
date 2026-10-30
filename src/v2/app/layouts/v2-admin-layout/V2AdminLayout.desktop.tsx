import * as React from "react";
import { V2Sidebar, V2RightPanel } from "@/v2/shared/components";
import { V2WorkspaceModeToggle } from "@/v2/shared/components/molecules/v2-workspace-mode-toggle";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2AdminRouteId } from "@/v2/shared/types";
import { getV2AdminNavigationSections } from "./v2AdminNavigation";
import type { V2AdminLayoutProps } from "./V2AdminLayout.type";

export const V2AdminLayoutDesktop: React.FC<V2AdminLayoutProps> = ({
  children,
  activeNavId = V2AdminRouteId.DASHBOARD,
  breadcrumbs,
  userName,
  branchName,
  tenantName,
  sections,
  onNavigate,
  onSearchClick,
  onBranchClick,
  appName,
  logoUrl,
  contentClassName,
  notificationNode,
  collapsed,
  onToggleCollapse,
}) => {
  const { t, locale } = useV2Translation();

  const effectiveAppName = appName ?? t("v2.admin.app.name", "ERP Admin");
  const effectiveTenantName =
    tenantName ?? t("v2.admin.app.tenantName", "Enterprise Ecosystem");

  const dynamicSections = React.useMemo(
    () => sections ?? getV2AdminNavigationSections(t),
    [sections, t, locale],
  );

  const fallbackBreadcrumbs = React.useMemo(
    () => [{ label: t("v2.admin.nav.items.dashboard", "Tổng quan Quản trị") }],
    [t, locale],
  );

  const effectiveUserName =
    userName ?? t("v2.sidebar.userFallback", "Quản trị viên");
  const effectiveBranchName =
    branchName ?? t("v2.topbar.mainBranch", "Chi nhánh chính");

  return (
    <div
      data-testid="v2-admin-layout-desktop"
      className="flex h-screen w-full overflow-hidden p-2 gap-2 bg-[#f4f4f4] dark:bg-[color:var(--app-shell-bg,#131418)] text-foreground select-none"
    >
      <V2Sidebar
        sections={dynamicSections}
        activeId={activeNavId}
        onNavigate={onNavigate}
        appName={effectiveAppName}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        notificationNode={notificationNode}
        user={{
          displayName: effectiveUserName,
          avatarInitials: effectiveUserName
            ? effectiveUserName.substring(0, 2).toUpperCase()
            : "AD",
          unreadCount: 0,
        }}
      />

      <V2RightPanel
        breadcrumbs={breadcrumbs ?? fallbackBreadcrumbs}
        branchName={effectiveBranchName}
        companyName={effectiveTenantName}
        logoUrl={logoUrl}
        onSearchClick={onSearchClick}
        onBranchClick={onBranchClick}
        topbarActions={<V2WorkspaceModeToggle />}
        contentClassName={contentClassName}
      >
        {children}
      </V2RightPanel>
    </div>
  );
};
