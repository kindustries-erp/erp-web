import * as React from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";
import { V2MobileTabMode } from "@/v2/shared/types";
import { V2TabCombobox } from "@/v2/shared/components/molecules/v2-tab-combobox";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import type { V2PageLayoutProps } from "./V2PageLayout.type";

const getItemKey = (item: { value?: string; key?: string; id?: string }) =>
  item.value ?? item.key ?? item.id ?? "";

export const V2PageLayout: React.FC<V2PageLayoutProps> = ({
  title,
  desc,
  icon,
  actions,
  middleContent,
  tabs,
  activeTab,
  onTabChange,
  tabVariant = "underline",
  mobileTabMode = V2MobileTabMode.DROPDOWN,
  hideTabs,
  hideHeader,
  className,
  children,
  ...restProps
}) => {
  const { isMobile } = useViewport();
  const showDropdownTabs =
    isMobile && mobileTabMode === V2MobileTabMode.DROPDOWN;

  return (
    <div
      data-testid="v2-page-layout"
      className={cn(
        "flex flex-col h-full overflow-hidden space-y-2 sm:space-y-4 px-2 sm:px-5 pt-1.5 sm:pt-[18px]",
        hideHeader && "px-2 sm:px-4 pt-2 sm:pt-3 space-y-2 sm:space-y-3",
        className,
      )}
      {...restProps}
    >
      {!hideHeader && (icon || title) ? (
        <PageHeader
          title={title}
          desc={desc}
          icon={icon}
          actions={actions}
          className="mb-0"
        />
      ) : hideHeader && actions ? (
        <div className="flex items-center justify-end">{actions}</div>
      ) : null}

      {middleContent && <div>{middleContent}</div>}

      {tabs &&
        !hideTabs &&
        (tabVariant === "pill" ? (
          <div className="w-full z-10 mb-2 sm:mb-3 flex items-center justify-start">
            <PillTabs
              value={activeTab || (getItemKey(tabs[0]) ?? "")}
              onValueChange={onTabChange || (() => {})}
              items={tabs as unknown as PillTabItem<string>[]}
              size="md"
              hideBorder
              className="w-auto"
            />
          </div>
        ) : (
          <div className="w-full z-10">
            {showDropdownTabs ? (
              <div className="w-full mb-1.5 flex items-center justify-start">
                <V2TabCombobox
                  items={tabs}
                  activeKey={activeTab}
                  onSelect={onTabChange}
                />
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={onTabChange}
                className="w-full bg-transparent"
              >
                <TabsList className="bg-transparent border-b border-border/40 dark:border-white/[0.06] w-full justify-start rounded-none h-auto p-0 gap-3 sm:gap-6 mb-1.5 sm:mb-2 shadow-none overflow-x-auto scrollbar-none [&>[data-tabs-indicator]]:hidden">
                  {tabs.map((tab) => {
                    const key = getItemKey(tab);
                    return (
                      <TabsTrigger
                        key={key}
                        value={key}
                        disabled={tab.disabled}
                        className="border-b-2 border-transparent rounded-none px-1 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary whitespace-nowrap flex-shrink-0 transition-colors"
                      >
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            )}
          </div>
        ))}

      <div className="flex-1 min-h-0 flex flex-col w-full pb-4">{children}</div>
    </div>
  );
};

V2PageLayout.displayName = "V2PageLayout";
