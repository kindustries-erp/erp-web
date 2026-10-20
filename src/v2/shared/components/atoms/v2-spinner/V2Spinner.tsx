import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2SpinnerProps } from "./V2Spinner.type";

const SIZE_CLASS = { sm: "w-4 h-4", md: "w-7 h-7" } as const;

export const V2Spinner = React.forwardRef<SVGSVGElement, V2SpinnerProps>(
  ({ size = "md", className, ...props }, ref) => (
    <Loader2
      ref={ref}
      role="status"
      className={cn("animate-spin text-primary", SIZE_CLASS[size], className)}
      {...props}
    />
  ),
);
V2Spinner.displayName = "V2Spinner";
