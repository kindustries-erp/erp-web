import React from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/utils";

export interface TabItem {
  value: string;
  label: string;
}

export interface PageLayoutProps {
  /** Page title shown in the header */
  title: string;
  /** Optional description below the title */
  desc?: string;
  /** Icon displayed in the header badge */
  icon?: React.ReactNode;
  /** Action buttons rendered on the right side of the header */
  actions?: React.ReactNode;
  /** Content rendered between header and tabs (e.g. filter bar) */
  middleContent?: React.ReactNode;
  /** Tab definitions — if provided, renders a sticky tab bar */
  tabs?: TabItem[];
  /** Currently active tab value */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (value: string) => void;
  /** Hide the tab bar (useful for single-tab views) */
  hideTabs?: boolean;
  /** Sticky offset for the tab bar (default: "-26px") */
  stickyOffset?: string;
  /** Hide the entire header (for embedded/nested usage) */
  hideHeader?: boolean;
  /** Additional className on the root wrapper */
  className?: string;
  children: React.ReactNode;
}

/**
 * Standard page layout wrapper for all ERP pages.
 * Provides consistent spacing (space-y-4), optional PageHeader, and optional tabs.
 *
 * Usage:
 * ```tsx
 * <PageLayout title="Tiền mặt" desc="..." icon={<Wallet />} actions={...}>
 *   <VoucherFilterBar ... />
 *   <VoucherTable ... />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  title,
  desc,
  icon,
  actions,
  middleContent,
  tabs,
  activeTab,
  onTabChange,
  hideTabs,

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stickyOffset = "-26px",
  hideHeader,
  className,
  children,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden space-y-4 px-5 pt-[18px]",
        hideHeader && "px-4 pt-3 space-y-3",
        className,
      )}
    >
      {!hideHeader && icon ? (
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

      {tabs && !hideTabs && (
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="w-full z-10 bg-transparent"
        >
          <TabsList className="bg-transparent border-b border-[color:var(--border)]/60 w-full justify-start rounded-none h-auto p-0 gap-6 mb-2 shadow-none overflow-x-auto scrollbar-none [&>[data-tabs-indicator]]:hidden">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="border-b-2 border-transparent rounded-none px-1 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="flex-1 min-h-0 flex flex-col w-full pb-4">{children}</div>
    </div>
  );
}
