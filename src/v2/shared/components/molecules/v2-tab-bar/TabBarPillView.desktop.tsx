import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TabBarPillItem } from "./TabBarPillItem";
import { useSlidingTabIndicator } from "./useSlidingTabIndicator";
import type { TabBarPillViewProps, V2TabItemData } from "./V2TabBar.type";

export const TabBarPillViewDesktop: React.FC<TabBarPillViewProps> = ({
  tabs,
  variant,
  activeKey,
  onSelect,
  extra,
  className,
  ariaLabel,
}) => {
  const { t } = useV2Translation();
  const subContainerRef = React.useRef<HTMLDivElement>(null);
  const subIndicatorRef = React.useRef<HTMLDivElement>(null);
  const headerContainerRef = React.useRef<HTMLDivElement>(null);
  const headerIndicatorRef = React.useRef<HTMLDivElement>(null);

  useSlidingTabIndicator({
    containerRef: subContainerRef,
    indicatorRef: subIndicatorRef,
    activeKey,
    enabled: variant === "sub",
    extraDeps: [tabs],
  });

  useSlidingTabIndicator({
    containerRef: headerContainerRef,
    indicatorRef: headerIndicatorRef,
    activeKey,
    enabled: variant === "header",
    extraDeps: [tabs],
  });

  const renderPillItems = (v: "header" | "button-group" | "sub") =>
    tabs.map((tab: V2TabItemData) => {
      const tabKey = (tab.key ?? tab.id) || "";
      return (
        <TabBarPillItem
          key={tabKey}
          tab={tab}
          variant={v}
          isActive={activeKey === tabKey}
          onSelect={onSelect}
        />
      );
    });

  if (variant === "header") {
    return (
      <div
        role="tablist"
        aria-label={
          ariaLabel ||
          t("v2.tabBar.headerAriaLabel", "Drawer Top Navigation Tabs")
        }
        className={cn(
          "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-1.5",
          "border-b border-border/70 bg-[var(--drawer-header-bg,rgba(246,248,252,0.85))] backdrop-blur-md shrink-0 w-full gap-2",
          className,
        )}
      >
        <div
          ref={headerContainerRef}
          className="relative flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none flex-1 min-w-0 py-0.5"
        >
          <div
            ref={headerIndicatorRef}
            role="presentation"
            aria-hidden="true"
            data-tabs-indicator
            className="pointer-events-none absolute rounded-lg bg-slate-900 dark:bg-primary shadow-xs will-change-[left,width] transition-all duration-200 ease-out z-0"
            style={{ width: 0, opacity: 0 }}
          />
          {renderPillItems("header")}
        </div>
        {extra && (
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {extra}
          </div>
        )}
      </div>
    );
  }

  if (variant === "button-group") {
    return (
      <div
        role="tablist"
        aria-label={
          ariaLabel ||
          t("v2.tabBar.buttonGroupAriaLabel", "Nhóm nút chuyển đổi tab")
        }
        className={cn(
          "inline-flex items-center gap-1.5 p-0 bg-transparent border-0 shadow-none h-auto select-none",
          className,
        )}
      >
        {renderPillItems("button-group")}
        {extra && (
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {extra}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={
        ariaLabel || t("v2.tabBar.subAriaLabel", "Drawer Sub Navigation Tabs")
      }
      className={cn(
        "flex flex-wrap items-center justify-between gap-2.5 pb-2 select-none w-full",
        className,
      )}
    >
      <div
        ref={subContainerRef}
        className="relative flex items-center gap-1 p-0.5 rounded-full bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] overflow-x-auto overflow-y-hidden touch-pan-x scrollbar-none h-8 max-w-full"
      >
        <div
          ref={subIndicatorRef}
          role="presentation"
          aria-hidden="true"
          data-tabs-indicator
          className="pointer-events-none absolute rounded-full bg-white dark:bg-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] will-change-[left,width] transition-all duration-180 ease-out z-0"
          style={{ width: 0, opacity: 0 }}
        />
        {renderPillItems("sub")}
      </div>
      {extra && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">{extra}</div>
      )}
    </div>
  );
};

TabBarPillViewDesktop.displayName = "TabBarPillViewDesktop";
