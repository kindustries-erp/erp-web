import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";

interface V2RowActionListProps {
  groups: V2RowActionGroup[];
  /** Gọi sau khi một action chạy (thường để đóng menu) */
  onAction?: () => void;
}

export const V2RowActionList: React.FC<V2RowActionListProps> = ({
  groups,
  onAction,
}) => (
  <>
    {groups.map((group, groupIndex) => (
      <React.Fragment key={group.groupLabel ?? groupIndex}>
        {groupIndex > 0 && <div className="-mx-1 my-1 h-px bg-border/60" />}
        {group.groupLabel && (
          <div className="select-none px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-fg">
            {group.groupLabel}
          </div>
        )}
        {group.items.map((item) => (
          <V2Button
            key={item.label}
            variant="ghost"
            role="menuitem"
            disabled={item.disabled}
            className={cn(
              "h-auto w-full justify-start gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium",
              item.variant === "danger" &&
                "text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
            onClick={() => {
              item.onClick();
              onAction?.();
            }}
          >
            {item.icon && (
              <span className="shrink-0 text-muted-fg">{item.icon}</span>
            )}
            <span className="flex-1 truncate text-left">{item.label}</span>
          </V2Button>
        ))}
      </React.Fragment>
    ))}
  </>
);
