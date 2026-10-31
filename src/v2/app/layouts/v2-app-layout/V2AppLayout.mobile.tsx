import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2Header,
  V2BottomNav,
  V2MobileCatalogDrawer,
} from "@/v2/shared/components";
import { MAX_PINNED_MOBILE_NAV } from "@/v2/shared/stores/useV2MobileNavStore";
import { useV2MobileNav } from "./hooks/useV2MobileNav";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export const V2AppLayoutMobile: React.FC<V2AppLayoutProps> = ({
  children,
  activeNavId = "dashboard",
  breadcrumbs,
  userName,
  userRole,
  tenantName,
  branchName,
  logoUrl,
  sections,
  navItems,
  onNavigate,
  onBranchClick,
  onClickLogo,
  contentClassName,
  userMenuNode,
  notificationNode,
  currentTheme,
  onThemeChange,
  bottomNavVariant = "floating",
  bottomNavIndicator = "pill",
}) => {
  const {
    t,
    locale,
    catalogOpen,
    setCatalogOpen,
    closeCatalog,
    searchQuery,
    setSearchQuery,
    isCustomizing,
    setIsCustomizing,
    limitWarning,
    pinnedIds,
    setPinnedIds,
    resetToDefault,
    allAvailableItems,
    filteredSections,
    default4Items,
    currentSelectedIds,
    quick4Items,
    allMenuItem,
    bottomActiveId,
    handleMobileNavigate,
    handleToggleItem,
  } = useV2MobileNav({
    activeNavId,
    sections,
    navItems,
    onNavigate,
  });

  const fallbackBreadcrumbs = React.useMemo(
    () => [{ label: t("v2.nav.items.dashboard", "Tổng quan") }],
    [t, locale],
  );

  const effectiveUserName =
    userName ?? t("v2.sidebar.userFallback", "Quản trị viên");

  const filteredSectionsCount = React.useMemo(
    () => filteredSections.reduce((acc, s) => acc + s.items.length, 0),
    [filteredSections],
  );

  return (
    <div
      data-testid="v2-app-layout-mobile"
      className="flex min-h-screen w-full flex-col bg-background text-foreground"
    >
      <V2Header
        breadcrumbs={breadcrumbs ?? fallbackBreadcrumbs}
        userName={effectiveUserName}
        userRole={userRole}
        tenantName={tenantName}
        branchName={branchName}
        logoUrl={logoUrl}
        onBranchClick={onBranchClick ?? onClickLogo}
        userMenuNode={userMenuNode}
        notificationNode={notificationNode}
      />
      <main
        tabIndex={-1}
        className={cn(
          "flex-1 overflow-y-auto px-2 py-2.5 pb-20 focus:outline-none sm:px-4 sm:py-4",
          contentClassName,
        )}
      >
        {children}
      </main>
      <V2BottomNav
        items={navItems ?? quick4Items}
        centerHeroItem={allMenuItem}
        activeId={bottomActiveId}
        variant={bottomNavVariant}
        indicator={bottomNavIndicator}
        onNavigate={handleMobileNavigate}
        onHeroClick={() => setCatalogOpen(true)}
      />
      <V2MobileCatalogDrawer
        open={catalogOpen}
        onOpenChange={(open) => {
          setCatalogOpen(open);
          if (!open) closeCatalog();
        }}
        totalModulesCount={allAvailableItems.length}
        filteredSectionsCount={filteredSectionsCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        isCustomizing={isCustomizing}
        limitWarning={limitWarning}
        currentCount={currentSelectedIds.length}
        maxCount={MAX_PINNED_MOBILE_NAV}
        onStartCustomize={() => {
          if (pinnedIds.length === 0) {
            setPinnedIds(default4Items.map((it) => it.id));
          }
          setIsCustomizing(true);
        }}
        onFinishCustomize={() => setIsCustomizing(false)}
        onResetDefault={() => resetToDefault()}
        sections={filteredSections}
        selectedIds={currentSelectedIds}
        activeNavId={activeNavId}
        onItemClick={(item) => {
          if (isCustomizing) {
            handleToggleItem(item.id);
          } else {
            setCatalogOpen(false);
            onNavigate?.(item);
          }
        }}
      />
    </div>
  );
};

V2AppLayoutMobile.displayName = "V2AppLayoutMobile";
