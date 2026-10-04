import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/v2/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-fg border border-primary shadow hover:bg-primary/90",
        primary:
          "bg-primary text-primary-fg border border-primary shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive shadow-sm hover:opacity-90 active:scale-95",
        danger:
          "bg-destructive text-destructive-foreground border border-destructive shadow-sm hover:opacity-90 active:scale-95",
        "destructive-outline":
          "border border-destructive/50 text-destructive bg-transparent hover:bg-destructive/10 active:scale-95",
        "danger-outline":
          "border border-destructive/50 text-destructive bg-transparent hover:bg-destructive/10 active:scale-95",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        spreadsheet:
          "border border-border bg-surface hover:bg-surface-hover text-foreground rounded-sm font-normal",
        "drawer-edit":
          "px-3 py-[5px] rounded-lg text-xs font-medium border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg transition-colors",
        "drawer-tab":
          "group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[30px] sm:min-h-[32px] text-xs rounded-lg font-medium transition-all select-none whitespace-nowrap",
      },
      size: {
        xs: "h-6 px-2 text-[11px] rounded",
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-9 px-4 py-2",
        md: "h-9 px-4 py-2",
        lg: "h-10 px-6 text-sm rounded-md",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 rounded-md",
        "icon-xs": "h-6 w-6 p-0 rounded",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
