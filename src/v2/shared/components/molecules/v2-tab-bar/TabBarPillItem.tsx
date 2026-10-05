import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import type { V2TabItemData } from "./V2TabBar.type";

interface TabBarPillItemProps {
  tab: V2TabItemData;
  isActive: boolean;
  variant: "header" | "sub" | "button-group";
  onSelect: (key: string) => void;
}

const DOT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  primary: "bg-primary",
};

export const TabBarPillItem: React.FC<TabBarPillItemProps> = ({
  tab,
  isActive,
  variant,
  onSelect,
}) => {
  const tabKey = (tab.key ?? tab.id) || "";
  const isHeader = variant === "header";
  const isSub = variant === "sub";
  const isBtnGroup = variant === "button-group";

  const renderIcon = () => {
    if (!tab.icon) return null;

    if (isSub) {
      const showAlways = tab.alwaysShowIcon;
      const colorCls = isActive
        ? "text-slate-900 dark:text-zinc-100"
        : "text-slate-400 dark:text-zinc-500";

      const iconCls = cn(
        "shrink-0 transition-all duration-150 ease-out",
        showAlways
          ? "w-3.5 h-3.5 opacity-100 mr-0.5"
          : isActive
            ? "w-3.5 h-3.5 opacity-100 mr-0.5"
            : "w-0 h-0 opacity-0 overflow-hidden mr-0",
        colorCls,
      );

      if (React.isValidElement(tab.icon)) {
        return <span className={iconCls}>{tab.icon}</span>;
      }
      const IconComp = tab.icon as React.ElementType;
      return <IconComp className={iconCls} />;
    }

    const colorCls = isHeader
      ? isActive
        ? "text-white dark:text-primary-foreground"
        : "text-muted-foreground"
      : isBtnGroup
        ? isActive
          ? "text-white dark:text-slate-900"
          : "text-slate-500 dark:text-zinc-400"
        : isActive
          ? "text-slate-900 dark:text-zinc-100"
          : "text-slate-400 dark:text-zinc-500";

    if (React.isValidElement(tab.icon)) {
      return <span className={cn("shrink-0", colorCls)}>{tab.icon}</span>;
    }
    const IconComp = tab.icon as React.ElementType;
    return <IconComp className={cn("shrink-0 h-3.5 w-3.5", colorCls)} />;
  };

  const getContainerCls = () => {
    if (isHeader) {
      return isActive
        ? "relative z-10 h-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-white dark:text-primary-foreground bg-transparent hover:bg-transparent hover:text-white transition-colors duration-150"
        : "relative z-10 h-auto px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-150";
    }
    if (isBtnGroup) {
      return isActive
        ? "h-7 px-3 rounded-md text-xs font-semibold border bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900"
        : "h-7 px-3 rounded-md text-xs font-medium border bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900";
    }
    // isSub:
    return isActive
      ? "text-slate-900 font-semibold dark:text-white"
      : "text-slate-600 font-medium hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100";
  };

  const getBadgeCls = () => {
    if (isHeader) {
      return isActive
        ? "bg-white text-slate-900 dark:bg-primary-foreground dark:text-primary"
        : "bg-muted text-muted-foreground border border-border/50";
    }
    if (isBtnGroup) {
      return isActive
        ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 font-bold"
        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium border border-slate-200/60";
    }
    // isSub:
    return isActive
      ? "bg-slate-900/10 text-slate-900 dark:bg-white/20 dark:text-white font-bold"
      : "bg-slate-200/70 text-slate-600 dark:bg-zinc-700/60 dark:text-zinc-400 font-medium";
  };

  const buttonVariant = isSub ? "pill-tab" : "ghost";
  const buttonSize = isSub ? "pill-sm" : undefined;

  return (
    <V2Button
      type="button"
      role="tab"
      variant={buttonVariant}
      size={buttonSize}
      disabled={tab.disabled}
      aria-selected={isActive}
      data-active={isActive ? "true" : "false"}
      data-state={isActive ? "active" : "inactive"}
      aria-controls={`${variant}-panel-${tabKey}`}
      id={`${variant}-tab-${tabKey}`}
      onClick={() => !tab.disabled && onSelect(tabKey)}
      className={cn(
        "whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0 flex items-center",
        isSub ? "gap-1" : "gap-1.5",
        getContainerCls(),
        tab.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
      )}
    >
      {renderIcon()}
      <V2Text
        as="span"
        variant={isSub ? "tab-pill" : "body-sm"}
        color="inherit"
        className={cn(
          "leading-none text-inherit",
          isSub ? "tracking-tight text-xs" : "text-xs",
          isActive ? "font-semibold" : "font-medium",
        )}
      >
        {tab.label}
      </V2Text>
      {tab.dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full inline-block ml-0.5",
            DOT_COLORS[tab.dotColor || "emerald"] || "bg-emerald-500",
          )}
        />
      )}
      {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full leading-none shrink-0 font-mono transition-colors",
            isHeader
              ? "min-w-[18px] h-[18px] px-1.5 text-[10px]"
              : isSub
                ? "min-w-[16px] h-4 px-1.5 text-[10px] ml-1"
                : "min-w-[16px] h-4 px-1 text-[10px]",
            getBadgeCls(),
          )}
        >
          {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
        </span>
      )}
    </V2Button>
  );
};
