import * as React from "react";
import { V2Stack } from "@/v2/shared/components/atoms/v2-stack";
import { V2PageHeader } from "@/v2/shared/components/molecules/v2-page-header";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2PageTabsContext } from "@/v2/shared/components/molecules/v2-tab-panel";
import type { V2TabbedSpreadsheetPageProps } from "./V2TabbedSpreadsheetPage.type";

/** Slot toolbar mặc định khi trang không có tab: toolbar vẫn nằm trên header */
const PAGE_SLOT_KEY = "__page__";

export const V2TabbedSpreadsheetPage: React.FC<
  V2TabbedSpreadsheetPageProps
> = ({
  title,
  description,
  icon,
  actions,
  layout = "tabbed",
  tabs,
  activeTab,
  onTabChange,
  tabVariant = "page",
  hideHeader = false,
  children,
  className,
}) => {
  const [slots, setSlots] = React.useState<Record<string, HTMLElement | null>>(
    {},
  );
  const register = React.useCallback(
    (key: string, el: HTMLElement | null) =>
      setSlots((prev) => (prev[key] === el ? prev : { ...prev, [key]: el })),
    [],
  );
  const showTabs = layout === "tabbed" && !!tabs && tabs.length > 0;
  const tabKeys = React.useMemo(
    () =>
      showTabs && tabs
        ? tabs.map((tab) => (tab.key ?? tab.id) || "")
        : [PAGE_SLOT_KEY],
    [showTabs, tabs],
  );
  const activeKey = activeTab ?? tabKeys[0] ?? "";
  const ctx = React.useMemo(
    () => ({ activeTab: activeKey, slots: hideHeader ? {} : slots }),
    [activeKey, slots, hideHeader],
  );

  return (
    <V2PageTabsContext.Provider value={ctx}>
      <V2Stack as="section" fill gap="md" className={className}>
        {!hideHeader && (
          <V2PageHeader
            title={title}
            description={description}
            icon={icon}
            actions={actions}
            tabKeys={tabKeys}
            activeKey={activeKey}
            register={register}
          />
        )}
        {showTabs && tabs && (
          <V2TabBar
            variant={tabVariant}
            tabs={tabs}
            activeTabKey={activeTab}
            onTabChange={onTabChange}
            className="shrink-0"
          />
        )}
        <V2Stack grow>{children}</V2Stack>
      </V2Stack>
    </V2PageTabsContext.Provider>
  );
};
