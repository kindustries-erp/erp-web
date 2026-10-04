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
import type { V2ModalProps } from "./V2Modal.type";

export const V2ModalMobile: React.FC<V2ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
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
          "fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0",
          "w-full max-w-none rounded-b-none rounded-t-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-b-0",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
      >
        {/* Mobile Drag Indicator Bar */}
        <div
          data-testid="v2-modal-grab-handle"
          className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto my-2.5 shrink-0"
          aria-hidden="true"
        />

        {hasHeader ? (
          <DialogHeader
            className={cn(
              "px-4 pt-1 pb-3 border-b border-border/60 shrink-0 text-left",
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
              <DialogDescription className="text-xs text-muted-fg leading-relaxed mt-0.5">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        ) : (
          <DialogTitle className="sr-only">Modal</DialogTitle>
        )}

        <div
          className={cn(
            "px-4 py-3 flex-1 overflow-y-auto min-h-0",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <DialogFooter
            className={cn(
              "px-4 py-3 border-t border-border/60 bg-surface/50 shrink-0 flex-col-reverse gap-2",
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
