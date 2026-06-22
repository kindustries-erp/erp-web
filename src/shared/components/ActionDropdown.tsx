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
  disabled?: boolean;
  loading?: boolean;
  preventClose?: boolean;
}

export interface ActionDropdownProps {
  items: ActionItem[];
}

export function ActionDropdown({ items }: ActionDropdownProps) {
  const visibleItems = items.filter((item) => item.hidden !== true);

  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu.Root modal={false}>
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
          align="end"
          className="z-[9999] min-w-[140px] rounded-lg p-1 popup-content"
        >
          {visibleItems.map((item) => (
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
                  item.onClick();
                }
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-[6px] rounded-md text-xs cursor-pointer outline-none select-none",
                !item.disabled &&
                  "hover:bg-[color:var(--popup-bg-hover)] data-[highlighted]:bg-[color:var(--popup-bg-hover)]",
                item.disabled &&
                  "opacity-50 cursor-not-allowed pointer-events-none",
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
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
