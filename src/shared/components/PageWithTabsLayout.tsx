import React from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";

interface TabItem {
  value: string;
  label: string;
}

interface PageWithTabsLayoutProps {
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  middleContent?: React.ReactNode;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  stickyOffset?: string;
  className?: string;
}

export function PageWithTabsLayout({
  title,
  desc,
  icon,
  actions,
  middleContent,
  tabs,
  activeTab,
  onTabChange,
  children,
  stickyOffset = "-26px",
  className,
}: PageWithTabsLayoutProps) {
  return (
    <div className={cn("page-with-tabs-layout", className)}>
      <PageHeader
        title={title}
        desc={desc}
        icon={icon}
        actions={actions}
        className="mb-4"
      />

      {middleContent && <div className="mb-4">{middleContent}</div>}

      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full sticky z-10 bg-[color:var(--surface)]"
        style={{ top: stickyOffset }}
      >
        <TabsList className="bg-transparent border-b border-[color:var(--border)] w-full justify-start rounded-none h-auto p-0 gap-4 mb-6 shadow-[0_4px_4px_-4px_rgba(0,0,0,0.15)] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="border-b-2 border-transparent rounded-none px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground whitespace-nowrap flex-shrink-0"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="tab-content-container">
        {children}
      </div>
    </div>
  );
}
