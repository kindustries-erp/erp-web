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
}) => {
  return (
    <div
      data-testid="v2-right-panel"
      className={cn(
        "v2-right-panel relative flex flex-1 min-w-0 flex-col h-full rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200",
        className,
      )}
    >
      {/* Topbar inside Right Panel */}
      <V2Topbar
        breadcrumbs={breadcrumbs}
        branchName={branchName}
        companyName={companyName}
        onSearchClick={onSearchClick}
        onBranchClick={onBranchClick}
        actions={topbarActions}
      />

      {/* Main Content Area */}
      <main
        tabIndex={-1}
        className="v2-right-panel-content flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 focus:outline-none"
      >
        {children}
      </main>

      {/* TabBar at bottom of Right Panel */}
      {tabs && tabs.length > 0 && activeTabId && onTabSelect && (
        <V2TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={onTabSelect}
          onTabClose={onTabClose}
        />
      )}
    </div>
  );
};
