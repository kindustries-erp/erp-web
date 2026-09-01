import { useRef } from "react";
import { usePageUrlState } from "@/shared/hooks/usePageUrlState";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { PageKey } from "@/shared/types";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";

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
  const pageKey: PageKey = "erp-invoices";
  const storeDir: Direction =
    instanceIndex === 2 ? (direction === "IN" ? "IN_2" : "OUT_2") : direction;

  const hydrateStore = useErpInvoiceListStore((s) => s.hydrateFromUrl);
  const openDrawerRef = useRef(openDrawer);
  openDrawerRef.current = openDrawer;
  const closeDrawerRef = useRef(closeDrawer);
  closeDrawerRef.current = closeDrawer;
  const onHydrateRef = useRef(onHydrate);
  onHydrateRef.current = onHydrate;

  const urlState = usePageUrlState({
    pageKey,
    instanceIndex,
    filterKeys: [
      ErpUrlQueryParam.TAB,
      ErpUrlQueryParam.VIEW_MODE,
      ErpUrlQueryParam.STATUS,
      ErpUrlQueryParam.SELLER_NAME,
      ErpUrlQueryParam.BUYER_NAME,
      ErpUrlQueryParam.DATE_FROM,
      ErpUrlQueryParam.DATE_TO,
      ErpUrlQueryParam.SEARCH,
      ErpUrlQueryParam.TAG_ID,
      ErpUrlQueryParam.PERIOD,
      ErpUrlQueryParam.SUBCATEGORY,
    ],
    drawerSync: true,
    onUrlStateHydrate: (state) => {
      // Hydrate Zustand store
      hydrateStore(storeDir, {
        status: state.filters[ErpUrlQueryParam.STATUS] || "",
        seller_name: state.filters[ErpUrlQueryParam.SELLER_NAME] || "",
        buyer_name: state.filters[ErpUrlQueryParam.BUYER_NAME] || "",
        dateFrom: state.filters[ErpUrlQueryParam.DATE_FROM] || "",
        dateTo: state.filters[ErpUrlQueryParam.DATE_TO] || "",
        search: state.filters[ErpUrlQueryParam.SEARCH] || "",
        tag_id: state.filters[ErpUrlQueryParam.TAG_ID] || "",
        period: state.filters[ErpUrlQueryParam.PERIOD] || "",
      });

      // Custom onHydrate for columnFilters / view presets / sorts
      if (onHydrateRef.current) {
        onHydrateRef.current(state);
      }

      // Auto-open or auto-close drawer if URL contains/clears drawer id
      if (state.drawerId && openDrawerRef.current) {
        openDrawerRef.current(state.drawerId, state.drawerMode || "view");
      } else if (!state.drawerId && closeDrawerRef.current) {
        closeDrawerRef.current();
      }
    },
  });

  return {
    urlState,
    storeDir,
    activeView: urlState.view || "all",
    setView: urlState.setView,
    openDrawerWithUrl: urlState.openDrawer,
    closeDrawerWithUrl: urlState.closeDrawer,
    syncFiltersToUrl: urlState.setFilters,
    syncColumnFiltersToUrl: urlState.setColumnFilters,
    syncColumnSearchToUrl: urlState.setColumnSearch,
    syncSortsToUrl: urlState.setSorts,
  };
}
