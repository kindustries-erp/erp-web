import * as React from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { AppPopover } from "@/v2/shared/components/molecules/v2-popover";
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
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const triggerNode = trigger ?? children ?? (
    <button
      type="button"
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-fg hover:bg-surface-hover hover:text-foreground cursor-pointer transition-colors"
      aria-label="Thao tác"
    >
      <MoreHorizontal className="w-4 h-4" />
    </button>
  );

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

  const handleItemClick = (item: V2DropdownItem) => {
    if (item.disabled || item.loading) return;
    item.onClick?.();
    handleOpenChange(false);
  };

  const dropdownMenuContent = (
    <div className="flex flex-col py-0.5 space-y-0.5">
      {normalizedGroups.map((group, groupIdx) => {
        const visibleItems = group.items.filter((item) => !item.hidden);
        if (visibleItems.length === 0) return null;

        return (
          <React.Fragment key={groupIdx}>
            {groupIdx > 0 && (
              <div className="my-1 -mx-1 h-[1px] bg-border/60" />
            )}
            <div className="flex flex-col">
              {group.groupLabel && (
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted-fg uppercase select-none">
                  {group.groupLabel}
                </div>
              )}
              {visibleItems.map((item, itemIdx) => (
                <button
                  key={item.key || item.label || itemIdx}
                  type="button"
                  disabled={item.disabled || item.loading}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left rounded-md transition-colors select-none",
                    "text-foreground hover:bg-surface-hover active:bg-surface-active cursor-pointer",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                    item.variant === "danger" &&
                      "text-destructive hover:bg-destructive/10 active:bg-destructive/15",
                  )}
                >
                  {item.loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-fg shrink-0" />
                  ) : item.icon ? (
                    <span className="shrink-0 text-muted-fg opacity-85">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="truncate flex-1 font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <AppPopover
      open={isOpen}
      onOpenChange={handleOpenChange}
      align={align}
      side={side}
      sideOffset={sideOffset}
      glass={true}
      arrow={false}
      hideCloseButton={true}
      modal={modal}
      triggerClassName={triggerClassName}
      className={cn(
        "p-1 min-w-[170px] max-w-[280px] shadow-lg border-border/80",
        className,
      )}
      content={dropdownMenuContent}
    >
      {triggerNode}
    </AppPopover>
  );
};
V2DropdownDesktop.displayName = "V2DropdownDesktop";
