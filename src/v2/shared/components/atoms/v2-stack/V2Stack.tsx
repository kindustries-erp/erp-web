import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/v2/shared/utils/cn";
import type { V2StackProps } from "./V2Stack.type";

export const v2StackVariants = cva("flex flex-col min-h-0", {
  variants: {
    gap: {
      none: "",
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4",
    },
    fill: {
      true: "h-full w-full",
      false: "",
    },
    grow: {
      true: "flex-1",
      false: "",
    },
  },
  defaultVariants: {
    gap: "none",
    fill: false,
    grow: false,
  },
});

export const V2Stack = React.forwardRef<HTMLElement, V2StackProps>(
  ({ as = "div", gap, fill, grow, className, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(v2StackVariants({ gap, fill, grow }), className)}
        {...props}
      />
    );
  },
);
V2Stack.displayName = "V2Stack";
