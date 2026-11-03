import React from "react";
import { GarageCashflowDashboard } from "../garage-cashflow-dashboard";
import { GarageCashflowList } from "../garage-cashflow-list";
import {
  GarageCashflowTabKey,
  type GarageCashflowTabProps,
} from "./GarageCashflowTab.type";
import { useGarageCashflowTab } from "./GarageCashflowTab.hook";

export const GarageCashflowTab: React.FC<GarageCashflowTabProps> = ({
  initialTab,
  onOpenCaseDetail,
}) => {
  const { currentTabKey, mountedViews, pageTabs, handleTabChange } =
    useGarageCashflowTab(initialTab);

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViews[GarageCashflowTabKey.DASHBOARD] && (
        <div
          className={
            currentTabKey === GarageCashflowTabKey.DASHBOARD
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

      {mountedViews[GarageCashflowTabKey.VOUCHERS] && (
        <div
          className={
            currentTabKey === GarageCashflowTabKey.VOUCHERS
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCashflowList
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
            onOpenCaseDetail={onOpenCaseDetail}
            tabKey="vouchers"
          />
        </div>
      )}

      {mountedViews[GarageCashflowTabKey.FORECAST] && (
        <div
          className={
            currentTabKey === GarageCashflowTabKey.FORECAST
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCashflowList
            tabs={pageTabs}
            activeTab={currentTabKey}
            onTabChange={handleTabChange}
            onOpenCaseDetail={onOpenCaseDetail}
            tabKey="forecast"
          />
        </div>
      )}
    </div>
  );
};
