import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ToolbarIconButtonProps } from "./V2ToolbarIconButton.type";

/** Nguồn duy nhất cho nút icon trong cụm toolbar của bảng (32px, viền outline) */
export const V2ToolbarIconButton = React.forwardRef<
  HTMLButtonElement,
  V2ToolbarIconButtonProps
>(({ label, icon, active = false, badge, className, ...props }, ref) => (
  <V2Button
    ref={ref}
    type="button"
    variant="outline"
    size="sm"
    aria-label={label}
    title={label}
    className={cn(
      "relative w-8 shrink-0 px-0",
      active && "border-primary/60 text-primary",
      className,
    )}
    {...props}
  >
    {icon}
    {badge !== undefined && badge > 0 && (
      <span
        data-testid="toolbar-icon-badge"
        className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-fg"
      >
        {badge}
      </span>
    )}
  </V2Button>
));
V2ToolbarIconButton.displayName = "V2ToolbarIconButton";
