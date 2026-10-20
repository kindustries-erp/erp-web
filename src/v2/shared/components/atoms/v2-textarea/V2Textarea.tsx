import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2TextareaProps } from "./V2Textarea.type";

export const V2Textarea = React.forwardRef<
  HTMLTextAreaElement,
  V2TextareaProps
>(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      "flex min-h-[72px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground md:text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
V2Textarea.displayName = "V2Textarea";
