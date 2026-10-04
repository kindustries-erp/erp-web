import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarIcon } from "@/v2/shared/components/atoms/v2-sidebar-icon";
import { Badge } from "@/v2/shared/ui";
import { V2SidebarNavItemProps } from "./V2SidebarNavItem.type";

export const V2SidebarNavItem: React.FC<V2SidebarNavItemProps> = ({
  label,
  icon,
  iconNode,
  isActive = false,
  isCollapsed = false,
  badgeCount,
  onClick,
  className,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="v2-sidebar-nav-item"
      title={isCollapsed ? label : undefined}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "group flex min-h-[34px] items-center gap-2 mx-2 px-2 py-[7px] rounded-md cursor-pointer whitespace-nowrap overflow-hidden text-[12px] font-medium transition-colors select-none",
        "text-[color:var(--muted-fg)] opacity-75 hover:opacity-100 hover:bg-accent/40 hover:text-foreground",
        isActive &&
          "!text-foreground font-semibold opacity-100 bg-accent/70 shadow-xs",
        isCollapsed && "justify-center px-0 mx-1",
        className,
      )}
    >
      <V2SidebarIcon icon={icon} isActive={isActive}>
        {iconNode}
      </V2SidebarIcon>

      {!isCollapsed && (
        <span className="nav-label flex-1 truncate text-left text-[12px]">
          {label}
        </span>
      )}

      {!isCollapsed && typeof badgeCount === "number" && badgeCount > 0 && (
        <Badge
          variant="secondary"
          className="ml-auto h-4 px-1 text-[9px] font-semibold"
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </Badge>
      )}
    </div>
  );
};
