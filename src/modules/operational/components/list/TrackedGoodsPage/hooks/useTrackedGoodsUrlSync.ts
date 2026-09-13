import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/core/config/appStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam } from "@/shared/utils/pageUrl";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";

export interface UseTrackedGoodsUrlSyncOptions {
  fixedTrackingPolicy?: string;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  search: string;
  itemTypeFilter: string;
  trackingPolicyFilter: string;
  statusFilter: string;
  missingSerialFilter: boolean;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize?: (size: number) => void;
  tableState: ReturnType<typeof useTableColumnState>;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerMode: "view" | "edit";
  setDrawerMode: (mode: "view" | "edit") => void;
  selectedItem: InventorySerialRow | null;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<InventorySerialRow | null>
  >;
}

export function useTrackedGoodsUrlSync({
  fixedTrackingPolicy,
  currentTab,
  setCurrentTab,
  search,
  itemTypeFilter,
  trackingPolicyFilter,
  statusFilter,
  missingSerialFilter,
  page,
  setPage,
  pageSize,
  setPageSize,
  tableState,
  drawerOpen,
  setDrawerOpen,
  drawerMode,
  setDrawerMode,
  selectedItem,
  setSelectedItem,
}: UseTrackedGoodsUrlSyncOptions) {
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const prevTabRef = useRef(currentTab);

  const syncUrlToBrowser = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentUrl = new URL(window.location.href);
    const newParams = new URLSearchParams(currentUrl.search);

    // 1. Tab
    if (!fixedTrackingPolicy) {
      newParams.set(ErpUrlQueryParam.TAB, currentTab);
    }

    // 2. Filters
    if (search) newParams.set(ErpUrlQueryParam.SEARCH, search);
    else newParams.delete(ErpUrlQueryParam.SEARCH);

    if (itemTypeFilter)
      newParams.set(ErpUrlQueryParam.ITEM_TYPE, itemTypeFilter);
    else newParams.delete(ErpUrlQueryParam.ITEM_TYPE);

    if (trackingPolicyFilter)
      newParams.set(ErpUrlQueryParam.TRACKING_POLICY, trackingPolicyFilter);
    else newParams.delete(ErpUrlQueryParam.TRACKING_POLICY);

    if (statusFilter) newParams.set(ErpUrlQueryParam.STATUS, statusFilter);
    else newParams.delete(ErpUrlQueryParam.STATUS);

    if (missingSerialFilter)
      newParams.set(ErpUrlQueryParam.MISSING_SERIAL, "true");
    else newParams.delete(ErpUrlQueryParam.MISSING_SERIAL);

    // 3. Pagination
    if (page > 1) newParams.set(ErpUrlQueryParam.PAGE, String(page));
    else newParams.delete(ErpUrlQueryParam.PAGE);

    if (pageSize) {
      newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(pageSize));
    }

    // 4. Column filters & Search
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

    // 5. Sorts
    if (tableState.sorts.length > 0) {
      const encoded = encodeStateParam(tableState.sorts);
      if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
    } else {
      newParams.delete(ErpUrlQueryParam.SORTS);
    }

    // 6. Detail Drawer
    const detailKey = selectedItem?.serialNo || selectedItem?.id;
    if (drawerOpen && detailKey) {
      newParams.set(ErpUrlQueryParam.DETAIL, detailKey);
      if (drawerMode === "edit") {
        newParams.set(ErpUrlQueryParam.DRAWER_MODE, "edit");
      } else {
        newParams.delete(ErpUrlQueryParam.DRAWER_MODE);
      }
    } else if (!drawerOpen) {
      newParams.delete(ErpUrlQueryParam.DETAIL);
      newParams.delete(ErpUrlQueryParam.DRAWER_MODE);
    }

    const newSearch = newParams.toString();
    const newRelativePath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    if (window.location.pathname + window.location.search !== newRelativePath) {
      window.history.replaceState(null, "", newRelativePath);
      const instanceId = fixedTrackingPolicy
        ? `erp-inventory-tracking-${fixedTrackingPolicy.toLowerCase()}`
        : "erp-inventory-tracking";
      useAppStore.getState().updateCurrentTabUrl(instanceId, newRelativePath);
    }
  }, [
    fixedTrackingPolicy,
    currentTab,
    search,
    itemTypeFilter,
    trackingPolicyFilter,
    statusFilter,
    missingSerialFilter,
    page,
    pageSize,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
    drawerOpen,
    drawerMode,
    selectedItem?.serialNo,
    selectedItem?.id,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If tab changed, sync immediately without debounce
    if (prevTabRef.current !== currentTab) {
      prevTabRef.current = currentTab;
      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }
      syncUrlToBrowser();
      return;
    }

    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }

    debounceUrlTimerRef.current = setTimeout(() => {
      syncUrlToBrowser();
    }, DEFAULT_DEBOUNCE_TIME);

    return () => {
      if (debounceUrlTimerRef.current)
        clearTimeout(debounceUrlTimerRef.current);
    };
  }, [currentTab, syncUrlToBrowser]);

  // Handle popstate for 2-way sync
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const detailParam = params.get(ErpUrlQueryParam.DETAIL);
      if (detailParam) {
        setSelectedItem((prev) =>
          prev?.serialNo === detailParam || prev?.id === detailParam
            ? prev
            : ({
                id: detailParam,
                serialNo: detailParam,
              } as unknown as InventorySerialRow),
        );
        setDrawerOpen(true);
        setDrawerMode(
          (params.get(ErpUrlQueryParam.DRAWER_MODE) as "view" | "edit") ||
            "view",
        );
      } else {
        setDrawerOpen(false);
      }

      const tabParam = params.get(ErpUrlQueryParam.TAB);
      if (tabParam && tabParam !== currentTab) {
        setCurrentTab(tabParam);
      }

      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p)) setPage(p);
      } else {
        setPage(1);
      }

      const pageSizeParam = params.get(ErpUrlQueryParam.PAGE_SIZE);
      if (pageSizeParam && setPageSize) {
        const s = parseInt(pageSizeParam, 10);
        if (!isNaN(s) && s > 0) setPageSize(s);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    currentTab,
    setCurrentTab,
    setPage,
    setPageSize,
    setDrawerOpen,
    setDrawerMode,
    setSelectedItem,
  ]);
}
