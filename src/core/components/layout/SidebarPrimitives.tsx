import { useRef } from "react";
import type { ReactNode } from "react";
import type { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { usePageContextMenu } from "@/shared/components/ContextMenu";
import { IconChevronRight } from "./sidebarIcons";

// ── Sub-nav row ──
export function SubItem({
  label,
  pageKey,
  tabKey,
  active,
  onClick,
}: {
  label: string;
  pageKey?: PageKey;
  tabKey?: string;
  active: boolean;
  onClick?: () => void;
}) {
  const onContextMenu = usePageContextMenu(
    pageKey ?? "dashboard",
    label,
    tabKey,
  );
  return (
    <div
      className={cn(
        "py-[6px] pl-3 pr-4 cursor-pointer text-sm whitespace-nowrap overflow-hidden",
        "text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground",
        active && "!text-foreground font-medium",
      )}
      onClick={onClick}
      onContextMenu={pageKey ? onContextMenu : undefined}
    >
      {label}
    </div>
  );
}

// ── Collapsible sub-nav ──
export function SubNav({
  id,
  children,
  expanded,
}: {
  id: string;
  children: ReactNode;
  expanded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      id={id}
      className="sub-nav-el overflow-hidden"
      style={{ maxHeight: expanded ? (ref.current?.scrollHeight ?? 300) : 0 }}
    >
      {/* Vertical tree line aligned under parent icon center (px-[14px] + 8px half-icon = 22px) */}
      <div className="ml-[22px] border-l border-[color:var(--border)] py-[3px]">
        {children}
      </div>
    </div>
  );
}

// ── Nav item ──
export function NavItem({
  icon,
  label,
  active,
  onClick,
  hasArrow,
  expanded,
  collapsed,
  contextPage,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hasArrow?: boolean;
  expanded?: boolean;
  collapsed?: boolean;
  contextPage?: PageKey;
}) {
  const onContextMenu = usePageContextMenu(contextPage ?? "dashboard", label);
  return (
    <Tooltip content={label} disabled={!collapsed}>
      <div
        className={cn(
          "flex items-center gap-2 px-[14px] py-[7px] cursor-pointer whitespace-nowrap overflow-hidden min-h-[34px]",
          "text-[color:var(--muted-fg)] hover:bg-surface-hover",
          active && "bg-[color:var(--muted)] text-foreground font-medium",
        )}
        onClick={onClick}
        onContextMenu={contextPage ? onContextMenu : undefined}
      >
        <span className="nav-icon flex-shrink-0">{icon}</span>
        <span className="nav-label hide-on-collapse text-sm overflow-hidden whitespace-nowrap flex-1 transition-all duration-150">
          {label}
        </span>
        {hasArrow && (
          <span
            className={cn(
              "nav-arrow-el ml-auto text-[10px] text-[color:var(--faint)] flex-shrink-0 transition-transform duration-200",
              expanded && "rotate-90",
            )}
          >
            <IconChevronRight />
          </span>
        )}
      </div>
    </Tooltip>
  );
}
