import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/shared/utils";

const badgeVariants = cva(
  "inline-flex min-h-[22px] items-center justify-center rounded-md border px-2.5 py-1 text-[11px] font-medium leading-[14px] whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-fg hover:bg-primary/90",
        secondary:
          "border-transparent bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border-[color:var(--border)] bg-[color:var(--surface)] text-foreground",
        ghost: "border-transparent bg-transparent text-[color:var(--muted-fg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
