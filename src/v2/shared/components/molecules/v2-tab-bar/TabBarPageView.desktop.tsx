import * as React from "react";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
  V2Button,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2TabItemData } from "./V2TabBar.type";

export interface TabBarPageViewProps {
  tabs: V2TabItemData[];
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const TabBarPageViewDesktop: React.FC<TabBarPageViewProps> = ({
  tabs,
  activeKey,
  onSelect,
  extra,
  className,
  ariaLabel,
}) => {
  const { t } = useV2Translation();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel || t("v2.tabBar.pageAriaLabel", "Tab trang")}
      className={cn(
        "flex w-full items-center justify-between gap-2 border-b border-border/40 dark:border-white/[0.06]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto overflow-y-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const key = (tab.key ?? tab.id) || "";
          const active = key === activeKey;
          return (
            <V2Button
              key={key}
              type="button"
              role="tab"
              variant="ghost"
              disabled={tab.disabled}
              aria-selected={active}
              data-state={active ? "active" : "inactive"}
              onClick={() => !tab.disabled && onSelect(key)}
              className={cn(
                "h-auto shrink-0 gap-1.5 whitespace-nowrap rounded-none border-b-2 px-1 py-1 sm:py-1.5 text-xs font-medium shadow-none hover:bg-transparent sm:text-sm transition-colors",
                active
                  ? "border-primary text-primary hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
                  : "border-transparent text-muted-fg hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <V2Badge
                  variant={
                    active ? V2BadgeVariant.SECONDARY : V2BadgeVariant.OUTLINE
                  }
                  size={V2BadgeSize.XS}
                  className="rounded-full px-1.5 py-0 font-mono text-[10px] leading-none shrink-0"
                >
                  {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                </V2Badge>
              )}
            </V2Button>
          );
        })}
      </div>
      {extra && <div className="flex shrink-0 items-center gap-2">{extra}</div>}
    </div>
  );
};
