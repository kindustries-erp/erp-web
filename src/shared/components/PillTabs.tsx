import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";
import type { LucideIcon } from "lucide-react";

export type PillTabsVariant =
  | "pill"
  | "segmented"
  | "direction"
  | "underline"
  | "glass"
  | "button-group";
export type PillTabsSize = "xs" | "sm" | "md" | "lg";

export interface PillTabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  badge?: React.ReactNode;
  badgeCount?: number;
  badgeVariant?:
    | "default"
    | "secondary"
    | "outline"
    | "danger"
    | "warning"
    | "emerald"
    | "amber";
  accentColor?: "emerald" | "amber" | "indigo" | "blue" | "rose" | "slate";
  dot?: boolean;
  dotColor?: "emerald" | "amber" | "rose" | "blue";
  disabled?: boolean;
  alwaysShowIcon?: boolean;
}

export interface PillTabsProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  items: PillTabItem<T>[];
  variant?: PillTabsVariant;
  size?: PillTabsSize;
  rightExtra?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  listClassName?: string;
  triggerClassName?: string;
  hideBorder?: boolean;
}

const SIZE_MAP: Record<
  PillTabsSize,
  { list: string; trigger: string; icon: string; badge: string }
> = {
  xs: {
    list: "h-7 p-0.5 gap-0.5",
    trigger: "h-6 px-2 text-[11px]",
    icon: "w-3 h-3 mr-1",
    badge: "text-[9px] min-w-[14px] h-3.5 px-1 font-mono",
  },
  sm: {
    list: "h-8 p-0.5 gap-1",
    trigger: "h-7 px-2.5 text-xs",
    icon: "w-3.5 h-3.5 mr-1.5",
    badge: "text-[10px] min-w-[16px] h-4 px-1.5 font-mono",
  },
  md: {
    list: "h-9 p-0.5 gap-1.5",
    trigger: "h-8 px-3.5 text-xs font-semibold",
    icon: "w-3.5 h-3.5 mr-2",
    badge: "text-[10px] min-w-[18px] h-[18px] px-1.5 font-mono font-medium",
  },
  lg: {
    list: "h-10 p-1 gap-2",
    trigger: "h-8 px-4 text-[13px] font-semibold",
    icon: "w-4 h-4 mr-2",
    badge: "text-xs min-w-[20px] h-5 px-1.5 font-mono font-medium",
  },
};

const VARIANT_CONTAINER: Record<PillTabsVariant, string> = {
  pill: "rounded-full bg-slate-100/80 dark:bg-zinc-800/80 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] border border-slate-200/60 dark:border-zinc-700/60",
  segmented:
    "rounded-lg bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/50 shadow-2xs",
  direction:
    "rounded-lg bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/50 shadow-2xs",
  underline:
    "rounded-none bg-transparent border-b border-slate-200/70 dark:border-zinc-800/80 p-0 gap-5 shadow-none h-auto pb-0",
  glass:
    "rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/50 dark:border-zinc-700/50 shadow-xs",
  "button-group":
    "bg-transparent border-0 p-0 gap-1 shadow-none h-auto [&_[data-tabs-indicator]]:hidden",
};

const DOT_COLOR_MAP = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  blue: "bg-blue-500",
};

