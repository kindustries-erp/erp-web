import { useEffect, useRef } from "react";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam } from "@/shared/utils/pageUrl";
import type {
  VehicleStockType,
  VinfastStockTab,
  VinfastPartsStockTabState,
} from "@/pages/hooks/useVinfastPartsStockStore";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";

interface UseVinfastStockUrlSyncParams {
  vehicleType: VehicleStockType;
  activeTab: string;
  tabState: VinfastPartsStockTabState;
  tableState: ReturnType<typeof useTableColumnState>;
  setSelectedSku: (vehicleType: VehicleStockType, sku: string | null) => void;
  setStockTab: (vehicleType: VehicleStockType, tab: VinfastStockTab) => void;
  setPage: (vehicleType: VehicleStockType, page: number) => void;
  setPageSize: (vehicleType: VehicleStockType, size: number) => void;
}

export function useVinfastPartsStockTableUrlSync({
  vehicleType,
  activeTab,
  tabState,
  tableState,
  setSelectedSku,
  setStockTab,
  setPage,
  setPageSize,
}: UseVinfastStockUrlSyncParams) {
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined" || activeTab !== vehicleType) return;
    if (debounceUrlTimerRef.current) clearTimeout(debounceUrlTimerRef.current);

    debounceUrlTimerRef.current = setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      const newParams = new URLSearchParams(currentUrl.search);
      newParams.set(ErpUrlQueryParam.TAB, vehicleType);

      if (tabState.stockTab && tabState.stockTab !== "ALL") {
        newParams.set(ErpUrlQueryParam.STOCK_TAB, tabState.stockTab);
      } else {
        newParams.delete(ErpUrlQueryParam.STOCK_TAB);
      }

      if (tabState.selectedSku) {
        newParams.set(ErpUrlQueryParam.DETAIL, tabState.selectedSku);
      } else {
        newParams.delete(ErpUrlQueryParam.DETAIL);
      }

      if (tabState.page > 1) {
        newParams.set(ErpUrlQueryParam.PAGE, String(tabState.page));
      } else {
        newParams.delete(ErpUrlQueryParam.PAGE);
      }
      if (tabState.pageSize) {
        newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(tabState.pageSize));
      }

      if (Object.keys(tableState.columnFilters).length > 0) {
        const encoded = encodeStateParam(tableState.columnFilters);
        if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
      } else {
        newParams.delete(ErpUrlQueryParam.COLUMN_FILTERS);
      }

      if (Object.keys(tableState.columnSearch).length > 0) {
        const encoded = encodeStateParam(tableState.columnSearch);
        if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
      } else {
        newParams.delete(ErpUrlQueryParam.COLUMN_SEARCH);
      }

      if (tableState.sorts.length > 0) {
        const encoded = encodeStateParam(tableState.sorts);
        if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
      } else {
        newParams.delete(ErpUrlQueryParam.SORTS);
      }

      const newSearch = newParams.toString();
      const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
      if (window.location.pathname + window.location.search !== newPath) {
        window.history.replaceState(null, "", newPath);
      }
    }, DEFAULT_DEBOUNCE_TIME);

    return () => {
      if (debounceUrlTimerRef.current)
        clearTimeout(debounceUrlTimerRef.current);
    };
  }, [
    activeTab,
    vehicleType,
    tabState.stockTab,
    tabState.selectedSku,
    tabState.page,
    tabState.pageSize,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
  ]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const detailParam = params.get(ErpUrlQueryParam.DETAIL);
      setSelectedSku(vehicleType, detailParam || null);

      const stockParam = params.get(ErpUrlQueryParam.STOCK_TAB);
      if (
        stockParam &&
        ["ALL", "IN_STOCK", "OUT_OF_STOCK", "NEGATIVE", "IN", "OUT"].includes(
          stockParam,
        )
      ) {
        const normalized = (
          stockParam === "IN"
            ? "IN_STOCK"
            : stockParam === "OUT"
              ? "OUT_OF_STOCK"
              : stockParam
        ) as VinfastStockTab;
        setStockTab(vehicleType, normalized);
      }

      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      const p = pageParam ? parseInt(pageParam, 10) : 1;
      setPage(vehicleType, !isNaN(p) && p > 0 ? p : 1);

      const pageSizeParam = params.get(ErpUrlQueryParam.PAGE_SIZE);
      if (pageSizeParam) {
        const s = parseInt(pageSizeParam, 10);
        if (!isNaN(s) && s > 0) setPageSize(vehicleType, s);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [vehicleType, setSelectedSku, setStockTab, setPage, setPageSize]);
}
