import * as React from "react";
import { V2Header } from "@/v2/shared/components/organisms/v2-header";
import { V2BottomNav } from "@/v2/shared/components/organisms/v2-bottom-nav";
import { DEFAULT_V2_NAV_ITEMS } from "./V2AppLayout.desktop";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export const V2AppLayoutMobile: React.FC<V2AppLayoutProps> = ({
  children,
  activeNavId = "dashboard",
  breadcrumbs,
  userName,
  userRole,
  tenantName,
  navItems = DEFAULT_V2_NAV_ITEMS,
  onNavigate,
}) => {
  return (
    <div
      data-testid="v2-app-layout-mobile"
      className="flex min-h-screen w-full flex-col bg-background text-foreground"
    >
      <V2Header
        breadcrumbs={breadcrumbs}
        userName={userName}
        userRole={userRole}
        tenantName={tenantName}
      />
      <main className="flex-1 overflow-y-auto p-4 pb-20 focus:outline-none">
        {children}
      </main>
      <V2BottomNav
        items={navItems}
        activeId={activeNavId}
        onNavigate={onNavigate}
      />
    </div>
  );
};
