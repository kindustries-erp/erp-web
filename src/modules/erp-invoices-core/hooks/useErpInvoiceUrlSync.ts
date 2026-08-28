import { useRef } from "react";
import { usePageUrlState } from "@/shared/hooks/usePageUrlState";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { PageKey } from "@/shared/types";

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
      "status",
      "seller_name",
      "buyer_name",
      "dateFrom",
      "dateTo",
      "search",
      "tag_id",
      "period",
    ],
    drawerSync: true,
    onUrlStateHydrate: (state) => {
      // Hydrate Zustand store
      hydrateStore(storeDir, {
        status: state.filters.status || "",
        seller_name: state.filters.seller_name || "",
        buyer_name: state.filters.buyer_name || "",
        dateFrom: state.filters.dateFrom || "",
        dateTo: state.filters.dateTo || "",
        search: state.filters.search || "",
        tag_id: state.filters.tag_id || "",
        period: state.filters.period || "",
      });

      // Custom onHydrate for columnFilters / view presets
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
  };
}
