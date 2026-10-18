import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2TabItem } from "../v2-tab-item";
import { TabBarPageView } from "./TabBarPageView";
import { TabBarPillView } from "./TabBarPillView";
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
    activeTabKey ?? activeTabId ?? tabs?.[0]?.id ?? tabs?.[0]?.key ?? "";

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

  if (variant === "page") {
    return (
      <TabBarPageView
        tabs={tabs}
        activeKey={activeKey}
        onSelect={handleSelect}
        extra={extra}
        className={className}
        ariaLabel={ariaLabel}
      />
    );
  }

  if (variant === "header" || variant === "button-group" || variant === "sub") {
    return (
      <TabBarPillView
        tabs={tabs}
        variant={variant}
        activeKey={activeKey}
        onSelect={handleSelect}
        extra={extra}
        className={className}
        ariaLabel={ariaLabel}
      />
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
