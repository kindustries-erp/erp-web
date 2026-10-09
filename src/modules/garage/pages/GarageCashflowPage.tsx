import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/core/config/appStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { GarageCashflowDashboard } from "../components/organisms/garage-cashflow-dashboard/GarageCashflowDashboard";
import { GarageCashflowList } from "../components/organisms/garage-cashflow-list";

export type GarageCashflowTab = "dashboard" | "vouchers";

export const GarageCashflowPage: React.FC = () => {
  const { setCustomBreadcrumbs } = useAppStore();

  const [activeTab, setActiveTab] = useState<GarageCashflowTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB) as GarageCashflowTab;
      if (tabParam === "dashboard" || tabParam === "vouchers") {
        return tabParam;
      }
    }
    return "dashboard";
  });

  const mountedViewsRef = useRef<Record<string, boolean>>({
    dashboard: activeTab === "dashboard",
    vouchers: activeTab === "vouchers",
  });

  if (activeTab) {
    mountedViewsRef.current[activeTab] = true;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB) as GarageCashflowTab;
      if (tabParam === "dashboard" || tabParam === "vouchers") {
        setActiveTab(tabParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = useCallback((nextTabKey: string) => {
    const nextTab = nextTabKey as GarageCashflowTab;
    setActiveTab(nextTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const newParams = new URLSearchParams(url.search);
      newParams.set(ErpUrlQueryParam.TAB, nextTab);
      const queryString = newParams.toString();
      const newUrl = `${url.pathname}${queryString ? `?${queryString}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, []);

  // Breadcrumbs sync
  useEffect(() => {
    setCustomBreadcrumbs([["nav.items.garage"], ["nav.items.garageCashflow"]]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const tabs = [
    { value: "dashboard", label: "Tổng quan" },
    { value: "vouchers", label: "Danh sách Thu/Chi xưởng" },
  ];

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full overflow-hidden">
      {mountedViewsRef.current["dashboard"] && (
        <div
          className={
            activeTab === "dashboard"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCashflowDashboard
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
      {mountedViewsRef.current["vouchers"] && (
        <div
          className={
            activeTab === "vouchers"
              ? "flex flex-col h-full flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          <GarageCashflowList
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
    </div>
  );
};
