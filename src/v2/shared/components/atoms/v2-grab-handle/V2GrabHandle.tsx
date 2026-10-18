import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2GrabHandleProps } from "./V2GrabHandle.type";

/** Vạch kéo trang trí ở đầu bottom sheet (mobile), không tương tác */
export const V2GrabHandle = React.forwardRef<HTMLDivElement, V2GrabHandleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "mx-auto my-1.5 h-1 w-10 shrink-0 rounded-full bg-muted-fg/30",
        className,
      )}
      {...props}
    />
  ),
);
V2GrabHandle.displayName = "V2GrabHandle";
