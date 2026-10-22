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
        ? "text-white dark:text-teal-300"
        : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-slate-200"
      : isBtnGroup
        ? isActive
          ? "text-primary-fg dark:text-teal-200"
          : "text-slate-500 dark:text-slate-400"
        : isActive
          ? "text-slate-900 dark:text-teal-300"
          : "text-slate-400 dark:text-slate-400";

    if (React.isValidElement(tab.icon)) {
      return <span className={cn("shrink-0", colorCls)}>{tab.icon}</span>;
    }
    const IconComp = tab.icon as React.ElementType;
    return <IconComp className={cn("shrink-0 h-3.5 w-3.5", colorCls)} />;
  };

  const getContainerCls = () => {
    if (isHeader) {
      return isActive
        ? "relative z-10 h-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-white dark:text-teal-300 bg-transparent hover:bg-transparent hover:text-white dark:hover:text-teal-200 transition-colors duration-150"
        : "relative z-10 h-auto px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200 hover:bg-muted/60 dark:hover:bg-white/[0.04] transition-colors duration-150";
    }
    if (isBtnGroup) {
      return isActive
        ? "h-7 px-3 rounded-md text-xs font-semibold border bg-primary text-primary-fg border-primary shadow-xs dark:bg-teal-500/20 dark:border-teal-500/40 dark:text-teal-300 hover:bg-primary/90 hover:text-primary-fg"
        : "h-7 px-3 rounded-md text-xs font-medium border border-transparent bg-transparent text-slate-700 dark:text-slate-400 hover:bg-transparent hover:text-foreground dark:hover:text-slate-200";
    }
    // isSub:
    return isActive
      ? "text-slate-900 font-semibold dark:text-teal-300"
      : "text-slate-600 font-medium hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200";
  };

  const getBadgeCls = () => {
    if (isHeader) {
      return isActive
        ? "bg-white text-slate-900 dark:bg-teal-500/30 dark:text-teal-200"
        : "bg-muted text-muted-foreground border border-border/50 dark:border-white/[0.08]";
    }
    if (isBtnGroup) {
      return isActive
        ? "bg-primary-fg/20 text-primary-fg dark:bg-teal-500/30 dark:text-teal-200 font-bold"
        : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-white/[0.08]";
    }
    // isSub:
    return isActive
      ? "bg-slate-900/10 text-slate-900 dark:bg-teal-500/25 dark:text-teal-200 font-bold"
      : "bg-slate-200/70 text-slate-600 dark:bg-white/[0.06] dark:text-slate-400 font-medium";
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
