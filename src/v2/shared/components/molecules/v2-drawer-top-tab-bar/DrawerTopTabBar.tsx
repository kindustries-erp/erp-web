import React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerTopTabBarProps } from "./DrawerTopTabBar.type";

export const DrawerTopTabBar: React.FC<DrawerTopTabBarProps> = ({
  tabs,
  activeTabKey,
  onTabChange,
  className,
}) => {
  if (!tabs || tabs.length <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Drawer Top Navigation Tabs"
      className={cn(
        "-mx-3 -mt-3 sm:-mx-4 sm:-mt-4 md:-mx-[18px] md:-mt-[18px] mb-3.5",
        "flex items-center gap-1.5 px-3 sm:px-4 md:px-[18px] py-1.5",
        "border-b border-border/70 bg-surface/75 backdrop-blur-md shrink-0",
        "overflow-x-auto touch-pan-x scrollbar-none",
        className,
      )}
    >
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
                ? "bg-primary text-primary-fg shadow-sm font-semibold"
                : "text-muted-fg hover:text-foreground hover:bg-surface-hover",
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  "shrink-0",
                  isActive ? "text-primary-fg" : "text-muted-fg",
                )}
              >
                {tab.icon}
              </span>
            )}
            <V2Text
              variant="body-sm"
              className={cn(
                "leading-none",
                isActive ? "text-primary-fg font-semibold" : "text-inherit",
              )}
            >
              {tab.label}
            </V2Text>

            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center px-1.5 py-0.2 min-w-[18px] h-4 rounded-full text-[10px] font-semibold leading-none shrink-0",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-fg border border-border/50",
                )}
              >
                {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
