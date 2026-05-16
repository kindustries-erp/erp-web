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
}

export function AppTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  containerClassName,
}: AppTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className={cn("mb-4", listClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>
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
