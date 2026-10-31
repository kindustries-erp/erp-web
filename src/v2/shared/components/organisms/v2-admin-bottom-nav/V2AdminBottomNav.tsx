import * as React from "react";
import { LayoutDashboard, BarChart3, Users, Settings } from "lucide-react";
import { V2Button, V2Text, V2NavIcon } from "@/v2/shared/components/atoms";
import { V2NavIndicator } from "@/v2/shared/components/molecules/v2-nav-item";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2AdminRouteId } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2AdminBottomNavProps,
  V2AdminNavItemDef,
  V2AdminBottomNavVariant,
} from "./V2AdminBottomNav.type";

export const V2AdminBottomNav: React.FC<V2AdminBottomNavProps> = ({
  activeId = V2AdminRouteId.DASHBOARD,
  items,
  variant = V2AdminBottomNavVariant.GROUNDED,
  indicator = V2NavIndicator.PILL,
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
  const isFloating = variant === V2AdminBottomNavVariant.FLOATING;
  const isPill = indicator === V2NavIndicator.PILL;
  const isDot = indicator === V2NavIndicator.DOT;

  const containerClasses = cn(
    "fixed z-30 flex items-center justify-around select-none animate-slide-in-from-bottom transition-all duration-300",
    isFloating
      ? "bottom-3 inset-x-3 max-w-lg mx-auto h-16 rounded-2xl border border-border/80 dark:border-white/10 bg-card/85 dark:bg-card/90 px-2 shadow-xl dark:shadow-2xl dark:shadow-black/60 backdrop-blur-xl"
      : "bottom-0 inset-x-0 h-16 bg-background/90 dark:bg-card/90 backdrop-blur-xl border-t border-border/80 dark:border-white/10 px-2 pb-safe",
    className,
  );

  return (
    <nav
      data-testid="v2-admin-bottom-nav"
      aria-label={t("v2.admin.nav.ariaLabel", "Mobile Admin Navigation")}
      className={containerClasses}
    >
      {effectiveItems.map((item) => {
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
              "group relative h-auto flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl hover:bg-transparent transition-all duration-200 select-none active:scale-95 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-fg hover:text-foreground",
              isPill &&
                isActive &&
                "bg-primary/10 text-primary dark:bg-primary/15",
            )}
          >
            <V2NavIcon
              icon={item.icon}
              isActive={isActive}
              size={18}
              className="mb-0.5"
            />
            <V2Text
              as="span"
              variant="caption"
              truncate
              className="text-[10px] leading-tight text-inherit font-inherit max-w-[64px]"
            >
              {item.label}
            </V2Text>
            {isDot && isActive && (
              <span
                data-testid="admin-bottom-nav-dot"
                aria-hidden="true"
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-xs transition-transform duration-200"
              />
            )}
          </V2Button>
        );
      })}
    </nav>
  );
};

V2AdminBottomNav.displayName = "V2AdminBottomNav";
