import { useState, useCallback, useEffect } from "react";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import {
  useVinfastPartsStockStore,
  type VehicleStockType,
  type VinfastStockTab,
  type VinfastPartsStockTabState,
} from "./useVinfastPartsStockStore";

export type VinfastPartsStockTab = "dashboard" | "oto" | "xemay";

export function useVinfastPartsStockPageUrl(initialTab?: VinfastPartsStockTab) {
  const [activeTab, setActiveTab] = useState<VinfastPartsStockTab>(() => {
    if (initialTab) return initialTab;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB) as VinfastPartsStockTab;
      if (
        tabParam === "dashboard" ||
        tabParam === "oto" ||
        tabParam === "xemay"
      ) {
        return tabParam;
      }
    }
    return "dashboard";
  });

  // URL Hydration on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get(ErpUrlQueryParam.TAB) as VinfastPartsStockTab;
    const stockTabParam = params.get(ErpUrlQueryParam.STOCK_TAB);
    const pageParam = params.get(ErpUrlQueryParam.PAGE);
    const sizeParam =
      params.get(ErpUrlQueryParam.PAGE_SIZE) ||
      params.get(ErpUrlQueryParam.LIMIT);
    const detailParam = params.get(ErpUrlQueryParam.DETAIL);

    const targetVehicle: VehicleStockType =
      tabParam === "oto" || tabParam === "xemay" ? tabParam : "oto";
    const hydratedUpdates: Partial<VinfastPartsStockTabState> = {};

    if (
      stockTabParam &&
      ["ALL", "IN_STOCK", "OUT_OF_STOCK", "NEGATIVE", "IN", "OUT"].includes(
        stockTabParam,
      )
    ) {
      hydratedUpdates.stockTab = (
        stockTabParam === "IN"
          ? "IN_STOCK"
          : stockTabParam === "OUT"
            ? "OUT_OF_STOCK"
            : stockTabParam
      ) as VinfastStockTab;
    }
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p)) hydratedUpdates.page = Math.max(1, p);
    }
    if (sizeParam) {
      const s = parseInt(sizeParam, 10);
      if (!isNaN(s)) hydratedUpdates.pageSize = s;
    }
    if (detailParam) {
      hydratedUpdates.selectedSku = detailParam;
    }

    if (Object.keys(hydratedUpdates).length > 0) {
      useVinfastPartsStockStore
        .getState()
        .hydrateFromUrl(targetVehicle, hydratedUpdates);
    }
  }, []);

  const handleTabChange = useCallback((nextTab: string) => {
    if (nextTab === "dashboard" || nextTab === "oto" || nextTab === "xemay") {
      setActiveTab(nextTab as VinfastPartsStockTab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const newParams = new URLSearchParams(url.search);
        newParams.set(ErpUrlQueryParam.TAB, nextTab);

        if (nextTab === "oto" || nextTab === "xemay") {
          const targetState =
            useVinfastPartsStockStore.getState().states[nextTab];
          if (targetState.stockTab && targetState.stockTab !== "ALL") {
            newParams.set(ErpUrlQueryParam.STOCK_TAB, targetState.stockTab);
          } else {
            newParams.delete(ErpUrlQueryParam.STOCK_TAB);
          }
          if (targetState.page > 1) {
            newParams.set(ErpUrlQueryParam.PAGE, String(targetState.page));
          } else {
            newParams.delete(ErpUrlQueryParam.PAGE);
          }
          if (targetState.selectedSku) {
            newParams.set(ErpUrlQueryParam.DETAIL, targetState.selectedSku);
          } else {
            newParams.delete(ErpUrlQueryParam.DETAIL);
          }
        } else {
          newParams.delete(ErpUrlQueryParam.STOCK_TAB);
          newParams.delete(ErpUrlQueryParam.DETAIL);
          newParams.delete(ErpUrlQueryParam.PAGE);
          newParams.delete(ErpUrlQueryParam.PAGE_SIZE);
        }

        const queryString = newParams.toString();
        const newUrl = `${url.pathname}${queryString ? `?${queryString}` : ""}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, []);

  // Popstate sync for top-level tab
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB) as VinfastPartsStockTab;
      if (
        tabParam &&
        (tabParam === "dashboard" || tabParam === "oto" || tabParam === "xemay")
      ) {
        setActiveTab(tabParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
  };
}
