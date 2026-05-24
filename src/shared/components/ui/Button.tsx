import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[6px] font-medium cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg border border-primary hover:opacity-90 active:opacity-80",
        secondary:
          "bg-surface text-foreground border border-border hover:bg-surface-hover",
        outline:
          "bg-transparent text-primary border border-primary/60 hover:bg-primary/5",
        ghost:
          "bg-transparent text-[color:var(--muted-fg)] hover:text-foreground hover:bg-[color:var(--muted)] border-none",
        danger:
          "bg-red-500 text-white border border-red-500 hover:bg-red-600 shadow-sm active:scale-95",
        "danger-outline":
          "bg-transparent text-red-600 border border-red-200 hover:bg-red-50",
        link: "bg-transparent text-[color:var(--muted-fg)] hover:text-foreground underline underline-offset-2 border-none p-0",
      },
      size: {
        sm: "px-[14px] py-[7px] text-xs rounded-lg",
        md: "px-4 py-2 text-xs rounded-xl",
        lg: "px-5 py-[10px] text-sm rounded-lg w-full",
        icon: "w-8 h-8 rounded-lg flex-shrink-0",
        "icon-sm": "p-1.5 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
