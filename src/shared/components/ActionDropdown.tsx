import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React, { type ReactNode, useState } from "react";
import { cn } from "@/shared/utils";

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "default" | "danger";
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  preventClose?: boolean;
}

export interface ActionGroup {
  groupLabel?: string;
  items: ActionItem[];
  hidden?: boolean;
}

export type ActionDropdownItem = ActionItem | ActionGroup;

export interface ActionDropdownProps {
  items: ActionDropdownItem[];
  customTrigger?: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function ActionDropdown({ items, customTrigger, align = "start" }: ActionDropdownProps) {
  const [open, setOpen] = useState(false);

  // Normalize items to easily handle separators
  const renderItem = (item: ActionItem) => {
    return (
      <DropdownMenu.Item
        key={item.label}
        onSelect={(e) => {
          if (item.preventClose || item.loading) {
            e.preventDefault();
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!item.disabled && !item.loading) {
            if (!item.preventClose) {
              setOpen(false);
            }
            // Delay execution slightly to allow dropdown to unmount before modal/drawer mounts
            setTimeout(() => {
              item.onClick();
            }, 0);
          }
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-[6px] rounded-md text-xs cursor-pointer outline-none select-none",
          !item.disabled &&
            "hover:bg-[color:var(--popup-bg-hover)] data-[highlighted]:bg-[color:var(--popup-bg-hover)]",
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          item.variant === "danger" ? "text-red-500" : "text-foreground",
        )}
      >
        {item.loading ? (
          <svg
            className="animate-spin w-4 h-4 flex-shrink-0 opacity-60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : item.icon ? (
          <span className="flex-shrink-0 opacity-60">{item.icon}</span>
        ) : null}
        {item.label}
      </DropdownMenu.Item>
    );
  };

  const visibleEntries: {
    type: "item" | "group";
    data: ActionItem | ActionGroup;
    visibleItems?: ActionItem[];
  }[] = [];

  for (const item of items) {
    if (item.hidden) continue;
    if ("items" in item) {
      const groupItems = item.items.filter((i) => !i.hidden);
      if (groupItems.length > 0) {
        visibleEntries.push({
          type: "group",
          data: item,
          visibleItems: groupItems,
        });
      }
    } else {
      visibleEntries.push({ type: "item", data: item });
    }
  }

  if (visibleEntries.length === 0) return null;

  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[color:var(--muted-fg)] hover:bg-[color:var(--popup-bg-hover)] hover:text-foreground cursor-pointer outline-none pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={2}
          align={align}
          className="z-[9999] min-w-[140px] rounded-lg p-1 popup-content"
        >
          {visibleEntries.map((entry, index) => {
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                )}
                {entry.type === "group" ? (
                  <DropdownMenu.Group>
                    {(entry.data as ActionGroup).groupLabel && (
                      <DropdownMenu.Label className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {(entry.data as ActionGroup).groupLabel}
                      </DropdownMenu.Label>
                    )}
                    {entry.visibleItems!.map(renderItem)}
                  </DropdownMenu.Group>
                ) : (
                  renderItem(entry.data as ActionItem)
                )}
              </React.Fragment>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
