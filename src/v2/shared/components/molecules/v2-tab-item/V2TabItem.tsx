import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2TabItemProps } from "./V2TabItem.type";

export const V2TabItem: React.FC<V2TabItemProps> = ({
  id,
  label,
  icon: Icon,
  isActive = false,
  isClosable = true,
  onClick,
  onClose,
  className,
}) => {
  return (
    <div
      role="tab"
      aria-selected={isActive}
      data-testid={`v2-tab-item-${id}`}
      onClick={onClick}
      className={cn(
        "v2-tab-item group relative flex h-8 min-h-[32px] items-center gap-1.5 px-3 border-r border-border text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap select-none",
        isActive
          ? "bg-card text-foreground font-semibold border-b-2 border-b-primary shadow-xs"
          : "bg-surface/50 text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] hover:bg-surface-hover hover:text-foreground",
        className,
      )}
    >
      {Icon && (
        <Icon
          size={13}
          className={cn(
            "flex-shrink-0 transition-opacity",
            isActive
              ? "opacity-100 text-foreground"
              : "opacity-60 group-hover:opacity-100",
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate max-w-[130px]">{label}</span>

      {isClosable && (
        <button
          type="button"
          aria-label={`Đóng tab ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[color:var(--faint,hsl(var(--muted-foreground)))] hover:bg-accent hover:text-foreground border-none bg-transparent p-0 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
