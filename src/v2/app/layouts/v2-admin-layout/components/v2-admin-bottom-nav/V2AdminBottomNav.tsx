import * as React from "react";
import { LayoutDashboard, BarChart3, Users, Settings } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2AdminRouteId } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import type {
  V2AdminBottomNavProps,
  V2AdminNavItemDef,
} from "./V2AdminBottomNav.type";

export const V2AdminBottomNav: React.FC<V2AdminBottomNavProps> = ({
  activeId = V2AdminRouteId.DASHBOARD,
  items,
  onNavigate,
  className,
}) => {
  const { t } = useV2Translation();

  const defaultNavItems: V2AdminNavItemDef[] = React.useMemo(
    () => [
      {
        id: V2AdminRouteId.DASHBOARD,
        label: t("v2.admin.nav.items.dashboard", "Tổng quan"),
        icon: LayoutDashboard,
        href: "/v2/admin/dashboard",
      },
      {
        id: V2AdminRouteId.SALES_REPORTS,
        label: t("v2.admin.nav.items.salesReport", "Báo cáo"),
        icon: BarChart3,
        href: "/v2/admin/reports/sales",
      },
      {
        id: V2AdminRouteId.USERS,
        label: t("v2.admin.nav.items.users", "Người dùng"),
        icon: Users,
        href: "/v2/admin/users",
      },
      {
        id: V2AdminRouteId.SETTINGS,
        label: t("v2.admin.nav.items.settings", "Cài đặt"),
        icon: Settings,
        href: "/v2/admin/settings",
      },
    ],
    [t],
  );

  const effectiveItems = items ?? defaultNavItems;

  return (
    <nav
      data-testid="v2-admin-bottom-nav"
      aria-label={t("v2.admin.nav.ariaLabel", "Mobile Admin Navigation")}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 h-14 bg-background/95 backdrop-blur border-t border-border flex items-center justify-around px-2 select-none animate-slide-in-from-bottom",
        className,
      )}
    >
      {effectiveItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

        return (
          <V2Button
            key={item.id}
            type="button"
            variant="ghost"
            onClick={() => onNavigate?.(item)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            data-testid={`admin-nav-item-${item.id}`}
            className={cn(
              "group h-full flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-none hover:bg-transparent transition-colors",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={18} className="mb-0.5 shrink-0" />
            <V2Text
              as="span"
              variant="caption"
              truncate
              className="text-[10px] leading-tight text-inherit font-inherit max-w-[64px]"
            >
              {item.label}
            </V2Text>
          </V2Button>
        );
      })}
    </nav>
  );
};

V2AdminBottomNav.displayName = "V2AdminBottomNav";
