import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";
import type { LucideIcon } from "lucide-react";

export type PillTabsSize = "sm" | "md" | "lg";

export interface PillTabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  badge?: React.ReactNode;
  badgeCount?: number;
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
  disabled?: boolean;
  alwaysShowIcon?: boolean;
}

export interface PillTabsProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  items: PillTabItem<T>[];
  size?: PillTabsSize;
  rightExtra?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  listClassName?: string;
  triggerClassName?: string;
  hideBorder?: boolean;
}

const SIZE_STYLES: Record<
  PillTabsSize,
  {
    list: string;
    trigger: string;
    iconActive: string;
    iconAlways: string;
    badge: string;
  }
> = {
  sm: {
    list: "h-8 p-0.5 gap-1",
    trigger: "h-7 px-3 text-xs rounded-full",
    iconActive:
      "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-1.5",
    iconAlways: "w-3.5 h-3.5 mr-1.5 opacity-100",
    badge: "text-[10px] min-w-[16px] h-4 px-1 rounded-full",
  },
  md: {
    list: "h-9 p-0.5 gap-1.5",
    trigger: "h-8 px-3.5 text-xs font-semibold rounded-full",
    iconActive:
      "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
    iconAlways: "w-3.5 h-3.5 mr-2 opacity-100",
    badge: "text-[10px] min-w-[18px] h-[18px] px-1.5 rounded-full font-medium",
  },
  lg: {
    list: "h-10 p-1 gap-2",
    trigger: "h-8 px-4 text-[13px] font-semibold rounded-full",
    iconActive:
      "group-data-[state=active]:w-4 group-data-[state=active]:h-4 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
    iconAlways: "w-4 h-4 mr-2 opacity-100",
    badge: "text-xs min-w-[20px] h-5 px-1.5 rounded-full font-medium",
  },
};

export function PillTabs<T extends string = string>({
  value,
  onValueChange,
  items,
  size = "md",
  rightExtra,
  className,
  headerClassName,
  listClassName,
  triggerClassName,
  hideBorder = true,
}: PillTabsProps<T>) {
  const currentSize = SIZE_STYLES[size] || SIZE_STYLES.md;

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
            "rounded-full bg-slate-100/80 dark:bg-zinc-800/80 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] border border-slate-200/60 dark:border-zinc-700/60",
            currentSize.list,
            listClassName,
          )}
        >
          {items.map((tab) => {
            const Icon = tab.icon;
            const hasBadgeCount =
              tab.badgeCount !== undefined && tab.badgeCount >= 0;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                onClick={() => onValueChange(tab.value)}
                className={cn(
                  "group relative shrink-0 rounded-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out cursor-pointer whitespace-nowrap",
                  "data-[state=inactive]:text-slate-600 data-[state=inactive]:font-medium hover:text-slate-900 dark:data-[state=inactive]:text-zinc-400 dark:hover:text-zinc-100",
                  "data-[state=active]:text-slate-900 data-[state=active]:font-semibold dark:data-[state=active]:text-white",
                  currentSize.trigger,
                  triggerClassName,
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "shrink-0",
                      tab.alwaysShowIcon
                        ? currentSize.iconAlways
                        : cn(
                            "w-0 h-0 opacity-0 mr-0 overflow-hidden transition-[width,height,opacity,margin] duration-150 ease-out",
                            currentSize.iconActive,
                          ),
                      tab.iconClassName,
                    )}
                  />
                )}
                <span className="tracking-tight">{tab.label}</span>

                {tab.badge && <span className="ml-1.5">{tab.badge}</span>}

                {!tab.badge && hasBadgeCount && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center font-mono ml-1.5 transition-all",
                      currentSize.badge,
                      "group-data-[state=active]:bg-slate-900/10 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:bg-white/20 dark:group-data-[state=active]:text-white",
                      "group-data-[state=inactive]:bg-slate-200/70 group-data-[state=inactive]:text-slate-600 dark:group-data-[state=inactive]:bg-zinc-700 dark:group-data-[state=inactive]:text-zinc-300",
                      tab.badgeVariant === "danger" &&
                        "bg-red-500/20 text-red-600 dark:text-red-400",
                      tab.badgeVariant === "warning" &&
                        "bg-amber-500/20 text-amber-700 dark:text-amber-400",
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
