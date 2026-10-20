import React from "react";
import { GarageCashflowDashboard } from "../garage-cashflow-dashboard";
import { GarageCashflowList } from "../garage-cashflow-list";
import type { GarageCashflowTabProps } from "./GarageCashflowTab.type";
import { useGarageCashflowTab } from "./GarageCashflowTab.hook";

export const GarageCashflowTab: React.FC<GarageCashflowTabProps> = ({
  initialTab,
  onOpenCaseDetail,
}) => {
  const { currentTabKey, mountedViews, pageTabs, handleTabChange } =
    useGarageCashflowTab(initialTab);

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViews.dashboard && (
        <div
          className={
            currentTabKey === "dashboard"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCashflowDashboard
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
            onOpenCaseDetail={onOpenCaseDetail}
          />
        </div>
      )}

      {mountedViews.vouchers && (
        <div
          className={
            currentTabKey === "vouchers"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCashflowList
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
            onOpenCaseDetail={onOpenCaseDetail}
          />
        </div>
      )}
    </div>
  );
};
