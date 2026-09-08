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
          !hideBorder && "border-b border-[color:var(--border)] pb-2.5",
          headerClassName,
        )}
      >
        <TabsList
          className={cn(
            "h-10 rounded-full bg-[color:var(--muted)] shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] p-1 gap-2 border border-[color:var(--border)]",
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
                  "data-[state=inactive]:text-[color:var(--muted-fg)] data-[state=inactive]:font-medium hover:text-[color:var(--foreground)]",
                  "data-[state=active]:text-[color:var(--foreground)] data-[state=active]:font-semibold whitespace-nowrap",
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
