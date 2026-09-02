import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { extractApiError } from "@/shared/utils/apiError";
import { type InventoryStockRow } from "@/modules/operational/api/operationalApi";
import {
  useOperationalListStore,
  type OperationalStockTab,
} from "@/modules/operational/hooks/useOperationalListStore";
import {
  useTableColumnState,
  useTableColumnStore,
} from "@/shared/hooks/useTableColumnState";
import { useOperationalListQuery } from "@/modules/operational/hooks/useOperationalListQuery";
import { OperationalInventoryPage } from "@/modules/operational/components/list/OperationalInventoryPage";
import { Button } from "@/shared/components/ui/Button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Download, Trash, CheckSquare } from "lucide-react";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { encodeStateParam, decodeStateParam } from "@/shared/utils/pageUrl";

export function InventoryListPage() {
  const variant = "inventory" as const;
  const t = useT();

  const listStore = useOperationalListStore();
  const {
    searchInput,
    setSearchInput,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    itemTypeFilter,
    setItemTypeFilter,
    stockTab,
    setStockTab,
  } = listStore;

  const tableState = useTableColumnState("inventory-stock-table");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [creatingItem, setCreatingItem] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // URL Hydration on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    // 1. stock_tab
    const stockTabParam = params.get(
      ErpUrlQueryParam.STOCK_TAB,
    ) as OperationalStockTab;
    if (
      stockTabParam &&
      ["ALL", "IN_STOCK", "OUT_OF_STOCK", "NEGATIVE"].includes(stockTabParam)
    ) {
      setStockTab(stockTabParam);
    }

    // 2. search
    const searchParam = params.get(ErpUrlQueryParam.SEARCH);
    if (searchParam) {
      setSearchInput(searchParam);
      setSearch(searchParam);
    }

    // 3. itemType
    const itemTypeParam = params.get(ErpUrlQueryParam.ITEM_TYPE);
    if (itemTypeParam) {
      setItemTypeFilter(itemTypeParam);
    }

    // 4. page & pageSize
    const pageParam = params.get(ErpUrlQueryParam.PAGE);
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) setPage(p);
    }
    const sizeParam =
      params.get(ErpUrlQueryParam.PAGE_SIZE) ||
      params.get(ErpUrlQueryParam.LIMIT);
    if (sizeParam) {
      const s = parseInt(sizeParam, 10);
      if (!isNaN(s) && s > 0) setPageSize(s);
    }

    // 5. detail & dmode
    const detailParam = params.get(ErpUrlQueryParam.DETAIL);
    if (detailParam) {
      setViewingItemId(detailParam);
      const dmode = params.get(ErpUrlQueryParam.DRAWER_MODE);
      setIsEditMode(dmode === "edit");
    }
  }, [
    setStockTab,
    setSearchInput,
    setSearch,
    setItemTypeFilter,
    setPage,
    setPageSize,
  ]);

  // Debounced State -> URL Sync
  const debounceUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const syncUrlToBrowser = useCallback(() => {
    if (typeof window === "undefined") return;
    const newParams = new URLSearchParams();

    // 1. stock_tab
    if (stockTab && stockTab !== "ALL") {
      newParams.set(ErpUrlQueryParam.STOCK_TAB, stockTab);
    }

    // 2. search
    if (searchInput) {
      newParams.set(ErpUrlQueryParam.SEARCH, searchInput);
    }

    // 3. itemType
    if (itemTypeFilter) {
      newParams.set(ErpUrlQueryParam.ITEM_TYPE, itemTypeFilter);
    }

    // 4. page & pageSize
    if (page > 1) {
      newParams.set(ErpUrlQueryParam.PAGE, String(page));
    }
    if (pageSize) {
      newParams.set(ErpUrlQueryParam.PAGE_SIZE, String(pageSize));
    }

    // 5. Column filters (cf), search (cs), sorts
    if (Object.keys(tableState.columnFilters).length > 0) {
      const encoded = encodeStateParam(tableState.columnFilters);
      if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_FILTERS, encoded);
    }

    if (Object.keys(tableState.columnSearch).length > 0) {
      const encoded = encodeStateParam(tableState.columnSearch);
      if (encoded) newParams.set(ErpUrlQueryParam.COLUMN_SEARCH, encoded);
    }

    if (tableState.sorts.length > 0) {
      const encoded = encodeStateParam(tableState.sorts);
      if (encoded) newParams.set(ErpUrlQueryParam.SORTS, encoded);
    }

    // 6. Detail Drawer
    if (viewingItemId) {
      newParams.set(ErpUrlQueryParam.DETAIL, viewingItemId);
      if (isEditMode) {
        newParams.set(ErpUrlQueryParam.DRAWER_MODE, "edit");
      }
    }

    const newSearch = newParams.toString();
    const newRelativePath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    if (window.location.pathname + window.location.search !== newRelativePath) {
      window.history.replaceState(null, "", newRelativePath);
      useAppStore
        .getState()
        .updateCurrentTabUrl("erp-inventory-stock", newRelativePath);
    }
  }, [
    stockTab,
    searchInput,
    itemTypeFilter,
    page,
    pageSize,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
    viewingItemId,
    isEditMode,
  ]);

  useEffect(() => {
    if (debounceUrlTimerRef.current) {
      clearTimeout(debounceUrlTimerRef.current);
    }
    debounceUrlTimerRef.current = setTimeout(() => {
      syncUrlToBrowser();
    }, DEFAULT_DEBOUNCE_TIME);

    return () => {
      if (debounceUrlTimerRef.current) {
        clearTimeout(debounceUrlTimerRef.current);
      }
    };
  }, [syncUrlToBrowser]);

  // Popstate sync (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);

      // 1. stock_tab
      const stockTabParam =
        (params.get(ErpUrlQueryParam.STOCK_TAB) as OperationalStockTab) ||
        "ALL";
      if (
        ["ALL", "IN_STOCK", "OUT_OF_STOCK", "NEGATIVE"].includes(stockTabParam)
      ) {
        setStockTab(stockTabParam);
      }

      // 2. search
      const searchParam = params.get(ErpUrlQueryParam.SEARCH) || "";
      setSearchInput(searchParam);
      setSearch(searchParam);

      // 3. itemType
      const itemTypeParam = params.get(ErpUrlQueryParam.ITEM_TYPE) || "";
      setItemTypeFilter(itemTypeParam);

      // 4. page & pageSize
      const pageParam = params.get(ErpUrlQueryParam.PAGE);
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p) && p > 0) setPage(p);
      } else {
        setPage(1);
      }

      const sizeParam =
        params.get(ErpUrlQueryParam.PAGE_SIZE) ||
        params.get(ErpUrlQueryParam.LIMIT);
      if (sizeParam) {
        const s = parseInt(sizeParam, 10);
        if (!isNaN(s) && s > 0) setPageSize(s);
      }

      // 5. Column filters (cf), search (cs), sorts
      const cfParam = params.get(ErpUrlQueryParam.COLUMN_FILTERS);
      if (cfParam) {
        const decoded = decodeStateParam<Record<string, string[]>>(cfParam);
        if (decoded) {
          Object.entries(decoded).forEach(([col, vals]) => {
            useTableColumnStore
              .getState()
              .setColumnFilter(
                "inventory-stock-table",
                col,
                Array.isArray(vals) ? vals : [String(vals)],
              );
          });
        }
      }

      const csParam = params.get(ErpUrlQueryParam.COLUMN_SEARCH);
      if (csParam) {
        const decoded = decodeStateParam<Record<string, string>>(csParam);
        if (decoded) {
          Object.entries(decoded).forEach(([col, val]) => {
            useTableColumnStore
              .getState()
              .setColumnSearch("inventory-stock-table", col, String(val));
          });
        }
      }

      const sortsParam = params.get(ErpUrlQueryParam.SORTS);
      if (sortsParam) {
        const decoded = decodeStateParam<string[]>(sortsParam);
        if (Array.isArray(decoded)) {
          decoded.forEach((s) => {
            const isDesc = s.startsWith("-");
            const field = isDesc ? s.substring(1) : s;
            useTableColumnStore
              .getState()
              .setSort("inventory-stock-table", field, isDesc ? "desc" : "asc");
          });
        }
      }

      // 6. Detail Drawer
      const detailParam = params.get(ErpUrlQueryParam.DETAIL);
      if (detailParam) {
        setViewingItemId(detailParam);
        const dmode = params.get(ErpUrlQueryParam.DRAWER_MODE);
        setIsEditMode(dmode === "edit");
      } else {
        setViewingItemId(null);
        setIsEditMode(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    setStockTab,
    setSearchInput,
    setSearch,
    setItemTypeFilter,
    setPage,
    setPageSize,
  ]);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, setSearch, setPage]);

  const listQuery = useOperationalListQuery({
    variant,
    page,
    pageSize,
    search: search || undefined,
    stock_tab: stockTab === "ALL" ? undefined : stockTab,
    item_type: itemTypeFilter || undefined,
    sort: tableState.sorts.length > 0 ? tableState.sorts : undefined,
    column_search: tableState.columnSearch,
    column_filters: tableState.columnFilters,
  });

  useEffect(() => {
    setLoading(listQuery.isLoading || listQuery.isFetching || isReloading);
    setError(
      listQuery.error
        ? extractApiError(listQuery.error, "Không tải được dữ liệu")
        : null,
    );
  }, [listQuery.error, listQuery.isFetching, listQuery.isLoading]);

  const stockItems = (listQuery.data?.items || []) as InventoryStockRow[];
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const selectedCount = Object.keys(rowSelection).filter(
    (key) => rowSelection[key],
  ).length;

  const bulkActionsNode = useMemo(() => {
    return selectedCount > 0 ? (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-primary border-primary/30 hover:bg-primary/5 shadow-sm"
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            {t("bulkActions", "Thao tác")} ({selectedCount})
            <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-[9999] min-w-[140px] rounded-lg p-1 bg-surface shadow-md border border-border"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs cursor-pointer outline-none hover:bg-muted"
              onClick={() => {}}
            >
              <Download size={14} />
              Xuất file
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-border my-1" />
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs cursor-pointer outline-none hover:bg-red-50 text-red-600"
              onClick={() => {}}
            >
              <Trash size={14} />
              Xóa
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    ) : null;
  }, [selectedCount]);

  return (
    <>
      <OperationalInventoryPage
        loading={loading}
        error={error}
        stockItems={stockItems}
        total={total}
        totalPages={totalPages}
        viewingItemId={viewingItemId}
        creatingItem={creatingItem}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onViewItem={(id) => setViewingItemId(id)}
        onCloseViewItem={() => {
          setViewingItemId(null);
          setIsEditMode(false);
        }}
        onOpenCreateItem={() => setCreatingItem(true)}
        onCloseCreateItem={() => setCreatingItem(false)}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        bulkActionsNode={bulkActionsNode}
        onRefetch={useCallback(() => {
          setIsReloading(true);
          Promise.all([
            listQuery.refetch(),
            new Promise((resolve) => setTimeout(resolve, 500)),
          ]).finally(() => setIsReloading(false));
        }, [listQuery.refetch])}
      />
    </>
  );
}
