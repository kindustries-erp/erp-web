import React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerSubTabBarProps } from "./DrawerSubTabBar.type";

export const DrawerSubTabBar: React.FC<DrawerSubTabBarProps> = ({
  tabs,
  activeTabKey,
  onTabChange,
  extra,
  className,
}) => {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Drawer Sub Navigation Tabs"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2.5 pb-2 select-none w-full",
        className,
      )}
    >
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/70 overflow-x-auto touch-pan-x scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTabKey === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              disabled={tab.disabled}
              aria-selected={isActive}
              aria-controls={`subtab-panel-${tab.key}`}
              id={`subtab-${tab.key}`}
              onClick={() => !tab.disabled && onTabChange?.(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0",
                isActive
                  ? "bg-surface text-foreground shadow-xs font-semibold border border-border/60 dark:bg-muted dark:text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/60",
                tab.disabled &&
                  "opacity-50 cursor-not-allowed hover:bg-transparent",
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    "shrink-0",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <V2Text
                variant="body-sm"
                className={cn(
                  "leading-none",
                  isActive ? "text-foreground font-semibold" : "text-inherit",
                )}
              >
                {tab.label}
              </V2Text>

              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold leading-none shrink-0 transition-colors",
                    isActive
                      ? "bg-foreground text-surface dark:bg-foreground dark:text-background"
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
DrawerSubTabBar.displayName = "DrawerSubTabBar";
