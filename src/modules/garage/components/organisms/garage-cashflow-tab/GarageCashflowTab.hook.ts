import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import type { TabItem } from "@/shared/components/PageLayout";
import {
  GarageCashflowTabKey,
  type GarageCashflowTabKeyType,
} from "./GarageCashflowTab.type";

const GARAGE_CASHFLOW_INSTANCE_ID = "garage-cashflow";

function resolveValidCashflowTab(
  tabParam: string | null | undefined,
): GarageCashflowTabKey {
  if (
    tabParam === GarageCashflowTabKey.VOUCHERS ||
    tabParam === GarageCashflowTabKey.FORECAST ||
    tabParam === GarageCashflowTabKey.DASHBOARD
  ) {
    return tabParam;
  }
  return GarageCashflowTabKey.DASHBOARD;
}

export function useGarageCashflowTab(
  propInitialTab?: GarageCashflowTabKey | GarageCashflowTabKeyType,
) {
  const t = useT();

  const getInitialTab = (): GarageCashflowTabKey => {
    if (propInitialTab) {
      return resolveValidCashflowTab(propInitialTab);
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return resolveValidCashflowTab(params.get(ErpUrlQueryParam.TAB));
    }
    return GarageCashflowTabKey.DASHBOARD;
  };

  const [currentTabKey, setCurrentTabKey] =
    useState<GarageCashflowTabKey>(getInitialTab);
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }

    const validTab = resolveValidCashflowTab(newTab);
    setCurrentTabKey(validTab);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set(ErpUrlQueryParam.TAB, validTab);
      const newUrl = `${url.pathname}${url.search}`;
      window.history.replaceState(null, "", newUrl);

      debounceUrlTimerRef.current = setTimeout(() => {
        useAppStore
          .getState()
          .updateCurrentTabUrl?.(GARAGE_CASHFLOW_INSTANCE_ID, newUrl);
      }, 300);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentTabKey(
        resolveValidCashflowTab(params.get(ErpUrlQueryParam.TAB)),
      );
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (!url.searchParams.get(ErpUrlQueryParam.TAB)) {
        url.searchParams.set(ErpUrlQueryParam.TAB, currentTabKey);
        const fullUrl = `${url.pathname}${url.search}`;
        window.history.replaceState(null, "", fullUrl);
        useAppStore
          .getState()
          .updateCurrentTabUrl?.(GARAGE_CASHFLOW_INSTANCE_ID, fullUrl);
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
