import { useState, useMemo, useCallback } from "react";
import { useT } from "@/core/i18n";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useOperationalListQuery } from "@/modules/operational/hooks/useOperationalListQuery";

export function usePurchaseOrderList() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      period: true,
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
      ],
    }),
    [
      supplierOptions,
      itemOptions,
      fetchNextSuppliers,
      loadingSuppliers,
      fetchNextItems,
      loadingItems,
      t,
    ],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const purchaseSortArray = purchaseSort ? [purchaseSort] : undefined;
  const listQuery = useOperationalListQuery({
    variant: "purchase",
    page,
    pageSize,
    search: filter.state.search || undefined,
    supplier_id: filter.state.custom["supplier_id"] || undefined,
    inventory_item_id: filter.state.custom["inventory_item_id"] || undefined,
    date_from: filter.state.dateFrom || undefined,
    date_to: filter.state.dateTo || undefined,
    sort: purchaseSortArray,
  });

  const toggleExpandRow = useCallback((id: string) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const togglePurchaseSort = useCallback((field: string) => {
    setPurchaseSort((prev) => {
      let next: string;
      if (prev === field) next = `-${field}`;
      else if (prev === `-${field}`) next = "";
      else next = field;
      return next;
    });
    setPage(1);
  }, []);

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
  };
}
