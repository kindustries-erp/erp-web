import { useCallback, useEffect, useRef, useState } from "react";
import { PageKey } from "@/shared/types";
import {
  encodeStateParam,
  decodeStateParam,
  pageToPath,
} from "@/shared/utils/pageUrl";

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

  setFilter: (key: string, value: string) => void;
  setFilters: (patch: Record<string, string>) => void;
  clearFilters: () => void;

  setView: (viewKey: string) => void;

  openDrawer: (id: string, mode?: "view" | "edit") => void;
  closeDrawer: () => void;

  setColumnFilters: (cf: Record<string, string[]>) => void;
  setColumnSearch: (cs: Record<string, string>) => void;
}

function parseUrlParams(
  search: string,
  filterKeys: string[] = [],
  instanceIndex: 1 | 2 = 1,
) {
  const params = new URLSearchParams(search);
  const currentInstanceIndex: 1 | 2 = params.get("_i") === "2" ? 2 : 1;

  // If this hook is for instance 2, but URL doesn't have _i=2, return empty
  // If this hook is for instance 1, but URL has _i=2, return empty
  if (currentInstanceIndex !== instanceIndex) {
    return {
      filters: {},
      view: "",
      drawerId: null,
      drawerMode: "view" as const,
      columnFilters: {},
      columnSearch: {},
    };
  }

  const view = params.get("view") || "";
  const drawerId =
    params.get("detail") ||
    params.get("drawer") ||
    params.get("viewId") ||
    null;
  const drawerMode =
    params.get("dmode") === "edit" ? ("edit" as const) : ("view" as const);

  const filters: Record<string, string> = {};
  filterKeys.forEach((key) => {
    const val = params.get(key);
    if (val !== null && val !== "") {
      filters[key] = val;
    }
  });

  // Also collect any other standard filter params like status, search, dateFrom, dateTo
  ["status", "search", "dateFrom", "dateTo", "page", "pageSize"].forEach(
    (k) => {
      const v = params.get(k);
      if (v !== null && v !== "") {
        filters[k] = v;
      }
    },
  );

  let columnFilters: Record<string, string[]> = {};
  const cfParam = params.get("cf");
  if (cfParam) {
    const decoded = decodeStateParam<Record<string, string[]>>(cfParam);
    if (decoded && typeof decoded === "object") {
      columnFilters = decoded;
    }
  }

  let columnSearch: Record<string, string> = {};
  const csParam = params.get("cs");
  if (csParam) {
    const decoded = decodeStateParam<Record<string, string>>(csParam);
    if (decoded && typeof decoded === "object") {
      columnSearch = decoded;
    }
  }

  return {
    filters,
    view,
    drawerId,
    drawerMode,
    columnFilters,
    columnSearch,
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

  const currentRef = useRef({
    filters: initial.current.filters,
    view: initial.current.view,
    drawerId: initial.current.drawerId,
    drawerMode: initial.current.drawerMode,
    columnFilters: initial.current.columnFilters,
    columnSearch: initial.current.columnSearch,
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
      isNavigational = false,
    ) => {
      if (typeof window === "undefined") return;

      const currentSearch = new URLSearchParams(window.location.search);
      const newParams = new URLSearchParams();

      // Maintain _i param if instance 2
      if (instanceIndex === 2) {
        newParams.set("_i", "2");
      }

      // Maintain tab param if existing
      const tabParam = currentSearch.get("tab");
      if (tabParam) {
        newParams.set("tab", tabParam);
      }

      // View param (if not "all")
      if (newView && newView !== "all") {
        newParams.set("view", newView);
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
        if (encoded) newParams.set("cf", encoded);
      }

      // Column search
      if (Object.keys(newCs).length > 0) {
        const encoded = encodeStateParam(newCs);
        if (encoded) newParams.set("cs", encoded);
      }

      // Drawer params (use detail=...)
      if (drawerSync && newDrawerId) {
        newParams.set("detail", newDrawerId);
        if (newDrawerMode === "edit") {
          newParams.set("dmode", "edit");
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
        false,
      );
    }, 300);
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
      };
      setFiltersState(parsed.filters);
      setViewState(parsed.view);
      setDrawerIdState(parsed.drawerId);
      setDrawerModeState(parsed.drawerMode);
      setColumnFiltersState(parsed.columnFilters);
      setColumnSearchState(parsed.columnSearch);

      if (onUrlStateHydrateRef.current) {
        onUrlStateHydrateRef.current({
          filters: parsed.filters,
          view: parsed.view,
          drawerId: parsed.drawerId || undefined,
          drawerMode: parsed.drawerMode,
          columnFilters: parsed.columnFilters,
          columnSearch: parsed.columnSearch,
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

  return {
    filters,
    view,
    drawerOpen: Boolean(drawerId),
    drawerId,
    drawerMode,
    columnFilters,
    columnSearch,
    setFilter,
    setFilters,
    clearFilters,
    setView,
    openDrawer,
    closeDrawer,
    setColumnFilters,
    setColumnSearch,
  };
}
