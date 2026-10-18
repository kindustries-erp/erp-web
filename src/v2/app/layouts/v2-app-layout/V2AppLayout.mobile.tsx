import * as React from "react";
import { V2Header } from "@/v2/shared/components/organisms/v2-header";
import { V2BottomNav } from "@/v2/shared/components/organisms/v2-bottom-nav";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2PermissionChecker } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  filterV2NavItems,
  filterV2NavSections,
  getV2NavItems,
  getV2NavigationSections,
} from "./v2Navigation";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export const V2AppLayoutMobile: React.FC<V2AppLayoutProps> = ({
  children,
  activeNavId = "dashboard",
  breadcrumbs,
  userName,
  userRole,
  tenantName,
  navItems,
  onNavigate,
}) => {
  const { t, locale } = useV2Translation();
  const can = useV2PermissionChecker();
  const [catalogOpen, setCatalogOpen] = React.useState(false);

  const dynamicNavItems = React.useMemo(
    () => filterV2NavItems(getV2NavItems(t), can),
    [t, locale, can],
  );
  const catalogSections = React.useMemo(
    () => filterV2NavSections(getV2NavigationSections(t), can),
    [t, locale, can],
  );
  const effectiveNavItems = navItems ?? dynamicNavItems;
  const handleMobileNavigate = (item: (typeof effectiveNavItems)[number]) => {
    if (item.id === "catalog") {
      setCatalogOpen(true);
      return;
    }
    onNavigate?.(item);
  };
  const bottomActiveId = effectiveNavItems.some(
    (item) => item.id === activeNavId,
  )
    ? activeNavId
    : "catalog";

  const fallbackBreadcrumbs = React.useMemo(
    () => [{ label: t("v2.nav.items.dashboard", "Tổng quan") }],
    [t, locale],
  );

  const effectiveUserName =
    userName ?? t("v2.sidebar.userFallback", "Quản trị viên");

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
      />
      <main className="flex-1 overflow-y-auto p-4 pb-20 focus:outline-none">
        {children}
      </main>
      <V2BottomNav
        items={effectiveNavItems}
        activeId={bottomActiveId}
        onNavigate={handleMobileNavigate}
      />
      <V2Modal
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        title={t("v2.nav.items.catalog", "Danh mục")}
        size="full"
      >
        <div className="space-y-4">
          {catalogSections.map((section) => (
            <section key={section.id} className="space-y-2">
              <V2Text variant="section-title" color="muted">
                {section.label}
              </V2Text>
              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item) => (
                  <V2Button
                    key={item.id}
                    variant="outline"
                    className="h-auto justify-start gap-2 py-3"
                    onClick={() => {
                      setCatalogOpen(false);
                      onNavigate?.(item);
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="truncate">{item.label}</span>
                  </V2Button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </V2Modal>
    </div>
  );
};
