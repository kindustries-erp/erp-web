import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarLogoProps } from "./V2SidebarLogo.type";

export const V2SidebarLogo: React.FC<V2SidebarLogoProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      data-testid="v2-sidebar-logo"
      className={cn(
        "flex h-6 w-6 min-w-[24px] items-center justify-center rounded-lg bg-primary flex-shrink-0 overflow-hidden select-none shadow-xs",
        className,
      )}
      {...props}
    >
      <svg
        className="h-4 w-4 fill-primary-foreground"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
      </svg>
    </div>
  );
};
