import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Topbar } from "../../molecules/v2-topbar";
import { V2TabBar } from "../v2-tab-bar";
import { V2RightPanelProps } from "./V2RightPanel.type";

export const V2RightPanel: React.FC<V2RightPanelProps> = ({
  breadcrumbs,
  branchName,
  companyName,
  onSearchClick,
  onBranchClick,
  topbarActions,
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  children,
  className,
  ...props
}) => {
  return (
    <div
      data-testid="v2-right-panel"
      className={cn(
        "v2-right-panel relative flex flex-1 min-w-0 flex-col h-full rounded-2xl border border-border bg-background text-foreground shadow-sm overflow-hidden transition-all duration-200",
        className,
      )}
      {...props}
    >
      {/* Topbar inside Right Panel (Absolute Frosted Glass Overlay) */}
      <V2Topbar
        breadcrumbs={breadcrumbs}
        branchName={branchName}
        companyName={companyName}
        onSearchClick={onSearchClick}
        onBranchClick={onBranchClick}
        actions={topbarActions}
        className="absolute top-0 left-0 right-0 z-20"
      />

      {/* Main Content Area: scrolls full height under frosted glass header & footer */}
      <main
        tabIndex={-1}
        className={cn(
          "v2-right-panel-content flex-1 overflow-y-auto overflow-x-hidden pt-9 px-4 sm:px-6 focus:outline-none",
          tabs && tabs.length > 0 && activeTabId ? "pb-9" : "pb-4 sm:pb-6",
        )}
      >
        {children}
      </main>

      {/* TabBar at bottom of Right Panel (Absolute Frosted Glass Overlay) */}
      {tabs && tabs.length > 0 && activeTabId && onTabSelect && (
        <V2TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={onTabSelect}
          onTabClose={onTabClose}
          className="absolute bottom-0 left-0 right-0 z-20"
        />
      )}
    </div>
  );
};
