import React from "react";
import { PageLayout, type TabItem } from "@/shared/components/PageLayout";

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
  hideTabs?: boolean;
}

/**
 * @deprecated Use `<PageLayout tabs={...}>` directly instead.
 * This component is kept for backward compatibility.
 */
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
  stickyOffset,
  className,
  hideTabs,
}: PageWithTabsLayoutProps) {
  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      actions={actions}
      middleContent={middleContent}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      hideTabs={hideTabs}
      stickyOffset={stickyOffset}
      className={className}
    >
      {children}
    </PageLayout>
  );
}
