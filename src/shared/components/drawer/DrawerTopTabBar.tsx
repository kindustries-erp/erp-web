import React from "react";
import { cn } from "@/shared/utils";

export interface DrawerTopTabItem {
  /** Unique key for the tab */
  key: string;
  /** Display label for the tab */
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Optional badge count displayed in pill */
  badgeCount?: number;
  /** Badge color variant */
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
  /** If true, dynamically hides rightPanel when this tab is active */
  hideRightPanel?: boolean;
  /** Custom right panel node for this tab. If omitted, falls back to drawer-level rightPanel */
  rightPanel?: React.ReactNode;
  /** Content rendered inside this tab */
  content: React.ReactNode;
  /** Extra element rendered on the right side of the tab bar when this tab is active */
  headerExtra?: React.ReactNode;
}

export interface DrawerTopTabBarProps {
  tabs: DrawerTopTabItem[];
  activeTabKey: string;
  onTabChange: (key: string) => void;
  className?: string;
  extra?: React.ReactNode;
}

export function DrawerTopTabBar({
  tabs,
  activeTabKey,
  onTabChange,
  className,
  extra,
}: DrawerTopTabBarProps) {
  if (!tabs || tabs.length === 0) return null;

  const activeTabItem = tabs.find((t) => t.key === activeTabKey) || tabs[0];

  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-[18px] -mt-[18px] px-5 py-2.5 mb-4 border-b border-border/70 flex items-center justify-between gap-3 flex-shrink-0 transition-all backdrop-blur-md",
        className,
      )}
      style={{
        backgroundColor: "var(--drawer-header-bg, rgba(246, 248, 252, 0.90))",
      }}
    >
      {/* ── Tab List ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTabKey;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "group relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg transition-all select-none whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium",
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    "w-3.5 h-3.5 transition-colors flex-shrink-0",
                    isActive
                      ? "text-white dark:text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full transition-all",
                    isActive
                      ? "bg-white text-slate-900 dark:bg-primary-foreground dark:text-primary shadow-xs"
                      : "bg-muted text-muted-foreground group-hover:bg-muted-hover group-hover:text-foreground",
                    tab.badgeVariant === "danger" &&
                      "bg-red-500/20 text-red-600",
                    tab.badgeVariant === "warning" &&
                      "bg-amber-500/20 text-amber-700",
                  )}
                >
                  {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right side extra actions / activeTab headerExtra ── */}
      {(extra || activeTabItem?.headerExtra) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeTabItem?.headerExtra}
          {extra}
        </div>
      )}
    </div>
  );
}
