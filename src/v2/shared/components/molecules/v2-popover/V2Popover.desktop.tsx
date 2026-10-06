import * as React from "react";
import { X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
} from "@/v2/shared/ui/popover";
import { cn } from "@/v2/shared/utils/cn";
import { V2PopoverProps } from "./V2Popover.type";

export const V2PopoverDesktop: React.FC<V2PopoverProps> = ({
  trigger,
  children,
  content,
  open,
  onOpenChange,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  glass = true,
  arrow = true,
  title,
  hideCloseButton = false,
  closeAriaLabel = "Đóng popover",
  className,
  triggerClassName,
  modal = false,
}) => {
  const triggerNode = trigger ?? children;

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
      <PopoverTrigger asChild className={triggerClassName}>
        {triggerNode}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative min-w-[240px] max-w-[420px] p-4 text-foreground",
          glass &&
            "bg-[var(--popup-bg,rgba(246,248,252,0.72))] backdrop-blur-[var(--glass-blur,16px)] border border-[color:var(--popup-border,rgba(226,232,240,0.8))] shadow-[var(--popup-shadow)]",
          className,
        )}
      >
        {arrow && <PopoverArrow />}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
            {title ? (
              <div className="text-xs font-semibold text-foreground">
                {title}
              </div>
            ) : (
              <div />
            )}
            {!hideCloseButton && (
              <PopoverClose
                aria-label={closeAriaLabel}
                className="rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-surface-hover text-muted-fg hover:text-foreground cursor-pointer transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </PopoverClose>
            )}
          </div>
        )}
        <div className="text-xs leading-relaxed">{content}</div>
      </PopoverContent>
    </Popover>
  );
};
V2PopoverDesktop.displayName = "V2PopoverDesktop";
