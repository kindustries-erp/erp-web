import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2TabItemData } from "./V2TabBar.type";

interface TabBarPageViewProps {
  tabs: V2TabItemData[];
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const TabBarPageView: React.FC<TabBarPageViewProps> = ({
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
        "flex w-full items-center justify-between gap-2 border-b border-border/60",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto scrollbar-none">
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
                "-mb-px h-auto shrink-0 gap-1.5 whitespace-nowrap rounded-none border-b-2 px-1 py-1.5 text-xs font-medium shadow-none hover:bg-transparent sm:text-sm",
                active
                  ? "border-primary text-primary hover:text-primary"
                  : "border-transparent text-muted-fg hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-muted px-1 font-mono text-[10px] leading-none text-muted-fg">
                  {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                </span>
              )}
            </V2Button>
          );
        })}
      </div>
      {extra && <div className="flex shrink-0 items-center gap-2">{extra}</div>}
    </div>
  );
};
