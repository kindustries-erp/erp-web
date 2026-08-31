import { useState, useMemo, useCallback, useEffect } from "react";
import { useT } from "@/core/i18n";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useOperationalListQuery } from "@/modules/operational/hooks/useOperationalListQuery";
import { useTags } from "@/modules/tags/hooks/useTags";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function usePurchaseOrderList() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [purchaseSort, setPurchaseSort] = useState<string>("");
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>(
    {},
  );

  const [supplierSearch, setSupplierSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const {
    data: suppliersData,
    fetchNextPage: fetchNextSuppliers,
    isFetchingNextPage: loadingSuppliers,
  } = useBasicMasterInfinite({
    search: supplierSearch,
    limit: 50,
    entities: "suppliers",
    enabled: true,
  });

  const supplierOptions = useMemo(
    () =>
      suppliersData?.pages.flatMap((p) =>
        (p.items.suppliers || []).map((s) => ({ value: s.id, label: s.name })),
      ) || [],
    [suppliersData],
  );

  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingItems,
  } = useBasicMasterInfinite({
    search: itemSearch,
    limit: 50,
    entities: "inventoryItems",
    enabled: true,
  });

  const itemOptions = useMemo(
    () =>
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) || [],
    [itemsData],
  );

  const { data: allTags = [], isLoading: tagsLoading } = useTags();

  const tagOptions = useMemo(
    () => allTags.map((tag) => ({ value: tag.id, label: tag.name })),
    [allTags],
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: false,
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "supplier_id",
          label: t("Nhà cung cấp"),
          placeholder: t("Tất cả nhà cung cấp"),
          options: supplierOptions,
          type: "combobox",
          onSearch: setSupplierSearch,
          onLoadMore: fetchNextSuppliers,
          loading: loadingSuppliers,
        },
        {
          key: "inventory_item_id",
          label: t("Linh kiện"),
          placeholder: t("Tất cả linh kiện"),
          options: itemOptions,
          type: "combobox",
          onSearch: setItemSearch,
          onLoadMore: fetchNextItems,
          loading: loadingItems,
        },
        {
          key: "tag_id",
          label: t("Thẻ nhãn"),
          placeholder: t("Lọc theo tag"),
          options: tagOptions,
          type: "combobox",
          loading: tagsLoading,
        },
      ],
    }),
    [
      supplierOptions,
      itemOptions,
      fetchNextSuppliers,
      loadingSuppliers,
      fetchNextItems,
      loadingItems,
      tagOptions,
      tagsLoading,
      t,
    ],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));
  const tableState = useTableColumnState("purchase-orders-table");

  const purchaseSortArray =
    tableState.sorts.length > 0
      ? tableState.sorts
      : purchaseSort
        ? [purchaseSort]
        : undefined;
  const listQuery = useOperationalListQuery({
    variant: "purchase",
    page,
    pageSize,
    supplier_id: filter.state.custom["supplier_id"] || undefined,
    inventory_item_id: filter.state.custom["inventory_item_id"] || undefined,
    tag_id: filter.state.custom["tag_id"] || undefined,
    date_from: filter.state.dateFrom || undefined,
    date_to: filter.state.dateTo || undefined,
    sort: purchaseSortArray,
    column_search:
      Object.keys(tableState.columnSearch).length > 0
        ? tableState.columnSearch
        : undefined,
    column_filters:
      Object.keys(tableState.columnFilters).length > 0
        ? tableState.columnFilters
        : undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [tableState.columnFilters, tableState.columnSearch, tableState.sorts]);

  const toggleExpandRow = useCallback((id: string) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const togglePurchaseSort = useCallback(
    (field: string) => {
      const current = tableState.sorts.find(
        (s) => s === field || s === `-${field}`,
      );
      const nextState: "asc" | "desc" | "none" = !current
        ? "asc"
        : current.startsWith("-")
          ? "none"
          : "desc";
      tableState.setSort(field, nextState);
      setPage(1);
    },
    [tableState],
  );

  const activeFilterCount = useMemo(() => {
    return tableState.activeFilterCount + filter.activeFilterCount;
  }, [tableState.activeFilterCount, filter.activeFilterCount]);

  const clearAllFilters = useCallback(() => {
    filter.resetAll();
    tableState.resetFilters();
    tableState.sorts.forEach((s) => {
      const key = s.startsWith("-") ? s.slice(1) : s;
      tableState.setSort(key, "none");
    });
    setPurchaseSort("");
    setPage(1);
  }, [filter, tableState]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    purchaseSort,
    setPurchaseSort,
    togglePurchaseSort,
    expandedRowIds,
    toggleExpandRow,
    supplierSearch,
    setSupplierSearch,
    itemSearch,
    setItemSearch,
    filterConfig,
    filter,
    listQuery,
    tableState,
    activeFilterCount,
    clearAllFilters,
  };
}
