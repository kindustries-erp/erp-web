import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarLogo } from "@/v2/shared/components/atoms/v2-sidebar-logo";
import { V2SidebarToggleBtn } from "@/v2/shared/components/atoms/v2-sidebar-toggle-btn";
import { V2SidebarHeaderProps } from "./V2SidebarHeader.type";

export const V2SidebarHeader: React.FC<V2SidebarHeaderProps> = ({
  appName = "LIOUNI ERP",
  isCollapsed = false,
  onToggle,
  onClickLogo,
  className,
}) => {
  return (
    <div
      data-testid="v2-sidebar-header"
      className={cn(
        "sidebar-header flex h-12 flex-shrink-0 items-center gap-2 border-b border-border px-[10px] transition-all duration-200 select-none",
        className,
      )}
    >
      <div
        onClick={onClickLogo}
        className={cn(
          "sidebar-logo-wrap flex flex-1 min-w-0 items-center gap-2 overflow-hidden transition-all duration-200",
          onClickLogo && "cursor-pointer hover:opacity-80",
        )}
      >
        <V2SidebarLogo />
        {!isCollapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[13px] font-semibold leading-[1.2] text-foreground line-clamp-2">
              {appName}
            </p>
          </div>
        )}
      </div>

      <V2SidebarToggleBtn isCollapsed={isCollapsed} onClick={onToggle} />
    </div>
  );
};
