import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarIconProps } from "./V2SidebarIcon.type";

export const V2SidebarIcon: React.FC<V2SidebarIconProps> = ({
  icon: Icon,
  children,
  isActive = false,
  className,
}) => {
  return (
    <span
      data-testid="v2-sidebar-icon"
      className={cn(
        "nav-icon flex h-4 w-4 min-w-[16px] items-center justify-center flex-shrink-0 transition-all duration-150 select-none",
        isActive
          ? "opacity-100 text-foreground"
          : "opacity-65 text-[color:var(--muted-fg)] group-hover:opacity-100 group-hover:text-foreground",
        className,
      )}
    >
      {Icon ? (
        <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
      ) : (
        children
      )}
    </span>
  );
};
