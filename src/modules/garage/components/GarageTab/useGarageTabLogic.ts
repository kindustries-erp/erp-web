import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import type { TabItem } from "@/shared/components/PageLayout";

export type GarageTabKey = "dashboard" | "cases";

export interface GarageTabProps {
  initialTab?: GarageTabKey;
  instanceIndex?: 1 | 2;
}

export function useGarageTabLogic({
  initialTab: propInitialTab,
  instanceIndex = 1,
}: GarageTabProps = {}) {
  const { t } = useTranslation(["garage", "nav"]);

  const getInitialTab = (): GarageTabKey => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB);
      if (tabParam === "dashboard" || tabParam === "cases") {
        return tabParam;
      }
    }
    if (propInitialTab === "dashboard" || propInitialTab === "cases") {
      return propInitialTab;
    }
    return "dashboard";
  };

  const [currentTabKey, setCurrentTabKey] =
    useState<GarageTabKey>(getInitialTab);
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }

      const targetTab: GarageTabKey =
        newTab === "cases" ? "cases" : "dashboard";
      setCurrentTabKey(targetTab);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const newParams = new URLSearchParams(url.search);
        newParams.set(ErpUrlQueryParam.TAB, targetTab);

        if (instanceIndex === 2) {
          newParams.set(ErpUrlQueryParam.INSTANCE_INDEX, "2");
        }

        const queryString = newParams.toString();
        const newUrl = `${url.pathname}${queryString ? `?${queryString}` : ""}`;
        window.history.replaceState(null, "", newUrl);

        const currentInstanceId =
          instanceIndex === 2 ? "garage-cases__2" : "garage-cases";
        debounceUrlTimerRef.current = setTimeout(() => {
          useAppStore.getState().updateCurrentTabUrl(currentInstanceId, newUrl);
        }, 300);
      }
    },
    [instanceIndex],
  );

  // Popstate sync for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB);
      if (tabParam === "dashboard" || tabParam === "cases") {
        setCurrentTabKey(tabParam);
      } else {
        setCurrentTabKey("dashboard");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Ensure URL has ?tab= param on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let shouldUpdate = false;
      if (!url.searchParams.has(ErpUrlQueryParam.TAB)) {
        url.searchParams.set(ErpUrlQueryParam.TAB, currentTabKey);
        shouldUpdate = true;
      }
      if (
        instanceIndex === 2 &&
        !url.searchParams.has(ErpUrlQueryParam.INSTANCE_INDEX)
      ) {
        url.searchParams.set(ErpUrlQueryParam.INSTANCE_INDEX, "2");
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        const fullUrl = url.toString();
        window.history.replaceState(null, "", fullUrl);
        const currentInstanceId =
          instanceIndex === 2 ? "garage-cases__2" : "garage-cases";
        useAppStore.getState().updateCurrentTabUrl(currentInstanceId, fullUrl);
      }
    }
  }, [currentTabKey, instanceIndex]);

  const pageTabs = useMemo<TabItem[]>(
    () => [
      { value: "dashboard", label: t("tabs.dashboard", "Tổng quan") },
      { value: "cases", label: t("tabs.cases", "Phiếu dịch vụ") },
    ],
    [t],
  );

  return {
    t,
    currentTabKey,
    handleTabChange,
    pageTabs,
  };
}
