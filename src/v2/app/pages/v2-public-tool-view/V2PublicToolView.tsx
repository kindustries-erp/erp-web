import * as React from "react";
import { LogIn } from "lucide-react";
import { V2AppLayout } from "@/v2/app/layouts/v2-app-layout";
import {
  V2Button,
  V2Text,
  type V2SidebarNavItem,
  type V2SidebarSectionData,
  type V2BreadcrumbItem,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { PUBLIC_TOOLS } from "@/v2/app/router/publicTools.config";
import type { V2PublicToolViewProps } from "./V2PublicToolView.type";

export const V2PublicToolView: React.FC<V2PublicToolViewProps> = ({
  tool,
  isLoggedIn,
  className,
}) => {
  const { t } = useV2Translation();
  const ToolComponent = tool.component;

  const guestSections: V2SidebarSectionData[] = React.useMemo(
    () => [
      {
        id: "tools",
        label: t("v2.nav.sections.tools", "CÔNG CỤ"),
        items: PUBLIC_TOOLS.map((pt) => ({
          id: pt.id,
          label: t(pt.labelKey, pt.fallback),
          icon: pt.icon,
          href: pt.path,
        })),
      },
    ],
    [t],
  );

  const breadcrumbs: V2BreadcrumbItem[] = React.useMemo(
    () => [
      { label: t("v2.nav.sections.tools", "CÔNG CỤ") },
      { label: t(tool.labelKey, tool.fallback) },
    ],
    [t, tool],
  );

  const handleNavigate = React.useCallback((item: V2SidebarNavItem) => {
    if (typeof window === "undefined") return;
    if (item.href) {
      window.history.pushState(null, "", item.href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, []);

  const guestUserMenuNode = React.useCallback(
    ({ collapsed }: { collapsed?: boolean }) => (
      <V2Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = `/login?redirect=${encodeURIComponent(tool.path)}`;
          }
        }}
        aria-label={t("v2.auth.loginAction", "Đăng nhập")}
        className={cn(
          "h-auto flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-accent/60 text-foreground transition-all cursor-pointer min-h-[44px]",
          collapsed ? "justify-center w-full" : "w-full text-left",
        )}
      >
        <LogIn className="w-4 h-4 shrink-0 text-primary" />
        {!collapsed && (
          <V2Text
            as="span"
            variant="body-sm"
            weight="medium"
            className="truncate text-foreground"
          >
            {t("v2.auth.loginAction", "Đăng nhập")}
          </V2Text>
        )}
      </V2Button>
    ),
    [t, tool.path],
  );

  return (
    <V2AppLayout
      activeNavId={tool.id}
      breadcrumbs={breadcrumbs}
      sections={isLoggedIn ? undefined : guestSections}
      userMenuNode={isLoggedIn ? undefined : guestUserMenuNode}
      onNavigate={handleNavigate}
      hideBottomNav={!isLoggedIn}
      contentClassName={cn("pb-16 sm:pb-8", className)}
    >
      <div className="w-full min-h-full max-w-7xl mx-auto py-2 sm:py-4">
        <React.Suspense
          fallback={
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {t("common.loading", "Đang tải...")}
            </div>
          }
        >
          <ToolComponent />
        </React.Suspense>
      </div>
    </V2AppLayout>
  );
};

V2PublicToolView.displayName = "V2PublicToolView";
