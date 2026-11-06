import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Stack } from "@/v2/shared/components/atoms/v2-stack";
import { V2PageHeader } from "@/v2/shared/components/molecules/v2-page-header";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  V2PageTabsContext,
  V2TabPanel,
} from "@/v2/shared/components/molecules/v2-tab-panel";
import { useV2ModulePage } from "./V2ModulePage.hook";
import { V2ModuleListTab } from "./V2ModuleListTab";
import type { V2ModulePageProps, V2ModuleTab } from "./V2ModulePage.type";

function renderTabContent<T>(tab: V2ModuleTab<T>) {
  return tab.kind === "dashboard" ? (
    tab.content
  ) : (
    <V2ModuleListTab<T> key={tab.resetKey} tab={tab} />
  );
}

export function V2ModulePage<T>({
  title,
  description,
  icon,
  actions,
  tabs,
  activeTab,
  defaultTab,
  onTabChange,
  syncUrl,
  tabVariant = "page",
  overlays,
  className,
}: V2ModulePageProps<T>) {
  const page = useV2ModulePage({
    tabs,
    activeTab,
    defaultTab,
    onTabChange,
    syncUrl,
  });

  return (
    <V2PageTabsContext.Provider value={page.context}>
      <V2Stack
        as="section"
        fill
        className={cn(
          "px-2 sm:px-5 pt-1.5 sm:pt-[18px] pb-2 gap-2 sm:gap-4",
          className,
        )}
      >
        <V2PageHeader
          title={title}
          description={description}
          icon={icon}
          actions={actions}
          tabKeys={page.tabKeys}
          activeKey={page.activeKey}
          register={page.register}
        />
        <V2TabBar
          variant={tabVariant}
          tabs={tabs}
          activeTabKey={page.activeKey}
          onTabChange={page.handleTabChange}
          className={cn("shrink-0", tabs.length <= 1 && "hidden")}
        />
        <V2Stack grow>
          {tabs.map((tab) => (
            <V2TabPanel key={tab.key} tabKey={tab.key}>
              {renderTabContent(tab)}
            </V2TabPanel>
          ))}
        </V2Stack>
        {overlays}
      </V2Stack>
    </V2PageTabsContext.Provider>
  );
}
V2ModulePage.displayName = "V2ModulePage";
