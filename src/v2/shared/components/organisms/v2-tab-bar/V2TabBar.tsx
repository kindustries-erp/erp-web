import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2TabItem } from "../../molecules/v2-tab-item";
import { V2TabBarProps } from "./V2TabBar.type";

export const V2TabBar: React.FC<V2TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  className,
  ...props
}) => {
  const { t } = useV2Translation();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Horizontal wheel scroll handler
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      data-testid="v2-tab-bar"
      role="tablist"
      aria-label={t("v2.tabBar.ariaLabel", "Thanh tab đa nhiệm")}
      className={cn(
        "v2-tab-bar flex h-8 min-h-[32px] w-full border-t border-border bg-card/60 select-none flex-shrink-0 backdrop-blur-xs",
        className,
      )}
      {...props}
    >
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex items-center flex-1 overflow-x-auto overflow-y-hidden scrollbar-none"
      >
        {tabs.map((tab) => (
          <V2TabItem
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTabId === tab.id}
            isClosable={tab.isClosable ?? true}
            onClick={() => onTabSelect(tab.id)}
            onClose={() => onTabClose?.(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};
