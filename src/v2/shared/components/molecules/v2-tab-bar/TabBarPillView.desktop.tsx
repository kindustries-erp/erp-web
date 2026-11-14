import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { GLASS_BAR_CLASS } from "@/v2/shared/ui/floating-surface";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TabBarPillItem } from "./TabBarPillItem";
import { useSlidingTabIndicator } from "./useSlidingTabIndicator";
import {
  V2TabBarVariant,
  type TabBarPillViewProps,
  type V2TabBarPillVariant,
  type V2TabItemData,
} from "./V2TabBar.type";

export const TabBarPillViewDesktop: React.FC<TabBarPillViewProps> = ({
  tabs,
  variant,
  activeKey,
  onSelect,
  extra,
  className,
  ariaLabel,
  stretch,
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
    enabled: variant === V2TabBarVariant.SUB,
    extraDeps: [tabs],
  });

  useSlidingTabIndicator({
    containerRef: headerContainerRef,
    indicatorRef: headerIndicatorRef,
    activeKey,
    enabled: variant === V2TabBarVariant.HEADER,
    extraDeps: [tabs],
  });

  const renderPillItems = (v: V2TabBarPillVariant) =>
    tabs.map((tab: V2TabItemData) => {
      const tabKey = (tab.key ?? tab.id) || "";
      return (
        <TabBarPillItem
          key={tabKey}
          tab={tab}
          variant={v}
          isActive={activeKey === tabKey}
          onSelect={onSelect}
          stretch={stretch}
        />
      );
    });

  if (variant === V2TabBarVariant.HEADER) {
    return (
      <div
        role="tablist"
        aria-label={
          ariaLabel ||
          t("v2.tabBar.headerAriaLabel", "Drawer Top Navigation Tabs")
        }
        className={cn(
          "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-1.5",
          "border-b border-border/70 dark:border-white/[0.06] shrink-0 w-full gap-2",
          GLASS_BAR_CLASS,
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
            className="pointer-events-none absolute rounded-lg bg-slate-900 dark:bg-teal-500/15 dark:border dark:border-teal-500/35 dark:shadow-[0_2px_10px_rgba(20,184,166,0.18)] shadow-xs will-change-[left,width] transition-all duration-200 ease-out z-0"
            style={{ width: 0, opacity: 0 }}
          />
          {renderPillItems(V2TabBarVariant.HEADER)}
        </div>
        {extra && (
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {extra}
          </div>
        )}
      </div>
    );
  }

  if (variant === V2TabBarVariant.BUTTON_GROUP) {
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
        {renderPillItems(V2TabBarVariant.BUTTON_GROUP)}
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
        className={cn(
          "relative flex items-center gap-1 p-[3px] rounded-lg border border-slate-200 dark:border-white/[0.09] shadow-[inset_0_1px_1px_rgba(15,23,42,.04)] dark:shadow-none overflow-x-auto overflow-y-hidden touch-pan-x scrollbar-none h-8 max-w-full",
          GLASS_BAR_CLASS,
          stretch && "w-full",
        )}
      >
        <div
          ref={subIndicatorRef}
          role="presentation"
          aria-hidden="true"
          data-tabs-indicator
          className="pointer-events-none absolute rounded-md bg-white dark:bg-[#2a3445] border border-slate-200/80 dark:border-teal-400/35 shadow-[0_1px_2px_rgba(15,23,42,.06),0_2px_6px_-2px_rgba(15,23,42,.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] will-change-[left,width] transition-all duration-180 ease-out z-0"
          style={{ width: 0, opacity: 0 }}
        />
        {renderPillItems(V2TabBarVariant.SUB)}
      </div>
      {extra && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">{extra}</div>
      )}
    </div>
  );
};

TabBarPillViewDesktop.displayName = "TabBarPillViewDesktop";
