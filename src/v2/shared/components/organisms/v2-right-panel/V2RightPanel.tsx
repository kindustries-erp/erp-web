import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Topbar } from "../../molecules/v2-topbar";
import { V2TabBar } from "../../molecules/v2-tab-bar";
import { V2StatusBar } from "../../molecules/v2-status-bar";
import { V2QuickSearch } from "../../molecules/v2-quick-search";
import { V2ImpersonationBanner } from "../../molecules/v2-impersonation-banner";
import { V2RightPanelProps } from "./V2RightPanel.type";

export const V2RightPanel: React.FC<V2RightPanelProps> = ({
  breadcrumbs,
  branchName,
  companyName,
  logoUrl,
  onSearchClick,
  onBranchClick,
  topbarActions,
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  contentClassName,
  children,
  className,
  ...props
}) => {
  const hasTabs = Boolean(tabs && tabs.length > 0);

  // Quick action slot on the right side of the Top TabBar
  const topBarExtra = React.useMemo(
    () => (
      <div className="flex items-center gap-2 flex-shrink-0">
        <V2ImpersonationBanner />
        {onSearchClick && <V2QuickSearch onClick={onSearchClick} />}
        {topbarActions}
      </div>
    ),
    [onSearchClick, topbarActions],
  );

  return (
    <div
      data-testid="v2-right-panel"
      className={cn(
        "v2-right-panel relative flex flex-1 min-w-0 flex-col h-full rounded-2xl border border-border dark:border-[color:var(--main-panel-border,rgba(255,255,255,0.06))] bg-background dark:bg-[color:var(--main-panel-bg,#181a20)] text-foreground shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.05)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-200",
        className,
      )}
      {...props}
    >
      {/* ── Top Header: If tabs exist, render V2TabBar on TOP; otherwise fallback to V2Topbar ── */}
      {hasTabs ? (
        <V2TabBar
          tabs={tabs!}
          activeTabId={activeTabId}
          onTabSelect={onTabSelect}
          onTabClose={onTabClose}
          extra={topBarExtra}
          className="rounded-t-2xl rounded-b-none border-b border-border dark:border-white/[0.06]"
        />
      ) : (
        <V2Topbar
          breadcrumbs={breadcrumbs}
          branchName={branchName}
          companyName={companyName}
          logoUrl={logoUrl}
          onSearchClick={onSearchClick}
          onBranchClick={onBranchClick}
          actions={topbarActions}
        />
      )}

      {/* ── Main Content Area: in-flow flex-1 with clean scrollbar ── */}
      <main
        tabIndex={-1}
        className={cn(
          "v2-right-panel-content flex-1 overflow-y-auto overflow-x-hidden min-h-0 focus:outline-none",
          contentClassName,
        )}
      >
        {children}
      </main>

      {/* ── Bottom Status Bar: In OrcaQ inspired layout, breadcrumbs & branch info sit at the bottom ── */}
      {hasTabs && (
        <V2StatusBar
          breadcrumbs={breadcrumbs}
          branchName={branchName}
          companyName={companyName}
          logoUrl={logoUrl}
          onBranchClick={onBranchClick}
          showEnvIndicator={false}
        />
      )}
    </div>
  );
};

V2RightPanel.displayName = "V2RightPanel";
