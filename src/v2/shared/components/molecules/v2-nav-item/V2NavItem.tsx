import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2Button,
  V2Text,
  V2Badge,
  V2BadgeVariant,
  V2NavIcon,
} from "@/v2/shared/components/atoms";
import {
  V2NavItemProps,
  V2NavItemVariant,
  V2NavIndicator,
} from "./V2NavItem.type";

export const V2NavItem: React.FC<V2NavItemProps> = ({
  label,
  icon,
  isActive = false,
  badgeCount,
  variant = V2NavItemVariant.SIDEBAR,
  indicator = V2NavIndicator.PILL,
  isCollapsed = false,
  onClick,
  className,
  ...props
}) => {
  const isBottomNav = variant === V2NavItemVariant.BOTTOM_NAV;

  if (isBottomNav) {
    return (
      <V2Button
        type="button"
        variant="ghost"
        onClick={onClick}
        aria-label={label}
        className={cn(
          "group relative h-auto flex flex-col items-center justify-center py-1 px-0.5 text-xs font-medium transition-all duration-150 select-none rounded-lg hover:bg-transparent min-w-0 max-w-[52px] w-full mx-auto active:scale-95 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus:bg-transparent shadow-none",
          isActive
            ? "text-foreground font-semibold"
            : "text-muted-fg hover:text-foreground",
          indicator === V2NavIndicator.PILL &&
            isActive &&
            "bg-foreground/5 dark:bg-white/10 text-foreground",
          className,
        )}
        {...props}
      >
        <div className="relative inline-flex items-center justify-center">
          <V2NavIcon
            icon={icon}
            isActive={isActive}
            size={16}
            className={cn(
              "transition-transform duration-200",
              isActive && "text-foreground",
            )}
          />
          {typeof badgeCount === "number" && badgeCount > 0 && (
            <V2Badge
              variant={V2BadgeVariant.DESTRUCTIVE}
              className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] font-bold shadow-xs border-0"
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </V2Badge>
          )}
        </div>
        <V2Text
          as="span"
          variant="caption"
          truncate
          className={cn(
            "mt-0.5 max-w-[48px] text-[9px] leading-tight text-inherit font-inherit transition-colors text-center tracking-tight",
            isActive ? "font-semibold text-foreground" : "font-normal",
          )}
        >
          {label}
        </V2Text>
        {indicator === V2NavIndicator.DOT && isActive && (
          <span
            data-testid="bottom-nav-dot"
            aria-hidden="true"
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-xs transition-transform duration-200"
          />
        )}
      </V2Button>
    );
  }

  return (
    <V2Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-label={label}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group h-auto flex w-full items-center rounded-lg text-sm font-medium transition-all duration-150 select-none",
        isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
        isActive
          ? "bg-accent/80 text-primary font-semibold shadow-xs hover:bg-accent/80"
          : "text-muted-fg hover:bg-accent/40 hover:text-foreground",
        className,
      )}
      {...props}
    >
      <V2NavIcon icon={icon} isActive={isActive} size={18} />
      {!isCollapsed && (
        <V2Text
          as="span"
          variant="body-sm"
          truncate
          className="flex-1 text-left text-inherit font-inherit"
        >
          {label}
        </V2Text>
      )}
      {!isCollapsed && typeof badgeCount === "number" && badgeCount > 0 && (
        <V2Badge
          variant={V2BadgeVariant.SECONDARY}
          className="ml-auto h-5 px-1.5 text-[10px] font-medium"
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </V2Badge>
      )}
    </V2Button>
  );
};

V2NavItem.displayName = "V2NavItem";
