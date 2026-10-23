import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Topbar } from "../../molecules/v2-topbar";
import { V2TabBar } from "../../molecules/v2-tab-bar";
import { V2RightPanelProps } from "./V2RightPanel.type";

export const V2RightPanel: React.FC<V2RightPanelProps> = ({
  breadcrumbs,
  branchName,
  companyName,
  logoUrl,
  onSearchClick,
  onBranchClick,
  isDark,
  onThemeToggle,
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
  return (
    <div
      data-testid="v2-right-panel"
      className={cn(
        "v2-right-panel relative flex flex-1 min-w-0 flex-col h-full rounded-2xl border border-border dark:border-[color:var(--main-panel-border,rgba(255,255,255,0.06))] bg-background dark:bg-[color:var(--main-panel-bg,#181a20)] text-foreground shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.05)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-200",
        className,
      )}
      {...props}
    >
      {/* Topbar inside Right Panel (Absolute Frosted Glass Overlay) */}
      <V2Topbar
        breadcrumbs={breadcrumbs}
        branchName={branchName}
        companyName={companyName}
        logoUrl={logoUrl}
        onSearchClick={onSearchClick}
        onBranchClick={onBranchClick}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        actions={topbarActions}
        className="absolute top-0 left-0 right-0 z-20"
      />

      {/* Main Content Area: scrolls full height under frosted glass header & footer */}
      <main
        tabIndex={-1}
        className={cn(
          "v2-right-panel-content flex-1 overflow-y-auto overflow-x-hidden pt-9 focus:outline-none",
          contentClassName,
        )}
      >
        {children}
      </main>

      {/* TabBar inside Right Panel (Absolute Frosted Glass Overlay) */}
      {tabs && tabs.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-transparent dark:border-white/[0.06]">
          <V2TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={onTabSelect}
            onTabClose={onTabClose}
            className="rounded-b-2xl"
          />
        </div>
      )}
    </div>
  );
};

V2RightPanel.displayName = "V2RightPanel";
