import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
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
}: AppTabsProps) {
  const isLine = variant === "line";

  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          isLine
            ? "bg-transparent border-b border-[color:var(--border)] w-full justify-start rounded-none h-auto p-0 gap-4 mb-6 shadow-[0_2px_3px_rgba(0,0,0,0.05)]"
            : "mb-4",
          listClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className={cn(
              isLine &&
                "border-b-2 border-transparent rounded-none px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground"
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={containerClassName}>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
