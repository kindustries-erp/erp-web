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
      activeClass:
        "bg-emerald-600 text-white font-bold shadow-xs border-emerald-600 hover:bg-emerald-700",
      inactiveClass:
        "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/70",
      iconActiveColor: "text-white",
      iconInactiveColor: "text-emerald-600 dark:text-emerald-400",
      badgeActiveClass: "bg-white/25 text-white font-bold",
      badgeInactiveClass:
        "bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-medium",
    },
    {
      value: "IN" as const,
      label: inLabel,
      icon: ArrowDownLeft,
      count: inCount,
      activeClass:
        "bg-amber-600 text-white font-bold shadow-xs border-amber-600 hover:bg-amber-700",
      inactiveClass:
        "bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-950/70",
      iconActiveColor: "text-white",
      iconInactiveColor: "text-amber-600 dark:text-amber-400",
      badgeActiveClass: "bg-white/25 text-white font-bold",
      badgeInactiveClass:
        "bg-amber-200/70 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-medium",
    },
  ];

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[11px] h-6",
    sm: "px-2.5 py-1 text-xs h-7",
    md: "px-3.5 py-1.5 text-sm h-8",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
              sizeClasses[size],
              isActive ? tab.activeClass : tab.inactiveClass,
            )}
          >
            <Icon
              className={cn(
                iconSizes[size],
                "shrink-0 transition-colors",
                isActive ? tab.iconActiveColor : tab.iconInactiveColor,
              )}
            />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center font-mono text-[10px] px-1.5 py-0.5 min-w-[18px] h-4 rounded-full transition-colors leading-none",
                  isActive ? tab.badgeActiveClass : tab.badgeInactiveClass,
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
