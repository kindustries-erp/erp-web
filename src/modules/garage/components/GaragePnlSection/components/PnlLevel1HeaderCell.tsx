import React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";

export interface PnlLevel1HeaderCellProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  hasSubRows?: boolean;
  extraAction?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function PnlLevel1HeaderCell({
  title,
  icon: Icon,
  iconClassName,
  isCollapsed = false,
  onToggle,
  hasSubRows = true,
  extraAction,
  className,
  titleClassName,
}: PnlLevel1HeaderCellProps) {
  return (
    <td
      className={cn(
        "py-2.5 px-4 flex items-center justify-between select-none",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5",
          hasSubRows && onToggle && "cursor-pointer group",
        )}
        onClick={hasSubRows ? onToggle : undefined}
      >
        {hasSubRows && onToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 -ml-1 mr-0.5 rounded text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isCollapsed && "-rotate-90",
              )}
            />
          </button>
        )}

        <span
          className={cn(
            "text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary",
            titleClassName,
          )}
        >
          {title}
        </span>

        <Icon
          className={cn(
            "w-4 h-4 text-muted-foreground/80 shrink-0 transition-colors group-hover:text-primary",
            iconClassName,
          )}
        />
      </div>

      {extraAction && (
        <div className="shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          {extraAction}
        </div>
      )}
    </td>
  );
}
