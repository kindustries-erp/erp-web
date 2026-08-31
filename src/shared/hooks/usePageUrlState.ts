import { useCallback, useEffect, useRef, useState } from "react";
import { PageKey } from "@/shared/types";
import {
  encodeStateParam,
  decodeStateParam,
  pageToPath,
} from "@/shared/utils/pageUrl";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";

export interface PageUrlStateOptions {
  pageKey: PageKey;
  instanceIndex?: 1 | 2;
  filterKeys?: string[];
  drawerSync?: boolean;
  onUrlStateHydrate?: (state: {
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

export interface PageUrlStateReturn {
  filters: Record<string, string>;
  view: string;
  drawerOpen: boolean;
  drawerId: string | null;
  drawerMode: "view" | "edit";
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
  sorts: string[];
  page?: number;
  pageSize?: number;

  setFilter: (key: string, value: string) => void;
  setFilters: (patch: Record<string, string>) => void;
  clearFilters: () => void;

  setView: (viewKey: string) => void;

  openDrawer: (id: string, mode?: "view" | "edit") => void;
  closeDrawer: () => void;

  setColumnFilters: (cf: Record<string, string[]>) => void;
  setColumnSearch: (cs: Record<string, string>) => void;
  setSorts: (sorts: string[]) => void;
  setPagination: (page: number, pageSize?: number) => void;
}

function parseUrlParams(
  search: string,
  filterKeys: string[] = [],
  instanceIndex: 1 | 2 = 1,
) {
  const params = new URLSearchParams(search);
  const currentInstanceIndex: 1 | 2 =
    params.get(ErpUrlQueryParam.INSTANCE_INDEX) === "2" ? 2 : 1;

  if (currentInstanceIndex !== instanceIndex) {
    return {
      filters: {},
      view: "",
      drawerId: null,
      drawerMode: "view" as const,
      columnFilters: {},
      columnSearch: {},
      sorts: [] as string[],
      page: undefined as number | undefined,
      pageSize: undefined as number | undefined,
    };
  }

  const view = params.get(ErpUrlQueryParam.VIEW) || "";
  const drawerId =
    params.get(ErpUrlQueryParam.DETAIL) ||
    params.get(ErpUrlQueryParam.DRAWER) ||
    params.get(ErpUrlQueryParam.VIEW_ID) ||
    null;
  const drawerMode =
    params.get(ErpUrlQueryParam.DRAWER_MODE) === "edit"
      ? ("edit" as const)
      : ("view" as const);

  const filters: Record<string, string> = {};
  filterKeys.forEach((key) => {
    const val = params.get(key);
    if (val !== null && val !== "") {
      filters[key] = val;
    }
  });

  // Standard filter keys
  [
    ErpUrlQueryParam.STATUS,
    ErpUrlQueryParam.SEARCH,
    ErpUrlQueryParam.DATE_FROM,
    ErpUrlQueryParam.DATE_TO,
    ErpUrlQueryParam.PERIOD,
    ErpUrlQueryParam.SELLER_NAME,
    ErpUrlQueryParam.BUYER_NAME,
    ErpUrlQueryParam.TAG_ID,
    ErpUrlQueryParam.SUBCATEGORY,
    ErpUrlQueryParam.ITEM_TYPE,
    ErpUrlQueryParam.TRACKING_POLICY,
    ErpUrlQueryParam.MISSING_SERIAL,
    ErpUrlQueryParam.VEHICLE_TYPE,
    ErpUrlQueryParam.PARTNER_TAX_CODE,
  ].forEach((k) => {
    const v = params.get(k);
    if (v !== null && v !== "") {
      filters[k] = v;
    }
  });

  const columnFilters: Record<string, string[]> = {};
  const cfParam = params.get(ErpUrlQueryParam.COLUMN_FILTERS);
  if (cfParam) {
    const decoded = decodeStateParam<Record<string, unknown>>(cfParam);
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      Object.entries(decoded).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          columnFilters[k] = v.map((item) => String(item));
        } else if (v !== undefined && v !== null && v !== "") {
          columnFilters[k] = [String(v)];
        }
      });
    }
  }

  const columnSearch: Record<string, string> = {};
  const csParam = params.get(ErpUrlQueryParam.COLUMN_SEARCH);
  if (csParam) {
    const decoded = decodeStateParam<Record<string, unknown>>(csParam);
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      Object.entries(decoded).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          columnSearch[k] = v.join(",");
        } else if (v !== undefined && v !== null && v !== "") {
          columnSearch[k] = String(v);
        }
      });
    }
  }

  let sorts: string[] = [];
  const sortsParam = params.get(ErpUrlQueryParam.SORTS);
  if (sortsParam) {
    const decoded = decodeStateParam<string[] | string>(sortsParam);
    if (Array.isArray(decoded)) {
      sorts = decoded.map((s) => String(s));
    } else if (typeof decoded === "string" && decoded) {
      sorts = [decoded];
    }
  }

  const pageVal = params.get(ErpUrlQueryParam.PAGE);
  const page = pageVal ? parseInt(pageVal, 10) : undefined;
  const pageSizeVal =
    params.get(ErpUrlQueryParam.PAGE_SIZE) ||
    params.get(ErpUrlQueryParam.LIMIT);
  const pageSize = pageSizeVal ? parseInt(pageSizeVal, 10) : undefined;

  return {
    filters,
    view,
    drawerId,
    drawerMode,
    columnFilters,
    columnSearch,
    sorts,
    page,
    pageSize,
  };
}

