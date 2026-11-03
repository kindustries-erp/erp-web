import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import type { TabItem } from "@/shared/components/PageLayout";

export function useGarageDebtsTabs(initialTab = "overview") {
  const { t } = useTranslation(["garage", "debts", "common"]);

  const getValidTab = useCallback((tab: string | null) => {
    if (
      ["receivables", "payables", "overview", "customers"].includes(tab || "")
    ) {
      return tab as string;
    }
    return "overview";
  }, []);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.TAB,
      );
      if (tabParam) return getValidTab(tabParam);
    }
    return getValidTab(initialTab);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const tabParam = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.TAB,
      );
      setActiveTab(getValidTab(tabParam || initialTab));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getValidTab, initialTab]);

  const handleTabChange = useCallback((nextTab: string) => {
    setActiveTab(nextTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const newParams = new URLSearchParams(url.search);
      newParams.set(ErpUrlQueryParam.TAB, nextTab);
      window.history.replaceState(
        null,
        "",
        `${url.pathname}?${newParams.toString()}`,
      );
    }
  }, []);

  const pageTabs: TabItem[] = useMemo(
    () => [
      { value: "overview", label: t("debts:tabs.overview", "Tổng quan") },
      { value: "receivables", label: t("partners.tabReceivables", "Phải thu") },
      { value: "payables", label: t("partners.tabPayables", "Phải trả") },
    ],
    [t],
  );

  return { activeTab, setActiveTab, handleTabChange, pageTabs };
}
