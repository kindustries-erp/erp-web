import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useT } from "@/core/i18n";
import type { TabItem } from "@/shared/components/PageLayout";
import type { GarageCashflowTabKey } from "./GarageCashflowTab.type";

export function useGarageCashflowTab(propInitialTab?: GarageCashflowTabKey) {
  const t = useT();

  const getInitialTab = (): GarageCashflowTabKey => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "vouchers" || tabParam === "dashboard") {
        return tabParam;
      }
    }
    return propInitialTab || "dashboard";
  };

  const [currentTabKey, setCurrentTabKey] =
    useState<GarageCashflowTabKey>(getInitialTab);

  const mountedViewsRef = useRef<Record<GarageCashflowTabKey, boolean>>({
    dashboard: currentTabKey === "dashboard",
    vouchers: currentTabKey === "vouchers",
  });

  if (currentTabKey) {
    mountedViewsRef.current[currentTabKey] = true;
  }

  const pageTabs = useMemo<TabItem[]>(
    () => [
      {
        value: "dashboard",
        label: t("garage.cashflow.tabs.dashboard", "Tổng quan"),
      },
      {
        value: "vouchers",
        label: t("garage.cashflow.tabs.vouchers", "Danh sách phiếu thu chi"),
      },
    ],
    [t],
  );

  const handleTabChange = useCallback((newTab: string) => {
    const validTab: GarageCashflowTabKey =
      newTab === "vouchers" ? "vouchers" : "dashboard";
    setCurrentTabKey(validTab);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", validTab);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("tab")) {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", currentTabKey);
        window.history.replaceState(null, "", url.toString());
      }
    }
  }, [currentTabKey]);

  return {
    currentTabKey,
    mountedViews: mountedViewsRef.current,
    pageTabs,
    handleTabChange,
  };
}
