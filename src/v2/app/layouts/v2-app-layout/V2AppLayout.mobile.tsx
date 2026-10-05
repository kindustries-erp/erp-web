import * as React from "react";
import { V2Header } from "@/v2/shared/components/organisms/v2-header";
import { V2BottomNav } from "@/v2/shared/components/organisms/v2-bottom-nav";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { getV2NavItems } from "./v2Navigation";
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

  const dynamicNavItems = React.useMemo(() => getV2NavItems(t), [t, locale]);

  const fallbackBreadcrumbs = React.useMemo(
    () => [{ label: t("nav.items.dashboard", "Tổng quan") }],
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
        items={navItems ?? dynamicNavItems}
        activeId={activeNavId}
        onNavigate={onNavigate}
      />
    </div>
  );
};
