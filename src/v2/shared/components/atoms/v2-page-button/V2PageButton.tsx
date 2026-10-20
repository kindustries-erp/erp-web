import * as React from "react";
import { Button } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import type { V2PageButtonProps } from "./V2PageButton.type";

export const V2PageButton = React.forwardRef<
  HTMLButtonElement,
  V2PageButtonProps
>(({ active = false, className, children, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="icon-xs"
    aria-current={active ? "page" : undefined}
    className={cn(
      "h-7 w-7 select-none rounded-[6px] border text-xs font-medium",
      active
        ? "border-primary bg-primary text-primary-fg hover:bg-primary"
        : "border-border bg-surface text-foreground hover:bg-surface-hover",
      className,
    )}
    {...props}
  >
    {children}
  </Button>
));
V2PageButton.displayName = "V2PageButton";
