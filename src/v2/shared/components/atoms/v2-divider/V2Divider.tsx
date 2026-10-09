import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2DividerProps } from "./V2Divider.type";

export const V2Divider = React.forwardRef<HTMLSpanElement, V2DividerProps>(
  ({ orientation = "vertical", className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "block bg-border",
        orientation === "vertical" ? "h-4 w-px" : "h-px w-full",
        className,
      )}
      {...props}
    />
  ),
);
V2Divider.displayName = "V2Divider";
