import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import type { V2TabItemData } from "./V2TabBar.type";

interface TabBarPillItemProps {
  tab: V2TabItemData;
  isActive: boolean;
  variant: "header" | "sub";
  onSelect: (key: string) => void;
}

export const TabBarPillItem: React.FC<TabBarPillItemProps> = ({
  tab,
  isActive,
  variant,
  onSelect,
}) => {
  const tabKey = (tab.key ?? tab.id) || "";
  const isHeader = variant === "header";

  const renderIcon = () => {
    if (!tab.icon) return null;
    const colorCls = isHeader
      ? isActive
        ? "text-white dark:text-primary-foreground"
        : "text-muted-foreground"
      : isActive
        ? "text-foreground"
        : "text-muted-foreground";

    if (React.isValidElement(tab.icon)) {
      return <span className={cn("shrink-0", colorCls)}>{tab.icon}</span>;
    }
    const IconComp = tab.icon as React.ElementType;
    return <IconComp className={cn("shrink-0 h-3.5 w-3.5", colorCls)} />;
  };

  const getContainerCls = () => {
    if (isHeader) {
      return isActive
        ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-xs font-semibold hover:bg-slate-900/90 dark:hover:bg-primary/90 hover:text-white"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/70";
    }
    return isActive
      ? "bg-surface text-foreground shadow-xs font-semibold border border-border/60 dark:bg-muted dark:text-foreground hover:bg-surface/90"
      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/60";
  };

  const getBadgeCls = () => {
    if (isHeader) {
      return isActive
        ? "bg-white text-slate-900 dark:bg-primary-foreground dark:text-primary"
        : "bg-muted text-muted-foreground border border-border/50";
    }
    return isActive
      ? "bg-foreground text-surface dark:bg-foreground dark:text-background"
      : "bg-muted text-muted-foreground border border-border/50";
  };

  return (
    <V2Button
      type="button"
      role="tab"
      variant="ghost"
      disabled={tab.disabled}
      aria-selected={isActive}
      aria-controls={`${variant}-panel-${tabKey}`}
      id={`${variant}-tab-${tabKey}`}
      onClick={() => !tab.disabled && onSelect(tabKey)}
      className={cn(
        "h-auto px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0 gap-1.5",
        getContainerCls(),
        tab.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
      )}
    >
      {renderIcon()}
      <V2Text
        as="span"
        variant="body-sm"
        className={cn(
          "leading-none",
          isActive
            ? isHeader
              ? "text-white dark:text-primary-foreground font-semibold"
              : "text-foreground font-semibold"
            : "text-inherit",
        )}
      >
        {tab.label}
      </V2Text>
      {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold leading-none shrink-0 transition-colors",
            getBadgeCls(),
          )}
        >
          {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
        </span>
      )}
    </V2Button>
  );
};
