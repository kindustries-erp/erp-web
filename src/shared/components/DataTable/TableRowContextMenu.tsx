import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import type {
  ActionDropdownItem,
  ActionGroup,
  ActionItem,
} from "@/shared/components/ActionDropdown";
import { resolveActionIcon } from "./TableRowHoverActions";
import { cn } from "@/shared/utils";

export interface TableRowContextMenuProps {
  x: number;
  y: number;
  items: ActionDropdownItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function TableRowContextMenu({
  x,
  y,
  items,
  isOpen,
  onClose,
  className,
}: TableRowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: x,
    top: y,
  });

  // Calculate adjusted viewport bounds when menu is mounted or coordinates change
  useLayoutEffect(() => {
    if (!isOpen) return;

    const GAP = 8;
    const menuEl = menuRef.current;
    if (!menuEl) return;

    const rect = menuEl.getBoundingClientRect();
    const menuWidth = rect.width || 200;
    const menuHeight = rect.height || 160;

    let computedX = x;
    let computedY = y;

    // Viewport collision check - Horizontal
    if (computedX + menuWidth > window.innerWidth - GAP) {
      computedX = Math.max(GAP, window.innerWidth - menuWidth - GAP);
    }

    // Viewport collision check - Vertical
    if (computedY + menuHeight > window.innerHeight - GAP) {
      computedY = Math.max(GAP, window.innerHeight - menuHeight - GAP);
    }

    setPosition({ left: computedX, top: computedY });
  }, [x, y, isOpen, items]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // If right-clicked outside the current menu, close it
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleScroll = (e: Event) => {
      // If user scrolls anywhere in the page/table, close context menu
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Use a zero-timeout to prevent the triggering event from immediately closing
    const timer = setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
      window.addEventListener("contextmenu", handleContextMenu, {
        capture: true,
      });
      window.addEventListener("scroll", handleScroll, { capture: true });
      window.addEventListener("keydown", handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("contextmenu", handleContextMenu, {
        capture: true,
      });
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !items || items.length === 0) return null;

  // Flatten visible entries
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

  const renderActionItem = (item: ActionItem, keyIndex: number | string) => {
    const isDanger = item.variant === "danger";
    const icon = resolveActionIcon(item);

    return (
      <button
        key={keyIndex}
        type="button"
        disabled={item.disabled || item.loading}
        aria-label={item.label}
        onClick={(e) => {
          e.stopPropagation();
          if (!item.disabled && !item.loading) {
            if (!item.preventClose) {
              onClose();
            }
            setTimeout(() => {
              item.onClick();
            }, 0);
          }
        }}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-normal transition-colors cursor-pointer outline-none select-none text-left",
          !item.disabled &&
            !isDanger &&
            "hover:bg-[color:var(--popup-bg-hover)] text-foreground active:bg-[color:var(--popup-bg-hover)]",
          !item.disabled &&
            isDanger &&
            "text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20",
          item.disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          item.loading && "cursor-wait",
        )}
      >
        {item.loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-muted-foreground" />
        ) : icon ? (
          <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 opacity-70">
            {icon}
          </span>
        ) : null}
        <span className="flex-1 truncate">{item.label}</span>
      </button>
    );
  };

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      data-testid="table-row-context-menu"
      style={{
        left: position.left,
        top: position.top,
        background: "var(--popup-bg, rgba(246, 248, 252, 0.88))",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
      className={cn(
        "table-row-context-menu fixed z-[9999] min-w-[180px] max-w-[320px] rounded-xl p-1 border border-[color:var(--popup-border)] shadow-[0_12px_36px_-4px_rgba(15,23,42,0.22),0_4px_12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset] animate-in fade-in zoom-in-95 duration-100 select-none outline-none popup-content",
        className,
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {visibleEntries.map((entry, index) => {
        return (
          <React.Fragment key={index}>
            {index > 0 && <div className="h-px bg-border/60 my-1" />}
            {entry.type === "group" ? (
              <div className="space-y-0.5" role="group">
                {(entry.data as ActionGroup).groupLabel && (
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
                    {(entry.data as ActionGroup).groupLabel}
                  </div>
                )}
                {entry.visibleItems!.map((action, actionIdx) =>
                  renderActionItem(action, `${index}-${actionIdx}`),
                )}
              </div>
            ) : (
              renderActionItem(entry.data as ActionItem, index)
            )}
          </React.Fragment>
        );
      })}
    </div>,
    document.body,
  );
}
