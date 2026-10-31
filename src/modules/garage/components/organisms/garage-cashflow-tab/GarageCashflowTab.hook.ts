import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useT } from "@/core/i18n";
import type { TabItem } from "@/shared/components/PageLayout";
import {
  GarageCashflowTabKey,
  type GarageCashflowTabKeyType,
} from "./GarageCashflowTab.type";

export function useGarageCashflowTab(
  propInitialTab?: GarageCashflowTabKey | GarageCashflowTabKeyType,
) {
  const t = useT();

  const getInitialTab = (): GarageCashflowTabKey => {
    if (propInitialTab) {
      return propInitialTab as GarageCashflowTabKey;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === GarageCashflowTabKey.VOUCHERS ||
        tabParam === GarageCashflowTabKey.DASHBOARD ||
        tabParam === GarageCashflowTabKey.FORECAST
      ) {
        return tabParam;
      }
    }
    return GarageCashflowTabKey.DASHBOARD;
  };

  const [currentTabKey, setCurrentTabKey] =
    useState<GarageCashflowTabKey>(getInitialTab);

  const mountedViewsRef = useRef<Record<GarageCashflowTabKey, boolean>>({
    [GarageCashflowTabKey.DASHBOARD]:
      currentTabKey === GarageCashflowTabKey.DASHBOARD,
    [GarageCashflowTabKey.VOUCHERS]:
      currentTabKey === GarageCashflowTabKey.VOUCHERS,
    [GarageCashflowTabKey.FORECAST]:
      currentTabKey === GarageCashflowTabKey.FORECAST,
  });

  if (currentTabKey) {
    mountedViewsRef.current[currentTabKey] = true;
  }

  const pageTabs = useMemo<TabItem[]>(
    () => [
      {
        value: GarageCashflowTabKey.DASHBOARD,
        label: t("garage.cashflow.tabs.dashboard", "Tổng quan"),
      },
      {
        value: GarageCashflowTabKey.VOUCHERS,
        label: t("garage.cashflow.tabs.vouchers", "Phiếu thu chi"),
      },
      {
        value: GarageCashflowTabKey.FORECAST,
        label: t("garage.cashflow.tabs.forecast", "Dự thu chi"),
      },
    ],
    [t],
  );

  const handleTabChange = useCallback((newTab: string) => {
    const validTab: GarageCashflowTabKey =
      newTab === GarageCashflowTabKey.FORECAST
        ? GarageCashflowTabKey.FORECAST
        : newTab === GarageCashflowTabKey.VOUCHERS
          ? GarageCashflowTabKey.VOUCHERS
          : GarageCashflowTabKey.DASHBOARD;
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
