import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";
import type { LucideIcon } from "lucide-react";

export interface PillTabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface PillTabsProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  items: PillTabItem<T>[];
  rightExtra?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  listClassName?: string;
  triggerClassName?: string;
  hideBorder?: boolean;
}

export function PillTabs<T extends string = string>({
  value,
  onValueChange,
  items,
  rightExtra,
  className,
  headerClassName,
  listClassName,
  triggerClassName,
  hideBorder = false,
}: PillTabsProps<T>) {
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
            "border-b border-slate-200/80 dark:border-slate-800 pb-2.5",
          headerClassName,
        )}
      >
        <TabsList
          className={cn(
            "h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] p-1 gap-2 border border-slate-200/60 dark:border-slate-700/60",
            listClassName,
          )}
        >
          {items.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className={cn(
                  "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out cursor-pointer",
                  "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400 dark:hover:text-slate-200",
                  "data-[state=active]:text-slate-900 data-[state=active]:font-semibold dark:data-[state=active]:text-white whitespace-nowrap",
                  triggerClassName,
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                      "w-0 h-0 opacity-0 mr-0",
                      "group-data-[state=active]:w-4 group-data-[state=active]:h-4 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
                      tab.iconClassName,
                    )}
                  />
                )}
                <span className="text-xs tracking-tight">{tab.label}</span>
                {tab.badge && <span className="ml-1.5">{tab.badge}</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {rightExtra}
      </div>
    </Tabs>
  );
}
