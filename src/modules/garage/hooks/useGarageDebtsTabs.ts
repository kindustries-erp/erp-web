import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import {
  ErpUrlQueryParam,
  GarageDebtsTabKey,
} from "@/shared/constants/urlParams";
import type { TabItem } from "@/shared/components/PageLayout";

export { GarageDebtsTabKey };

const GARAGE_DEBTS_INSTANCE_IDS = new Set([
  "garage-debts",
  "garage-partners",
  "garage-customers",
]);

function getGarageDebtsInstanceId(): string {
  const currentId = useAppStore.getState().currentInstanceId;
  if (currentId && GARAGE_DEBTS_INSTANCE_IDS.has(currentId)) {
    return currentId;
  }
  return "garage-debts";
}

function resolveValidDebtsTab(
  tab: string | null | undefined,
): GarageDebtsTabKey {
  if (
    tab === GarageDebtsTabKey.RECEIVABLES ||
    tab === GarageDebtsTabKey.PAYABLES ||
    tab === GarageDebtsTabKey.OVERVIEW ||
    tab === GarageDebtsTabKey.CUSTOMERS
  ) {
    return tab;
  }
  return GarageDebtsTabKey.OVERVIEW;
}

export function useGarageDebtsTabs(
  initialTab: GarageDebtsTabKey | string = GarageDebtsTabKey.OVERVIEW,
) {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<GarageDebtsTabKey>(() => {
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.TAB,
      );
      if (tabParam) return resolveValidDebtsTab(tabParam);
    }
    return resolveValidDebtsTab(initialTab);
  });

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
      const tabParam = new URLSearchParams(window.location.search).get(
        ErpUrlQueryParam.TAB,
      );
      setActiveTab(resolveValidDebtsTab(tabParam || initialTab));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get(ErpUrlQueryParam.TAB)) {
      url.searchParams.set(ErpUrlQueryParam.TAB, activeTab);
      const fullUrl = `${url.pathname}${url.search}`;
      window.history.replaceState(null, "", fullUrl);
      useAppStore
        .getState()
        .updateCurrentTabUrl?.(getGarageDebtsInstanceId(), fullUrl);
    }
  }, [activeTab]);

  const handleTabChange = useCallback((nextTab: string) => {
    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }

    const validTab = resolveValidDebtsTab(nextTab);
    setActiveTab(validTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set(ErpUrlQueryParam.TAB, validTab);
      const newUrl = `${url.pathname}${url.search}`;
      window.history.replaceState(null, "", newUrl);

      debounceUrlTimerRef.current = setTimeout(() => {
        useAppStore
          .getState()
          .updateCurrentTabUrl?.(getGarageDebtsInstanceId(), newUrl);
      }, 300);
    }
  }, []);

  const pageTabs: TabItem[] = useMemo(
    () => [
      {
        value: GarageDebtsTabKey.OVERVIEW,
        label: t("debts:tabs.overview", "Tổng quan"),
      },
      {
        value: GarageDebtsTabKey.RECEIVABLES,
        label: t("partners.tabReceivables", "Phải thu"),
      },
      {
        value: GarageDebtsTabKey.PAYABLES,
        label: t("partners.tabPayables", "Phải trả"),
      },
    ],
    [t],
  );

  return { activeTab, setActiveTab, handleTabChange, pageTabs };
}
