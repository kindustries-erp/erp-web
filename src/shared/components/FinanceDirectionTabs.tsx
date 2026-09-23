import React from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/shared/utils";

export interface FinanceDirectionTabsProps {
  value: "IN" | "OUT";
  onChange: (val: "IN" | "OUT") => void;
  outLabel?: string;
  inLabel?: string;
  outCount?: number;
  inCount?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function FinanceDirectionTabs({
  value,
  onChange,
  outLabel = "Phải thu",
  inLabel = "Phải trả",
  outCount,
  inCount,
  size = "sm",
  className,
}: FinanceDirectionTabsProps) {
  const tabs = [
    {
      value: "OUT" as const,
      label: outLabel,
      icon: ArrowUpRight,
      count: outCount,
      colorActive: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badgeClass: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    },
    {
      value: "IN" as const,
      label: inLabel,
      icon: ArrowDownLeft,
      count: inCount,
      colorActive: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
      iconColor: "text-amber-600 dark:text-amber-400",
      badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    },
  ];

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[11px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md font-medium transition-all cursor-pointer select-none whitespace-nowrap",
              sizeClasses[size],
              isActive
                ? cn(tab.colorActive, "font-semibold shadow-xs")
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
            )}
          >
            <Icon
              className={cn(
                iconSizes[size],
                isActive ? "text-inherit" : tab.iconColor,
              )}
            />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-none",
                  isActive
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : tab.badgeClass,
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