export function PillTabs<T extends string = string>({
  value,
  onValueChange,
  items,
  variant = "pill",
  size = "md",
  rightExtra,
  className,
  headerClassName,
  listClassName,
  triggerClassName,
  hideBorder = true,
}: PillTabsProps<T>) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  const getTriggerClass = (tab: PillTabItem<T>, isActive: boolean) => {
    if (variant === "button-group") {
      return cn(
        "rounded-md text-xs transition-colors select-none",
        "data-[state=active]:!bg-slate-900 data-[state=active]:!text-white data-[state=active]:font-semibold data-[state=active]:shadow-xs dark:data-[state=active]:!bg-white dark:data-[state=active]:!text-slate-900",
        "data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-100 dark:data-[state=inactive]:text-slate-400 dark:data-[state=inactive]:hover:text-slate-200 dark:data-[state=inactive]:hover:bg-slate-800 font-medium",
      );
    }
    const isPill = variant === "pill" || variant === "glass";
    const rounded = isPill
      ? "rounded-full"
      : variant === "underline"
        ? "rounded-none"
        : "rounded-md";

    if (variant === "direction") {
      const accent =
        tab.accentColor || (tab.value === "OUT" ? "emerald" : "amber");
      if (isActive) {
        return cn(
          rounded,
          "bg-white dark:bg-zinc-900 font-semibold shadow-xs border",
          accent === "emerald"
            ? "text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
            : "text-amber-900 dark:text-amber-300 border-amber-500/30",
        );
      }
      return cn(
        rounded,
        "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium hover:bg-slate-200/40",
      );
    }

    if (variant === "segmented") {
      return isActive
        ? cn(
            rounded,
            "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-semibold shadow-xs border border-slate-200/50 dark:border-zinc-700/60",
          )
        : cn(
            rounded,
            "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium hover:bg-slate-200/40 dark:hover:bg-zinc-700/40",
          );
    }

    if (variant === "underline") {
      return isActive
        ? "border-b-2 border-primary text-slate-900 dark:text-zinc-100 font-semibold pb-1.5 pt-0.5 -mb-[1px] bg-transparent shadow-none"
        : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium pb-1.5 pt-0.5 border-b-2 border-transparent bg-transparent";
    }

    return cn(
      rounded,
      "data-[state=inactive]:text-slate-600 data-[state=inactive]:font-medium hover:text-slate-900 dark:data-[state=inactive]:text-zinc-400 dark:hover:text-zinc-100 data-[state=active]:text-slate-900 data-[state=active]:font-semibold dark:data-[state=active]:text-white",
    );
  };

  const getBadgeClass = (tab: PillTabItem<T>, isActive: boolean) => {
    if (variant === "direction") {
      const accent =
        tab.accentColor || (tab.value === "OUT" ? "emerald" : "amber");
      if (isActive)
        return accent === "emerald"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-300/40"
          : "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold border border-amber-300/40";
      return "bg-slate-200/70 text-slate-500 dark:bg-zinc-700/60 dark:text-zinc-400 font-medium";
    }
    if (variant === "segmented" || variant === "button-group") {
      return isActive
        ? "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold border border-slate-200/70 dark:border-zinc-700"
        : "bg-slate-200/70 text-slate-500 dark:bg-zinc-700/60 dark:text-zinc-400 font-medium";
    }
    if (tab.badgeVariant === "emerald")
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
    if (tab.badgeVariant === "amber" || tab.badgeVariant === "warning")
      return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
    if (tab.badgeVariant === "danger")
      return "bg-red-500/20 text-red-600 dark:text-red-400";
    return isActive
      ? "bg-slate-900/10 text-slate-900 dark:bg-white/20 dark:text-white font-bold"
      : "bg-slate-200/70 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300 font-medium";
  };

  return (
    <Tabs
      value={value}
      onValueChange={(val) => onValueChange(val as T)}
      className={cn("w-full shrink-0", className)}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3",
          !hideBorder &&
            "border-b border-slate-200/80 dark:border-zinc-800 pb-2.5",
          headerClassName,
        )}
      >
        <TabsList
          className={cn(
            VARIANT_CONTAINER[variant],
            currentSize.list,
            listClassName,
          )}
        >
          {items.map((tab) => {
            const Icon = tab.icon;
            const hasBadgeCount =
              tab.badgeCount !== undefined && tab.badgeCount >= 0;
            const isActive = value === tab.value;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                onClick={() => onValueChange(tab.value)}
                className={cn(
                  "group relative shrink-0 gap-0 transition-all duration-150 ease-out cursor-pointer whitespace-nowrap",
                  currentSize.trigger,
                  getTriggerClass(tab, isActive),
                  triggerClassName,
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors",
                      tab.alwaysShowIcon || variant !== "pill"
                        ? currentSize.icon
                        : "w-0 h-0 opacity-0 mr-0 overflow-hidden group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
                      variant === "button-group"
                        ? "group-data-[state=active]:text-white dark:group-data-[state=active]:text-slate-900 text-slate-500 dark:text-slate-400"
                        : variant === "direction"
                          ? isActive
                            ? tab.accentColor === "amber" || tab.value === "IN"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 dark:text-zinc-500"
                          : "text-slate-400 dark:text-zinc-500",
                      tab.iconClassName,
                    )}
                  />
                )}
                <span className="tracking-tight">{tab.label}</span>
                {tab.dot && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full inline-block ml-1.5",
                      tab.dotColor
                        ? DOT_COLOR_MAP[tab.dotColor]
                        : "bg-emerald-500",
                    )}
                  />
                )}
                {tab.badge && <span className="ml-1.5">{tab.badge}</span>}
                {!tab.badge && hasBadgeCount && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center ml-1.5 rounded-full transition-all leading-none",
                      currentSize.badge,
                      getBadgeClass(tab, isActive),
                    )}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {rightExtra}
      </div>
    </Tabs>
  );
}
