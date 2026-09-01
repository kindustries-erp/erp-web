import { useRef, useEffect, useCallback, useState } from "react";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { useAppStore } from "@/core/config/appStore";

export interface UseErpInvoiceUrlSyncOptions {
  direction: "IN" | "OUT";
  instanceIndex?: 1 | 2;
  openDrawer?: (id: string, mode?: "view" | "edit") => void;
  closeDrawer?: () => void;
  onHydrate?: (state: {
    filters: Record<string, string>;
    view?: string;
    drawerId?: string;
    drawerMode?: "view" | "edit";
    columnFilters?: Record<string, string[]>;
    columnSearch?: Record<string, string>;
    sorts?: string[];
    page?: number;
    pageSize?: number;
  }) => void;
}

export function useErpInvoiceUrlSync({
  direction,
  instanceIndex = 1,
  openDrawer,
  closeDrawer,
  onHydrate,
}: UseErpInvoiceUrlSyncOptions) {
  const storeDir: Direction =
    instanceIndex === 2 ? (direction === "IN" ? "IN_2" : "OUT_2") : direction;

  const hydrateStore = useErpInvoiceListStore((s) => s.hydrateFromUrl);
  const openDrawerRef = useRef(openDrawer);
  openDrawerRef.current = openDrawer;
  const closeDrawerRef = useRef(closeDrawer);
  closeDrawerRef.current = closeDrawer;
  const onHydrateRef = useRef(onHydrate);
  onHydrateRef.current = onHydrate;

  // Initial hydrate on mount
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || typeof window === "undefined") return;
    hydratedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const filters: Record<string, string> = {};
    [
      ErpUrlQueryParam.STATUS,
      ErpUrlQueryParam.SELLER_NAME,
      ErpUrlQueryParam.BUYER_NAME,
      ErpUrlQueryParam.DATE_FROM,
      ErpUrlQueryParam.DATE_TO,
      ErpUrlQueryParam.SEARCH,
      ErpUrlQueryParam.TAG_ID,
      ErpUrlQueryParam.PERIOD,
    ].forEach((k) => {
      const val = params.get(k);
      if (val) filters[k] = val;
    });

    const drawerId = params.get(ErpUrlQueryParam.DETAIL) || undefined;
    const drawerMode =
      (params.get(ErpUrlQueryParam.DRAWER_MODE) as "view" | "edit") ||
      undefined;
    const view = params.get(ErpUrlQueryParam.VIEW_MODE) || undefined;

    // Decode column filters
    let columnFilters: Record<string, string[]> | undefined;
    const cfRaw = params.get(ErpUrlQueryParam.COLUMN_FILTERS);
    if (cfRaw) {
      try {
        columnFilters = JSON.parse(decodeURIComponent(cfRaw));
      } catch {
        /* ignore invalid json */
      }
    }

    // Decode column search
    let columnSearch: Record<string, string> | undefined;
    const csRaw = params.get(ErpUrlQueryParam.COLUMN_SEARCH);
    if (csRaw) {
      try {
        columnSearch = JSON.parse(decodeURIComponent(csRaw));
      } catch {
        /* ignore invalid json */
      }
    }

    // Decode sorts
    let sorts: string[] | undefined;
    const sRaw = params.get(ErpUrlQueryParam.SORTS);
    if (sRaw) {
      try {
        sorts = JSON.parse(decodeURIComponent(sRaw));
      } catch {
        /* ignore invalid json */
      }
    }

    // Hydrate store
    hydrateStore(storeDir, {
      status: filters[ErpUrlQueryParam.STATUS] || "",
      seller_name: filters[ErpUrlQueryParam.SELLER_NAME] || "",
      buyer_name: filters[ErpUrlQueryParam.BUYER_NAME] || "",
      dateFrom: filters[ErpUrlQueryParam.DATE_FROM] || "",
      dateTo: filters[ErpUrlQueryParam.DATE_TO] || "",
      search: filters[ErpUrlQueryParam.SEARCH] || "",
      tag_id: filters[ErpUrlQueryParam.TAG_ID] || "",
      period: filters[ErpUrlQueryParam.PERIOD] || "",
    });

    if (onHydrateRef.current) {
      onHydrateRef.current({
        filters,
        view,
        drawerId,
        drawerMode,
        columnFilters,
        columnSearch,
        sorts,
      });
    }

    if (drawerId && openDrawerRef.current) {
      openDrawerRef.current(drawerId, drawerMode || "view");
    }
  }, [hydrateStore, storeDir]);

  const [drawerId, setDrawerId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    return params.get(ErpUrlQueryParam.DETAIL) || undefined;
  });
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | undefined>(
    () => {
      if (typeof window === "undefined") return undefined;
      const params = new URLSearchParams(window.location.search);
      return (
        (params.get(ErpUrlQueryParam.DRAWER_MODE) as "view" | "edit") ||
        undefined
      );
    },
  );

  const openDrawerWithUrl = useCallback(
    (id: string, mode: "view" | "edit" = "view") => {
      setDrawerId(id);
      setDrawerMode(mode);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      url.searchParams.set(ErpUrlQueryParam.DETAIL, id);
      if (mode === "edit") {
        url.searchParams.set(ErpUrlQueryParam.DRAWER_MODE, "edit");
      } else {
        url.searchParams.delete(ErpUrlQueryParam.DRAWER_MODE);
      }
      window.history.replaceState(null, "", url.toString());
      const instanceId =
        instanceIndex === 2 ? "erp-invoices__2" : "erp-invoices";
      useAppStore.getState().updateCurrentTabUrl(instanceId, url.toString());
    },
    [instanceIndex],
  );

  const closeDrawerWithUrl = useCallback(() => {
    setDrawerId(undefined);
    setDrawerMode(undefined);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete(ErpUrlQueryParam.DETAIL);
    url.searchParams.delete(ErpUrlQueryParam.DRAWER_MODE);
    window.history.replaceState(null, "", url.toString());
    const instanceId = instanceIndex === 2 ? "erp-invoices__2" : "erp-invoices";
    useAppStore.getState().updateCurrentTabUrl(instanceId, url.toString());
  }, [instanceIndex]);

  const noop = useCallback(() => {}, []);

  return {
    urlState: {
      view: undefined,
      drawerId,
      drawerMode,
      openDrawer: openDrawerWithUrl,
      closeDrawer: closeDrawerWithUrl,
      setView: noop,
      setFilters: noop,
      setColumnFilters: noop,
      setColumnSearch: noop,
      setSorts: noop,
      setPage: noop,
      setPageSize: noop,
      resetAll: noop,
    },
    storeDir,
    activeView: "all",
    setView: noop,
    openDrawerWithUrl,
    closeDrawerWithUrl,
    syncFiltersToUrl: noop,
    syncColumnFiltersToUrl: noop,
    syncColumnSearchToUrl: noop,
    syncSortsToUrl: noop,
  };
}
