import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2NavIcon } from "@/v2/shared/components/atoms/v2-nav-icon";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui";
import { V2NavItemProps } from "./V2NavItem.type";

export const V2NavItem: React.FC<V2NavItemProps> = ({
  label,
  icon,
  isActive = false,
  badgeCount,
  variant = "sidebar",
  isCollapsed = false,
  onClick,
  className,
  ...props
}) => {
  if (variant === "bottom-nav") {
    return (
      <V2Button
        type="button"
        variant="ghost"
        onClick={onClick}
        aria-label={label}
        className={cn(
          "group h-auto flex flex-1 flex-col items-center justify-center py-1 px-2 text-xs font-medium transition-colors select-none rounded-none hover:bg-transparent",
          isActive
            ? "text-primary font-semibold"
            : "text-muted-fg hover:text-foreground",
          className,
        )}
        {...props}
      >
        <div className="relative inline-flex items-center justify-center">
          <V2NavIcon icon={icon} isActive={isActive} size={22} />
          {typeof badgeCount === "number" && badgeCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </div>
        <V2Text
          as="span"
          variant="caption"
          truncate
          className="mt-1 max-w-[64px] text-inherit font-inherit"
        >
          {label}
        </V2Text>
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
        <Badge
          variant="secondary"
          className="ml-auto h-5 px-1.5 text-[10px] font-medium"
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </Badge>
      )}
    </V2Button>
  );
};
