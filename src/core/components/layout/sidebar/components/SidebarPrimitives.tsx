import { useRef, useState } from "react";
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

// ── Nav group with expandable children ──
export function NavGroup({
  icon,
  label,
  active,
  expanded: controlledExpanded,
  collapsed,
  children,
}: {
  icon: ReactNode;
  label: string;
  /** Whether any child page is currently active */
  active?: boolean;
  /** Force expanded state (auto-expand when a child is active) */
  expanded?: boolean;
  collapsed?: boolean;
  children: ReactNode;
}) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // If user hasn't toggled, auto-expand when a child is active
  const isExpanded = userExpanded ?? (controlledExpanded || !!active);

  return (
    <div>
      <Tooltip content={label} disabled={!collapsed}>
        <div
          className={cn(
            "flex items-center gap-2 px-[14px] py-[7px] cursor-pointer whitespace-nowrap overflow-hidden min-h-[34px]",
            "text-[color:var(--muted-fg)] hover:bg-surface-hover",
            active && "text-foreground font-medium",
          )}
          onClick={() => setUserExpanded((prev) => !(prev ?? isExpanded))}
        >
          <span className="nav-icon flex-shrink-0">{icon}</span>
          <span className="nav-label hide-on-collapse text-sm overflow-hidden whitespace-nowrap flex-1 transition-all duration-150">
            {label}
          </span>
          <span
            className={cn(
              "nav-arrow-el ml-auto text-[10px] text-[color:var(--faint)] flex-shrink-0 transition-transform duration-200 hide-on-collapse",
              isExpanded && "rotate-90",
            )}
          >
            <IconChevronRight />
          </span>
        </div>
      </Tooltip>
      {!collapsed && (
        <div
          ref={contentRef}
          className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
          style={{
            maxHeight: isExpanded
              ? (contentRef.current?.scrollHeight ?? 300)
              : 0,
          }}
        >
          <div className="ml-[22px] border-l border-[color:var(--border)] py-[2px]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Nav group child item (indented, no icon) ──
export function NavGroupItem({
  label,
  active,
  onClick,
  contextPage,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  contextPage?: PageKey;
}) {
  const onContextMenu = usePageContextMenu(contextPage ?? "dashboard", label);
  return (
    <div
      className={cn(
        "py-[6px] pl-3 pr-4 cursor-pointer text-[13px] whitespace-nowrap overflow-hidden rounded-r-md",
        "text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground",
        active && "!text-foreground font-medium bg-[color:var(--muted)]",
      )}
      onClick={onClick}
      onContextMenu={contextPage ? onContextMenu : undefined}
    >
      {label}
    </div>
  );
}
