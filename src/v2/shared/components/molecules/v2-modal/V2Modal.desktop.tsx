import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/v2/shared/ui/dialog";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ModalProps, V2ModalSize } from "./V2Modal.type";

const SIZE_CLASSES: Record<V2ModalSize, string> = {
  sm: "max-w-[380px]",
  md: "max-w-[480px]",
  lg: "max-w-[560px]",
  xl: "max-w-[680px]",
  full: "max-w-[92vw] w-[92vw] max-h-[90vh]",
};

export const V2ModalDesktop: React.FC<V2ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  hideCloseButton = false,
  hideOverlay = false,
  closeAriaLabel,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
}) => {
  const hasHeader = Boolean(title || description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton={hideCloseButton}
        hideOverlay={hideOverlay}
        closeAriaLabel={closeAriaLabel}
        className={cn(
          "max-h-[85vh] flex flex-col p-0 overflow-hidden",
          SIZE_CLASSES[size],
          className,
        )}
      >
        {hasHeader ? (
          <DialogHeader
            className={cn(
              "px-6 pt-5 pb-3.5 border-b border-border/60 shrink-0",
              headerClassName,
            )}
          >
            {title ? (
              <DialogTitle className="text-sm font-semibold text-foreground">
                {title}
              </DialogTitle>
            ) : (
              <DialogTitle className="sr-only">Modal</DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-xs text-muted-fg leading-relaxed mt-1">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        ) : (
          <DialogTitle className="sr-only">Modal</DialogTitle>
        )}

        <div
          className={cn(
            "px-6 py-4 flex-1 overflow-y-auto min-h-0",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <DialogFooter
            className={cn(
              "px-6 py-3 border-t border-border/60 bg-surface/50 shrink-0",
              footerClassName,
            )}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
