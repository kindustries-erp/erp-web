import * as React from "react";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2PageTabsContext } from "@/v2/shared/components/molecules/v2-tab-panel";
import { cn } from "@/v2/shared/utils/cn";
import { V2ToolbarSlot } from "./V2SpreadsheetPageTemplate.slots";
import type { V2SpreadsheetPageTemplateProps } from "./V2SpreadsheetPageTemplate.type";

export const V2SpreadsheetPageTemplate: React.FC<
  V2SpreadsheetPageTemplateProps
> = ({
  title,
  description,
  icon,
  actions,
  tabs,
  activeTab,
  onTabChange,
  tabVariant = "header",
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
  const activeKey =
    activeTab ?? (tabs?.[0] ? (tabs[0].key ?? tabs[0].id) || "" : "");
  const ctx = React.useMemo(
    () => ({ activeTab: activeKey, slots: hideHeader ? {} : slots }),
    [activeKey, slots, hideHeader],
  );

  return (
    <V2PageTabsContext.Provider value={ctx}>
      <section
        className={cn("flex h-full min-h-0 w-full flex-col gap-4", className)}
      >
        {!hideHeader && (
          <header className="flex shrink-0 flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-foreground">
                  {title}
                </h1>
                {description && (
                  <p className="truncate text-xs text-muted-fg">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs?.map((tab) => {
                const key = (tab.key ?? tab.id) || "";
                return (
                  <V2ToolbarSlot
                    key={key}
                    tabKey={key}
                    active={key === activeKey}
                    register={register}
                  />
                );
              })}
              {actions}
            </div>
          </header>
        )}
        {tabs && tabs.length > 0 && (
          <V2TabBar
            variant={tabVariant}
            tabs={tabs}
            activeTabKey={activeTab}
            onTabChange={onTabChange}
            className="shrink-0"
          />
        )}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </section>
    </V2PageTabsContext.Provider>
  );
};
