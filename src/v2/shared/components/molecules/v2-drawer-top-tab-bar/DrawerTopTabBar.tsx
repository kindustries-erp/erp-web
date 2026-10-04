import React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerTopTabBarProps } from "./DrawerTopTabBar.type";

export const DrawerTopTabBar: React.FC<DrawerTopTabBarProps> = ({
  tabs,
  activeTabKey,
  onTabChange,
  className,
  extra,
}) => {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Drawer Top Navigation Tabs"
      className={cn(
        "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-1.5",
        "border-b border-border/70 bg-[var(--drawer-header-bg,rgba(246,248,252,0.85))] backdrop-blur-md shrink-0 w-full gap-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = activeTabKey === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0",
                isActive
                  ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    "shrink-0",
                    isActive
                      ? "text-white dark:text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <V2Text
                variant="body-sm"
                className={cn(
                  "leading-none",
                  isActive
                    ? "text-white dark:text-primary-foreground font-semibold"
                    : "text-inherit",
                )}
              >
                {tab.label}
              </V2Text>

              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold leading-none shrink-0 transition-colors",
                    isActive
                      ? "bg-white text-slate-900 dark:bg-primary-foreground dark:text-primary"
                      : "bg-muted text-muted-foreground border border-border/50",
                  )}
                >
                  {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {extra && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">{extra}</div>
      )}
    </div>
  );
};
