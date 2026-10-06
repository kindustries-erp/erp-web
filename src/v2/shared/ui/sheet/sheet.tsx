import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[var(--drawer-overlay-bg,rgba(15,23,42,0.04))]",
      "data-[state=open]:animate-fade-in-0 data-[state=closed]:animate-fade-out-0",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

export const sheetVariants = cva(
  cn(
    "fixed z-50 flex flex-col bg-[var(--drawer-bg,rgba(255,255,255,0.85))]",
    "backdrop-blur-[var(--glass-blur,16px)] text-foreground transition ease-in-out duration-300",
    "shadow-[var(--panel-shadow,0_20px_40px_rgba(15,23,42,0.18))]",
  ),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-border/80 data-[state=closed]:animate-fade-out-0 data-[state=open]:animate-fade-in-0",
        bottom:
          "inset-x-0 bottom-0 border-t border-border/80 data-[state=closed]:animate-slide-out-to-bottom data-[state=open]:animate-slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full border-r border-border/80 data-[state=closed]:animate-fade-out-0 data-[state=open]:animate-fade-in-0",
        right:
          "inset-y-0 right-0 h-full border-l border-border/80 data-[state=closed]:animate-slide-out-to-right data-[state=open]:animate-slide-in-from-right",
        floating:
          "top-2.5 right-4 bottom-4 md:right-5 md:bottom-4.5 h-[calc(100dvh-26px)] rounded-2xl border border-border/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.16),0_8px_24px_-4px_rgba(15,23,42,0.08)] data-[state=closed]:animate-slide-out-to-right data-[state=open]:animate-slide-in-from-right",
        fullscreen:
          "inset-0 w-full h-full rounded-none border-0 shadow-none data-[state=closed]:animate-slide-out-to-right data-[state=open]:animate-slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideCloseButton?: boolean;
  hideOverlay?: boolean;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  closeAriaLabel?: string;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      hideCloseButton = false,
      hideOverlay = false,
      overlayClassName,
      overlayStyle,
      closeAriaLabel = "Close",
      ...props
    },
    ref,
  ) => (
    <SheetPortal>
      {!hideOverlay && (
        <SheetOverlay className={overlayClassName} style={overlayStyle} />
      )}
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <SheetPrimitive.Close
            aria-label={closeAriaLabel}
            className="absolute right-4 top-3.5 z-20 rounded-md p-1.5 opacity-70 transition-opacity hover:opacity-100 hover:bg-surface-hover focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-muted-fg hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1 px-4 py-3 border-b border-border/60 shrink-0 text-left",
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center px-4 py-3 border-t border-border/60 bg-surface/50 shrink-0",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-xs text-muted-fg leading-relaxed", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
