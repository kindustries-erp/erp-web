import * as React from "react";
import { TabBarPageView } from "./TabBarPageView";
import { TabBarPagePillView } from "./TabBarPagePillView";
import { TabBarPillView } from "./TabBarPillView";
import { TabBarChipView } from "./TabBarChipView";
import { TabBarAppView } from "./TabBarAppView";
import { V2TabBarVariant, type V2TabBarProps } from "./V2TabBar.type";

export const V2TabBar: React.FC<V2TabBarProps> = ({
  tabs,
  activeTabId,
  activeTabKey,
  onTabSelect,
  onTabChange,
  onTabClose,
  onTabsReorder,
  variant = V2TabBarVariant.APP,
  extra,
  className,
  ariaLabel,
  stretch,
  density,
  metricMode,
  equalWidth,
  indicator,
  ...props
}) => {
  const activeKey =
    activeTabKey ?? activeTabId ?? tabs?.[0]?.id ?? tabs?.[0]?.key ?? "";

  const handleSelect = React.useCallback(
    (key: string) => {
      onTabSelect?.(key);
      onTabChange?.(key);
    },
    [onTabSelect, onTabChange],
  );

  if (variant === V2TabBarVariant.PAGE) {
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

  if (variant === V2TabBarVariant.PILL) {
    return (
      <TabBarPagePillView
        tabs={tabs}
        activeKey={activeKey}
        onSelect={handleSelect}
        extra={extra}
        className={className}
        ariaLabel={ariaLabel}
      />
    );
  }

  if (variant === V2TabBarVariant.STATUS_CHIP) {
    return (
      <TabBarChipView
        tabs={tabs}
        activeKey={activeKey}
        onSelect={handleSelect}
        extra={extra}
        className={className}
        ariaLabel={ariaLabel}
        density={density}
        metricMode={metricMode}
        equalWidth={equalWidth}
        indicator={indicator}
      />
    );
  }

  if (
    variant === V2TabBarVariant.HEADER ||
    variant === V2TabBarVariant.BUTTON_GROUP ||
    variant === V2TabBarVariant.SUB
  ) {
    return (
      <TabBarPillView
        tabs={tabs}
        variant={variant}
        activeKey={activeKey}
        onSelect={handleSelect}
        extra={extra}
        className={className}
        ariaLabel={ariaLabel}
        stretch={stretch}
      />
    );
  }

  return (
    <TabBarAppView
      {...props}
      tabs={tabs}
      activeKey={activeKey}
      onSelect={handleSelect}
      onTabClose={onTabClose}
      onTabsReorder={onTabsReorder}
      extra={extra}
      className={className}
      ariaLabel={ariaLabel}
    />
  );
};
V2TabBar.displayName = "V2TabBar";
