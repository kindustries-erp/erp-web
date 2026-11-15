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
  showLabel = true,
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
          "group relative flex items-center justify-center transition-all duration-150 select-none hover:bg-transparent mx-auto active:scale-95 touch-manipulation [-webkit-tap-highlight-color:transparent] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus:bg-transparent shadow-none",
          showLabel
            ? "h-auto flex-col py-1.5 px-1 text-xs font-medium rounded-lg min-w-0 max-w-[64px] w-full"
            : "h-9 w-9 p-0 rounded-lg",
          isActive
            ? "text-foreground font-semibold"
            : "text-muted-fg hover:text-foreground",
          indicator === V2NavIndicator.PILL &&
            isActive &&
            (showLabel
              ? "bg-foreground/5 dark:bg-white/10 text-foreground"
              : "bg-foreground/10 dark:bg-white/15 text-foreground"),
          className,
        )}
        {...props}
      >
        <div className="relative inline-flex items-center justify-center">
          <V2NavIcon
            icon={icon}
            isActive={isActive}
            size={showLabel ? 18 : 20}
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
          truncate={showLabel}
          className={cn(
            !showLabel && "sr-only",
            showLabel &&
              "mt-0.5 max-w-[62px] text-[10px] leading-tight text-inherit font-inherit transition-colors text-center tracking-tight",
            isActive ? "font-semibold text-foreground" : "font-normal",
          )}
        >
          {label}
        </V2Text>
        {indicator === V2NavIndicator.DOT && isActive && (
          <span
            data-testid="bottom-nav-dot"
            aria-hidden="true"
            className={cn(
              "absolute left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-xs transition-transform duration-200",
              showLabel ? "bottom-0.5" : "bottom-1",
            )}
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
