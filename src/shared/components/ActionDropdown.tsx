import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "default" | "danger";
  hidden?: boolean;
}

export interface ActionDropdownProps {
  items: ActionItem[];
}

export function ActionDropdown({ items }: ActionDropdownProps) {
  const visibleItems = items.filter((item) => item.hidden !== true);

  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[color:var(--muted-fg)] hover:bg-[color:var(--popup-bg-hover)] hover:text-foreground cursor-pointer outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          align="start"
          className="z-[9999] min-w-[140px] rounded-lg p-1 popup-content"
        >
          {visibleItems.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-[6px] rounded-md text-xs cursor-pointer outline-none select-none",
                "hover:bg-[color:var(--popup-bg-hover)]",
                "data-[highlighted]:bg-[color:var(--popup-bg-hover)]",
                item.variant === "danger" ? "text-red-500" : "text-foreground",
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0 opacity-60">{item.icon}</span>
              )}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
