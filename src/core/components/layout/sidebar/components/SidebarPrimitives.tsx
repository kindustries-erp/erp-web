import { useRef } from "react";
import type { ReactNode } from "react";
import type { PageKey } from "@/shared/types";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { usePageContextMenu } from "@/shared/components/ContextMenu";
import { IconChevronRight } from "./sidebarIcons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useIsMobile } from "@/shared/hooks/useIsMobile";

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
        "py-[6px] pl-3 pr-4 cursor-pointer text-[12px] whitespace-nowrap overflow-hidden",
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
        <span className="nav-label hide-on-collapse text-[12px] overflow-hidden whitespace-nowrap flex-1 transition-all duration-150">
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
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Force expanded for all groups
  const isExpanded = true;

  const triggerContent = (
    <div
      className={cn(
        "flex items-center gap-2 px-[14px] py-[7px] whitespace-nowrap overflow-hidden min-h-[34px]",
        "text-[color:var(--muted-fg)]",
        active && "text-foreground font-medium",
        !isMobile &&
          "hover:bg-surface-hover hover:text-foreground cursor-pointer outline-none select-none",
      )}
    >
      <span className="nav-icon flex-shrink-0">{icon}</span>
      <span className="nav-label hide-on-collapse text-sm overflow-hidden whitespace-nowrap flex-1 transition-all duration-150">
        {label}
      </span>
      <span
        className={cn(
          "nav-arrow-el ml-auto text-[10px] text-[color:var(--faint)] flex-shrink-0 transition-transform duration-200 hide-on-collapse",
          isExpanded && isMobile && "rotate-90",
        )}
      >
        <IconChevronRight />
      </span>
    </div>
  );

  if (!isMobile) {
    return (
      <DropdownMenu.Root modal={false}>
        <Tooltip content={label} disabled={!collapsed}>
          <DropdownMenu.Trigger asChild>{triggerContent}</DropdownMenu.Trigger>
        </Tooltip>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="right"
            align="start"
            sideOffset={14}
            className="z-[9999] min-w-[220px] rounded-lg p-1.5 popup-content sidebar-popup-content shadow-lg"
          >
            <DropdownMenu.Label className="px-3 pt-1 pb-2 text-[10px] font-bold text-[color:var(--faint)] uppercase tracking-[0.12em] mb-1 border-b border-black/5 dark:border-white/5">
              {label}
            </DropdownMenu.Label>
            {children}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <div>
      <Tooltip content={label} disabled={!collapsed}>
        {triggerContent}
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
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <DropdownMenu.Item
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer outline-none select-none transition-colors",
          "text-[color:var(--muted-fg)] hover:bg-[color:var(--popup-bg-hover)] data-[highlighted]:bg-[color:var(--popup-bg-hover)] hover:text-foreground data-[highlighted]:text-foreground",
          active &&
            "!text-foreground font-medium bg-[color:var(--muted)] data-[highlighted]:bg-[color:var(--muted)]",
        )}
        onClick={onClick}
        onContextMenu={contextPage ? onContextMenu : undefined}
      >
        <span
          className={cn(
            "w-[4px] h-[4px] rounded-full",
            active
              ? "bg-[color:var(--foreground)]"
              : "bg-[color:var(--faint)] opacity-40",
          )}
        />
        {label}
      </DropdownMenu.Item>
    );
  }

  return (
    <div
      className={cn(
        "py-[6px] pl-3 pr-4 cursor-pointer text-[12px] whitespace-nowrap overflow-hidden rounded-r-md",
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
