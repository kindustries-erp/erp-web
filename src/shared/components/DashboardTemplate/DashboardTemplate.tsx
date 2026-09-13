import React from "react";
import { PageLayout } from "@/shared/components/PageLayout";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import type {
  FilterPanelConfig,
  FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";
import type { TabItem } from "@/shared/components/PageLayout";

export interface DashboardTemplateProps {
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  filterConfig?: FilterPanelConfig;
  filter?: FilterPanelReturn;
  onRefresh?: () => void;
  loading?: boolean;
  children: React.ReactNode;
  portalId?: string;
  extraActions?: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  hideTabs?: boolean;
}

export function DashboardTemplate({
  title,
  desc,
  icon,
  filterConfig,
  filter,
  onRefresh,
  loading,
  children,
  portalId = "dashboard",
  extraActions,
  tabs,
  activeTab,
  onTabChange,
  hideTabs,
}: DashboardTemplateProps) {
  return (
    <PageLayout
      title={title}
      desc={desc}
      icon={icon}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      hideTabs={hideTabs}
      actions={
        <TableActionGroup
          onRefresh={onRefresh}
          loading={loading}
          onFilterToggle={filter?.togglePanel}
          activeFilterCount={filter?.activeFilterCount || 0}
          portalId={portalId}
          extraActions={extraActions}
        />
      }
    >
      <div className="flex items-stretch flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto pb-4 space-y-4 px-2 -mx-2">
          {children}
        </div>
        {filterConfig && filter && (
          <FilterPanel config={filterConfig} filter={filter} />
        )}
      </div>
    </PageLayout>
  );
}
