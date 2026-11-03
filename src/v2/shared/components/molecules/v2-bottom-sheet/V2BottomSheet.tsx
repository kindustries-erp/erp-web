import * as React from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2BottomSheetProps } from "./V2BottomSheet.type";

export const V2BottomSheet: React.FC<V2BottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  children,
  hideCloseButton = false,
  hideDragHandle = false,
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  maxHeightClass = "max-h-[85vh]",
  closeAriaLabel,
}) => {
  const { t } = useV2Translation();
  const effectiveCloseAriaLabel =
    closeAriaLabel ?? t("v2.common.close", "Đóng");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideCloseButton
        data-testid="v2-bottom-sheet-content"
        className={cn(
          "w-full max-w-none rounded-t-2xl rounded-b-none border-b-0 p-0 flex flex-col overflow-hidden select-none",
          maxHeightClass,
          className,
        )}
      >
        {/* Mobile Pull / Drag Indicator Handle */}
        {!hideDragHandle && (
          <div
            data-testid="v2-bottom-sheet-drag-handle"
            className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2 mb-1 shrink-0"
            aria-hidden="true"
          />
        )}

        {/* Header Bar */}
        {(title || !hideCloseButton || headerAction) && (
          <div
            className={cn(
              "px-4 pt-1 pb-2 flex items-center justify-between border-b border-border/60 shrink-0 gap-2",
              headerClassName,
            )}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
              {icon && (
                <div
                  data-testid="v2-bottom-sheet-icon"
                  className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 flex items-center justify-center"
                >
                  {React.isValidElement(icon)
                    ? icon
                    : React.createElement(
                        icon as React.ComponentType<{ className?: string }>,
                        { className: "h-4 w-4" },
                      )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title ? (
                  typeof title === "string" ? (
                    <SheetTitle asChild>
                      <V2Text
                        as="h2"
                        variant="h4"
                        className="text-foreground truncate"
                      >
                        {title}
                      </V2Text>
                    </SheetTitle>
                  ) : (
                    <SheetTitle asChild>
                      <div className="text-foreground">{title}</div>
                    </SheetTitle>
                  )
                ) : (
                  <SheetTitle className="sr-only">Bottom Sheet</SheetTitle>
                )}

                {subtitle && (
                  <V2Text
                    variant="caption"
                    color="muted"
                    className="mt-0.5 truncate block"
                  >
                    {subtitle}
                  </V2Text>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {headerAction}
              {!hideCloseButton && (
                <V2Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onOpenChange(false)}
                  aria-label={effectiveCloseAriaLabel}
                  data-testid="v2-bottom-sheet-close-btn"
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </V2Button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div
          data-testid="v2-bottom-sheet-body"
          className={cn(
            "px-4 py-3 flex-1 overflow-y-auto min-h-0",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {/* Optional Footer Slot */}
        {footer && (
          <div
            data-testid="v2-bottom-sheet-footer"
            className={cn(
              "px-4 py-3 border-t border-border/60 bg-surface/50 shrink-0",
              footerClassName,
            )}
          >
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

V2BottomSheet.displayName = "V2BottomSheet";
