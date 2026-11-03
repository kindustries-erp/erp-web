import * as React from "react";
import { V2Sidebar, V2RightPanel } from "@/v2/shared/components";
import { V2WorkspaceModeToggle } from "@/v2/shared/components/molecules/v2-workspace-mode-toggle";
import { V2AdminRouteId } from "@/v2/shared/types";
import { useV2AdminNav } from "./hooks/useV2AdminNav";
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
  const {
    effectiveAppName,
    effectiveTenantName,
    effectiveUserName,
    effectiveBranchName,
    dynamicSections,
    fallbackBreadcrumbs,
    handleNavigate,
  } = useV2AdminNav({
    appName,
    tenantName,
    userName,
    branchName,
    sections,
    onNavigate,
  });

  return (
    <div
      data-testid="v2-admin-layout-desktop"
      className="flex h-screen w-full overflow-hidden p-2 gap-2 bg-background dark:bg-[color:var(--app-shell-bg,#131418)] text-foreground select-none"
    >
      <V2Sidebar
        sections={dynamicSections}
        activeId={activeNavId}
        onNavigate={handleNavigate}
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

V2AdminLayoutDesktop.displayName = "V2AdminLayoutDesktop";
