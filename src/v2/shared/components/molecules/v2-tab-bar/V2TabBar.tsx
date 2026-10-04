import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2TabItem } from "../v2-tab-item";
import { TabBarPillItem } from "./TabBarPillItem";
import type { V2TabBarProps } from "./V2TabBar.type";

export const V2TabBar: React.FC<V2TabBarProps> = ({
  tabs,
  activeTabId,
  activeTabKey,
  onTabSelect,
  onTabChange,
  onTabClose,
  variant = "app",
  extra,
  className,
  ariaLabel,
  ...props
}) => {
  const { t } = useV2Translation();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeKey =
    activeTabKey ?? activeTabId ?? tabs?.[0]?.id ?? tabs?.[0]?.key;

  const handleSelect = React.useCallback(
    (key: string) => {
      onTabSelect?.(key);
      onTabChange?.(key);
    },
    [onTabSelect, onTabChange],
  );

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  const renderPillItems = (v: "header" | "button-group" | "sub") =>
    tabs.map((tab) => {
      const tabKey = (tab.key ?? tab.id) || "";
      return (
        <TabBarPillItem
          key={tabKey}
          tab={tab}
          variant={v}
          isActive={activeKey === tabKey}
          onSelect={handleSelect}
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
        {...props}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none flex-1 min-w-0">
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
        {...props}
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

  if (variant === "sub") {
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
        {...props}
      >
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] overflow-x-auto touch-pan-x scrollbar-none h-8">
          {renderPillItems("sub")}
        </div>
        {extra && (
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {extra}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="v2-tab-bar"
      role="tablist"
      aria-label={ariaLabel || t("v2.tabBar.ariaLabel", "Thanh tab đa nhiệm")}
      className={cn(
        "v2-tab-bar flex h-9 min-h-[36px] w-full bg-background/80 backdrop-blur-md px-4 sm:px-6 select-none flex-shrink-0 rounded-b-2xl items-center justify-between",
        className,
      )}
      {...props}
    >
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex items-center flex-1 h-full overflow-x-auto overflow-y-hidden scrollbar-none"
      >
        {tabs.map((tab) => {
          const tabKey = (tab.id ?? tab.key) || "";
          return (
            <V2TabItem
              key={tabKey}
              id={tabKey}
              label={typeof tab.label === "string" ? tab.label : String(tabKey)}
              icon={
                typeof tab.icon === "function" ? (tab.icon as any) : undefined
              }
              isActive={activeKey === tabKey}
              isClosable={tab.isClosable ?? true}
              onClick={() => handleSelect(tabKey)}
              onClose={() => onTabClose?.(tabKey)}
            />
          );
        })}
      </div>
      {extra && (
        <div className="flex items-center gap-2 shrink-0 ml-auto">{extra}</div>
      )}
    </div>
  );
};
V2TabBar.displayName = "V2TabBar";
