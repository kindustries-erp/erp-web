import * as React from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/v2/shared/ui/dropdown-menu";
import { cn } from "@/v2/shared/utils/cn";
import type {
  V2DropdownProps,
  V2DropdownItem,
  V2DropdownGroup,
} from "./V2Dropdown.type";

export const V2DropdownDesktop: React.FC<V2DropdownProps> = ({
  trigger,
  children,
  items,
  groups,
  open,
  onOpenChange,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  className,
  triggerClassName,
  modal = false,
}) => {
  const triggerNode = trigger ?? children ?? (
    <button
      type="button"
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-fg hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
      aria-label="Thao tác"
    >
      <MoreHorizontal className="w-4 h-4" />
    </button>
  );

  // Chuẩn hóa danh sách entries
  const normalizedGroups: V2DropdownGroup[] = React.useMemo(() => {
    if (groups && groups.length > 0) {
      return groups.filter((g) => !g.hidden);
    }
    if (items && items.length > 0) {
      const result: V2DropdownGroup[] = [];
      let currentUngrouped: V2DropdownItem[] = [];

      for (const entry of items) {
        if (entry.hidden) continue;
        if ("items" in entry) {
          if (currentUngrouped.length > 0) {
            result.push({ items: currentUngrouped });
            currentUngrouped = [];
          }
          result.push(entry);
        } else {
          currentUngrouped.push(entry);
        }
      }
      if (currentUngrouped.length > 0) {
        result.push({ items: currentUngrouped });
      }
      return result;
    }
    return [];
  }, [groups, items]);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger asChild className={triggerClassName}>
        {triggerNode}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("min-w-[170px]", className)}
      >
        {normalizedGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) => !item.hidden);
          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={groupIdx}>
              {groupIdx > 0 && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                {group.groupLabel && (
                  <DropdownMenuLabel>{group.groupLabel}</DropdownMenuLabel>
                )}
                {visibleItems.map((item, itemIdx) => (
                  <DropdownMenuItem
                    key={item.key || item.label || itemIdx}
                    disabled={item.disabled || item.loading}
                    onClick={() => {
                      if (!item.disabled && !item.loading) {
                        item.onClick?.();
                      }
                    }}
                    className={cn(
                      item.variant === "danger" &&
                        "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 data-[highlighted]:bg-destructive/10",
                    )}
                  >
                    {item.loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-fg shrink-0" />
                    ) : item.icon ? (
                      <span className="shrink-0 text-muted-fg opacity-85">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="truncate flex-1">{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
V2DropdownDesktop.displayName = "V2DropdownDesktop";
