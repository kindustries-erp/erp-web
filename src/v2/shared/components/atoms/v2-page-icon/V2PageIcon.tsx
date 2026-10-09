import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2PageIconProps } from "./V2PageIcon.type";

export const V2PageIcon = React.forwardRef<HTMLSpanElement, V2PageIconProps>(
  ({ children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
V2PageIcon.displayName = "V2PageIcon";
