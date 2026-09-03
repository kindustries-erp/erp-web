import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TabSlideTransition } from "@/shared/components/TabSlideTransition";
import { cn } from "@/shared/utils";

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface AppTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  listClassName?: string;
  containerClassName?: string;
  variant?: "default" | "line";
  fadeOnly?: boolean;
}

export function AppTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  containerClassName,
  variant = "default",
  fadeOnly = false,
}: AppTabsProps) {
  const isLine = variant === "line";
  const [internalValue, setInternalValue] = useState(
    defaultValue || tabs[0]?.key || "",
  );
  const activeKey = value !== undefined ? value : internalValue;

  const handleValueChange = (newVal: string) => {
    setInternalValue(newVal);
    onValueChange?.(newVal);
  };

  const activeTabItem = tabs.find((t) => t.key === activeKey) || tabs[0];

  return (
    <Tabs
      defaultValue={defaultValue}
      value={activeKey}
      onValueChange={handleValueChange}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          isLine
            ? "bg-transparent border-b border-[color:var(--border)] w-full justify-start rounded-none h-auto p-0 gap-4 mb-6 shadow-[0_4px_4px_-4px_rgba(0,0,0,0.15)] overflow-x-auto scrollbar-none"
            : "mb-4",
          listClassName,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            onClick={() => handleValueChange(tab.key)}
            className={cn(
              isLine &&
                "border-b-2 border-transparent rounded-none px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground whitespace-nowrap flex-shrink-0",
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={containerClassName}>
        <TabSlideTransition
          activeKey={activeKey}
          tabKeys={tabs.map((t) => t.key)}
          fadeOnly={fadeOnly}
          className="w-full"
        >
          {activeTabItem?.content}
        </TabSlideTransition>
      </div>
    </Tabs>
  );
}
