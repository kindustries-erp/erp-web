import * as React from "react";
import { LayoutDashboard } from "lucide-react";
import { V2Sidebar } from "@/v2/shared/components/organisms/v2-sidebar";
import { V2RightPanel } from "@/v2/shared/components/organisms/v2-right-panel";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  getV2NavigationSections,
  DEFAULT_V2_NAV_ITEMS,
  DEFAULT_V2_SECTIONS,
} from "./v2Navigation";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export { DEFAULT_V2_NAV_ITEMS, DEFAULT_V2_SECTIONS };

export const V2AppLayoutDesktop: React.FC<V2AppLayoutProps> = ({
  children,
  activeNavId = "dashboard",
  breadcrumbs,
  userName,
  branchName,
  tenantName = "Enterprise Ecosystem",
  sections,
  navItems,
  tabs,
  activeTabId,
  onNavigate,
  onTabSelect,
  onTabClose,
  onSearchClick,
  onBranchClick,
}) => {
  const { t, locale } = useV2Translation();

  const dynamicSections = React.useMemo(
    () => getV2NavigationSections(t),
    [t, locale],
  );

  const fallbackBreadcrumbs = React.useMemo(
    () => [{ label: t("nav.items.dashboard", "Tổng quan") }],
    [t, locale],
  );

  const fallbackTabs = React.useMemo(
    () => [
      {
        id: "dashboard",
        label: t("nav.items.dashboard", "Tổng quan"),
        icon: LayoutDashboard,
        isClosable: false,
      },
    ],
    [t, locale],
  );

  const effectiveUserName =
    userName ?? t("v2.sidebar.userFallback", "Quản trị viên");
  const effectiveBranchName =
    branchName ?? t("v2.topbar.mainBranch", "Chi nhánh chính");

  return (
    <div
      data-testid="v2-app-layout-desktop"
      className="flex h-screen w-full overflow-hidden p-2 gap-2 bg-[#f4f4f4] dark:bg-background text-foreground select-none"
    >
      {/* Card 1: Sidebar floating card */}
      <V2Sidebar
        sections={sections ?? (navItems ? undefined : dynamicSections)}
        items={navItems}
        activeId={activeNavId}
        onNavigate={onNavigate}
        user={{
          displayName: effectiveUserName,
          avatarInitials: effectiveUserName
            ? effectiveUserName.substring(0, 2).toUpperCase()
            : "AD",
          unreadCount: 0,
        }}
      />

      {/* Card 2: Right Panel floating card with Topbar, Content & TabBar */}
      <V2RightPanel
        breadcrumbs={breadcrumbs ?? fallbackBreadcrumbs}
        branchName={effectiveBranchName}
        companyName={tenantName}
        onSearchClick={onSearchClick}
        onBranchClick={onBranchClick}
        tabs={tabs ?? fallbackTabs}
        activeTabId={activeTabId ?? "dashboard"}
        onTabSelect={onTabSelect ?? (() => {})}
        onTabClose={onTabClose}
      >
        {children}
      </V2RightPanel>
    </div>
  );
};
