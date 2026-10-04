import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/v2/shared/utils/cn";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "text-2xl font-bold tracking-tight",
      h2: "text-xl font-semibold tracking-tight",
      h3: "text-lg font-semibold",
      h4: "text-base font-semibold",
      body: "text-sm leading-normal",
      "body-sm": "text-xs leading-normal",
      caption: "text-[11px] leading-tight text-muted-fg",
      label: "text-xs font-medium leading-none select-none",
      helper: "text-[11px] text-muted-fg",
      code: "font-mono text-xs bg-muted px-1 py-0.5 rounded border border-border/50",
      numeric: "font-mono tabular-nums",
      currency: "font-mono tabular-nums font-medium",
      link: "text-primary underline-offset-4 hover:underline cursor-pointer",
      "section-title":
        "text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em]",
      "drawer-title": "text-sm font-semibold text-foreground leading-tight",
      "drawer-subtitle": "text-[11px] text-muted-fg leading-tight truncate",
    },
    color: {
      default: "",
      muted: "text-muted-fg",
      faint: "text-faint",
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      destructive: "text-destructive",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
});

export type TextElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "span"
  | "label"
  | "div"
  | "code"
  | "small"
  | "a";

export interface TextProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: TextElement;
  asChild?: boolean;
}

const defaultElementMap: Record<string, TextElement> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-sm": "p",
  caption: "span",
  label: "label",
  helper: "span",
  code: "code",
  numeric: "span",
  currency: "span",
  link: "span",
  "section-title": "div",
  "drawer-title": "span",
  "drawer-subtitle": "div",
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant = "body",
      color,
      weight,
      as,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Component = asChild
      ? Slot
      : (as ?? (variant ? (defaultElementMap[variant] ?? "span") : "span"));

    return (
      <Component
        className={cn(textVariants({ variant, color, weight, className }))}
        ref={ref as any}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