export function usePageUrlState({
  pageKey,
  instanceIndex = 1,
  filterKeys = [],
  drawerSync = true,
  onUrlStateHydrate,
}: PageUrlStateOptions): PageUrlStateReturn {
  const initial = useRef(
    parseUrlParams(
      typeof window !== "undefined" ? window.location.search : "",
      filterKeys,
      instanceIndex,
    ),
  );

  const [filters, setFiltersState] = useState<Record<string, string>>(
    initial.current.filters,
  );
  const [view, setViewState] = useState<string>(initial.current.view);
  const [drawerId, setDrawerIdState] = useState<string | null>(
    initial.current.drawerId,
  );
  const [drawerMode, setDrawerModeState] = useState<"view" | "edit">(
    initial.current.drawerMode,
  );
  const [columnFilters, setColumnFiltersState] = useState<
    Record<string, string[]>
  >(initial.current.columnFilters);
  const [columnSearch, setColumnSearchState] = useState<Record<string, string>>(
    initial.current.columnSearch,
  );
  const [sorts, setSortsState] = useState<string[]>(initial.current.sorts);
  const [page, setPageState] = useState<number | undefined>(
    initial.current.page,
  );
  const [pageSize, setPageSizeState] = useState<number | undefined>(
    initial.current.pageSize,
  );

  const currentRef = useRef({
    filters: initial.current.filters,
    view: initial.current.view,
    drawerId: initial.current.drawerId,
    drawerMode: initial.current.drawerMode,
    columnFilters: initial.current.columnFilters,
    columnSearch: initial.current.columnSearch,
    sorts: initial.current.sorts,
    page: initial.current.page,
    pageSize: initial.current.pageSize,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync to URL
  const writeToUrl = useCallback(
    (
      newFilters: Record<string, string>,
      newView: string,
      newDrawerId: string | null,
      newDrawerMode: "view" | "edit",
      newCf: Record<string, string[]>,
      newCs: Record<string, string>,
      newSorts: string[],
      newPage?: number,
      newPageSize?: number,
      isNavigational = false,
    ) => {
      if (typeof window === "undefined") return;

      const currentSearch = new URLSearchParams(window.location.search);
      const newParams = new URLSearchParams();

      // Maintain _i param if instance 2
      if (instanceIndex === 2) {
        newParams.set(ErpUrlQueryParam.INSTANCE_INDEX, "2");
      }

      // Maintain tab param if existing
      const tabParam = currentSearch.get(ErpUrlQueryParam.TAB);
      if (tabParam) {
        newParams.set(ErpUrlQueryParam.TAB, tabParam);
      }

      // View param (if not "all")
      if (newView && newView !== "all") {
        newParams.set(ErpUrlQueryParam.VIEW, newView);
      }

      // Filters
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v && v.trim() !== "") {
          newParams.set(k, v);
        }
      });

      // Column filters (clean/compact)
      if (Object.keys(newCf).length > 0) {
        const encoded = encodeStateParam(newCf);
        if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
      }

      // Column search
      if (Object.keys(newCs).length > 0) {
        const encoded = encodeStateParam(newCs);
        if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
      }

      // Sorts
      if (newSorts && newSorts.length > 0) {
        const encodedSorts = encodeStateParam(newSorts);
        if (encodedSorts) newParams.set(ErpUrlQueryParam.SORTS, encodedSorts);
      }

      // Pagination
      if (newPage && newPage > 1) {
        newParams.set(ErpUrlQueryParam.PAGE, String(newPage));
      }
      if (newPageSize) {
        newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(newPageSize));
      }

      // Drawer params (use detail=...)
      if (drawerSync && newDrawerId) {
        newParams.set(ErpUrlQueryParam.DETAIL, newDrawerId);
        if (newDrawerMode === "edit") {
          newParams.set(ErpUrlQueryParam.DRAWER_MODE, "edit");
        }
      }

      const newUrl = pageToPath(
        pageKey,
        tabParam ?? undefined,
        Object.fromEntries(newParams.entries()),
      );

      const currentFullPath = window.location.pathname + window.location.search;
      if (currentFullPath !== newUrl) {
        if (isNavigational) {
          window.history.pushState(null, "", newUrl);
        } else {
          window.history.replaceState(null, "", newUrl);
        }
      }
    },
    [pageKey, instanceIndex, drawerSync],
  );

  const debouncedWriteToUrl = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const c = currentRef.current;
      writeToUrl(
        c.filters,
        c.view,
        c.drawerId,
        c.drawerMode,
        c.columnFilters,
        c.columnSearch,
        c.sorts,
        c.page,
        c.pageSize,
        false,
      );
    }, DEFAULT_DEBOUNCE_TIME);
  }, [writeToUrl]);

  const onUrlStateHydrateRef = useRef(onUrlStateHydrate);
  onUrlStateHydrateRef.current = onUrlStateHydrate;
  const filterKeysRef = useRef(filterKeys);
  filterKeysRef.current = filterKeys;

  // Initial hydrate callback
  useEffect(() => {
    if (onUrlStateHydrateRef.current) {
      onUrlStateHydrateRef.current({
        filters: initial.current.filters,
        view: initial.current.view,
        drawerId: initial.current.drawerId || undefined,
        drawerMode: initial.current.drawerMode,
        columnFilters: initial.current.columnFilters,
        columnSearch: initial.current.columnSearch,
        sorts: initial.current.sorts,
        page: initial.current.page,
        pageSize: initial.current.pageSize,
      });
    }
  }, []);

  // Listen for browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlParams(
        window.location.search,
        filterKeysRef.current,
        instanceIndex,
      );
      currentRef.current = {
        filters: parsed.filters,
        view: parsed.view,
        drawerId: parsed.drawerId,
        drawerMode: parsed.drawerMode,
        columnFilters: parsed.columnFilters,
        columnSearch: parsed.columnSearch,
        sorts: parsed.sorts,
        page: parsed.page,
        pageSize: parsed.pageSize,
      };
      setFiltersState(parsed.filters);
      setViewState(parsed.view);
      setDrawerIdState(parsed.drawerId);
      setDrawerModeState(parsed.drawerMode);
      setColumnFiltersState(parsed.columnFilters);
      setColumnSearchState(parsed.columnSearch);
      setSortsState(parsed.sorts);
      setPageState(parsed.page);
      setPageSizeState(parsed.pageSize);

      if (onUrlStateHydrateRef.current) {
        onUrlStateHydrateRef.current({
          filters: parsed.filters,
          view: parsed.view,
          drawerId: parsed.drawerId || undefined,
          drawerMode: parsed.drawerMode,
          columnFilters: parsed.columnFilters,
          columnSearch: parsed.columnSearch,
          sorts: parsed.sorts,
          page: parsed.page,
          pageSize: parsed.pageSize,
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [instanceIndex]);

  // Setters
  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = { ...currentRef.current.filters };
      if (!value || value.trim() === "") {
        delete next[key];
      } else {
        next[key] = value;
      }
      currentRef.current.filters = next;
      setFiltersState(next);
      debouncedWriteToUrl();
    },
    [debouncedWriteToUrl],
  );

  const setFilters = useCallback(
    (patch: Record<string, string>) => {
      const next = { ...currentRef.current.filters };
      Object.entries(patch).forEach(([k, v]) => {
        if (!v || v.trim() === "") {
          delete next[k];
        } else {
          next[k] = v;
        }
      });
      currentRef.current.filters = next;
      setFiltersState(next);
      debouncedWriteToUrl();
    },
    [debouncedWriteToUrl],
  );

  const clearFilters = useCallback(() => {
    currentRef.current.filters = {};
    currentRef.current.view = "";
    setFiltersState({});
    setViewState("");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const c = currentRef.current;
    writeToUrl(
      {},
      "",
      c.drawerId,
      c.drawerMode,
      c.columnFilters,
      c.columnSearch,
      c.sorts,
      c.page,
      c.pageSize,
      false,
    );
  }, [writeToUrl]);

  const setView = useCallback(
    (viewKey: string) => {
      const normalized = viewKey === "all" ? "" : viewKey;
      currentRef.current.view = normalized;
      setViewState(normalized);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const c = currentRef.current;
      writeToUrl(
        c.filters,
        normalized,
        c.drawerId,
        c.drawerMode,
        c.columnFilters,
        c.columnSearch,
        c.sorts,
        c.page,
        c.pageSize,
        false,
      );
    },
    [writeToUrl],
  );

  const openDrawer = useCallback(
    (id: string, mode: "view" | "edit" = "view") => {
      currentRef.current.drawerId = id;
      currentRef.current.drawerMode = mode;
      setDrawerIdState(id);
      setDrawerModeState(mode);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const c = currentRef.current;
      writeToUrl(
        c.filters,
        c.view,
        id,
        mode,
        c.columnFilters,
        c.columnSearch,
        c.sorts,
        c.page,
        c.pageSize,
        true,
      );
    },
    [writeToUrl],
  );

  const closeDrawer = useCallback(() => {
    currentRef.current.drawerId = null;
    currentRef.current.drawerMode = "view";
    setDrawerIdState(null);
    setDrawerModeState("view");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const c = currentRef.current;
    writeToUrl(
      c.filters,
      c.view,
      null,
      "view",
      c.columnFilters,
      c.columnSearch,
      c.sorts,
      c.page,
      c.pageSize,
      false,
    );
  }, [writeToUrl]);

  const setColumnFilters = useCallback(
    (cf: Record<string, string[]>) => {
      currentRef.current.columnFilters = cf;
      setColumnFiltersState(cf);
      debouncedWriteToUrl();
    },
    [debouncedWriteToUrl],
  );

  const setColumnSearch = useCallback(
    (cs: Record<string, string>) => {
      currentRef.current.columnSearch = cs;
      setColumnSearchState(cs);
      debouncedWriteToUrl();
    },
    [debouncedWriteToUrl],
  );

  const setSorts = useCallback(
    (nextSorts: string[]) => {
      currentRef.current.sorts = nextSorts;
      setSortsState(nextSorts);
      debouncedWriteToUrl();
    },
    [debouncedWriteToUrl],
  );

  const setPagination = useCallback(
    (newPage: number, newPageSize?: number) => {
      currentRef.current.page = newPage;
      setPageState(newPage);
      if (newPageSize) {
        currentRef.current.pageSize = newPageSize;
        setPageSizeState(newPageSize);
      }
      debouncedWriteToUrl();
    },
    [debouncedWriteToUrl],
  );

  return {
    filters,
    view,
    drawerOpen: Boolean(drawerId),
    drawerId,
    drawerMode,
    columnFilters,
    columnSearch,
    sorts,
    page,
    pageSize,
    setFilter,
    setFilters,
    clearFilters,
    setView,
    openDrawer,
    closeDrawer,
    setColumnFilters,
    setColumnSearch,
    setSorts,
    setPagination,
  };
}
