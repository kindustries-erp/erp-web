import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/v2/shared/ui/dialog";
import { cn } from "@/v2/shared/utils/cn";
import { V2PopoverProps } from "./V2Popover.type";

export const V2PopoverMobile: React.FC<V2PopoverProps> = ({
  trigger,
  children,
  content,
  open,
  onOpenChange,
  title,
  hideCloseButton = false,
  closeAriaLabel = "Đóng hộp thoại",
  className,
  triggerClassName,
}) => {
  const triggerNode = trigger ?? children;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild className={triggerClassName}>
        {triggerNode}
      </DialogTrigger>
      <DialogContent
        hideCloseButton={true}
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0",
          "w-full max-w-none rounded-b-none rounded-t-2xl max-h-[85vh]",
          "flex flex-col p-0 overflow-hidden border-b-0",
          "bg-[var(--modal-bg,rgba(246,248,252,0.85))] backdrop-blur-[var(--glass-blur,16px)]",
          "border border-[color:var(--popup-border,rgba(226,232,240,0.8))]",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
      >
        {/* Mobile Grab Handle Indicator */}
        <div
          data-testid="v2-popover-mobile-grab-handle"
          className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto my-2.5 shrink-0"
          aria-hidden="true"
        />

        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between px-4 pb-2.5 pt-0.5 border-b border-border/50 shrink-0">
          <DialogTitle className="text-xs font-semibold text-foreground">
            {title || "Thông tin chi tiết"}
          </DialogTitle>
          {!hideCloseButton && (
            <DialogClose
              aria-label={closeAriaLabel}
              className="rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-surface-hover text-muted-fg hover:text-foreground cursor-pointer transition-opacity"
            >
              <X className="h-4 w-4" />
            </DialogClose>
          )}
        </div>

        {/* Mobile Content Area */}
        <div className="px-4 py-3 flex-1 overflow-y-auto min-h-0 text-xs text-foreground leading-relaxed">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
V2PopoverMobile.displayName = "V2PopoverMobile";
