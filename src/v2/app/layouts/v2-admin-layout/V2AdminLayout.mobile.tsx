import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Header } from "@/v2/shared/components";
import { V2WorkspaceModeToggle } from "@/v2/shared/components/molecules/v2-workspace-mode-toggle";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2AdminRouteId } from "@/v2/shared/types";
import { V2AdminBottomNav } from "./components/v2-admin-bottom-nav";
import type { V2AdminLayoutProps } from "./V2AdminLayout.type";

export const V2AdminLayoutMobile: React.FC<V2AdminLayoutProps> = ({
  children,
  activeNavId = V2AdminRouteId.DASHBOARD,
  onNavigate,
  appName,
  contentClassName,
}) => {
  const { t } = useV2Translation();
  const effectiveAppName = appName ?? t("v2.admin.app.name", "ERP Admin");

  return (
    <div
      data-testid="v2-admin-layout-mobile"
      className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground"
    >
      {/* Top Header */}
      <V2Header
        title={effectiveAppName}
        notificationNode={<V2WorkspaceModeToggle />}
        className="shrink-0 border-b border-border"
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-3 pb-16 focus:outline-none",
          contentClassName,
        )}
      >
        {children}
      </main>

      {/* Standard V2 Admin Bottom Navigation */}
      <V2AdminBottomNav activeId={activeNavId} onNavigate={onNavigate as any} />
    </div>
  );
};
