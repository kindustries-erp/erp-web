import { useEffect, useState, useCallback } from "react";
import { extractApiError } from "@/shared/utils/apiError";
import { type InventoryStockRow } from "@/modules/operational/api/operationalApi";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useOperationalListQuery } from "@/modules/operational/hooks/useOperationalListQuery";
import { OperationalInventoryPage } from "@/modules/operational/components/list/OperationalInventoryPage";
import {
  inventoryCoreApi,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";

export function InventoryListPage({
  setActions,
}: {
  setActions?: (node: React.ReactNode) => void;
}) {
  const variant = "inventory" as const;

  const listStore = useOperationalListStore();
  const {
    searchInput,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    expandedStockItemIds,
    toggleExpandStockItem,
    itemTypeFilter,
  } = listStore;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movLoadingId, setMovLoadingId] = useState<string | null>(null);
  const [movError, setMovError] = useState<string | null>(null);
  const [movMap, setMovMap] = useState<
    Record<string, InventoryMovementsPayload>
  >({});
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);

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
    item_type: itemTypeFilter || undefined,
  });

  useEffect(() => {
    setLoading(listQuery.isLoading || listQuery.isFetching);
    setError(
      listQuery.error
        ? extractApiError(listQuery.error, "Không tải được dữ liệu")
        : null,
    );
  }, [listQuery.error, listQuery.isFetching, listQuery.isLoading]);

  const stockItems = (listQuery.data?.items || []) as InventoryStockRow[];
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  async function handleToggleInventoryExpand(row: InventoryStockRow) {
    const isExpanded = expandedStockItemIds[row.inventory_item_id];
    toggleExpandStockItem(row.inventory_item_id);
    if (isExpanded) return;
    setMovError(null);
    if (movMap[row.inventory_item_id]) return;
    setMovLoadingId(row.inventory_item_id);
    try {
      const data = await inventoryCoreApi.movements(row.inventory_item_id);
      setMovMap((prev) => ({ ...prev, [row.inventory_item_id]: data }));
    } catch (e) {
      setMovError(
        e instanceof Error ? e.message : "Không thể tải lịch sử xuất nhập kho",
      );
    } finally {
      setMovLoadingId(null);
    }
  }

  return (
    <OperationalInventoryPage
      setActions={setActions}
      loading={loading}
      error={error}
      stockItems={stockItems}
      total={total}
      totalPages={totalPages}
      viewingItemId={viewingItemId}
      movLoadingId={movLoadingId}
      movError={movError}
      movMap={movMap}
      onToggleInventoryExpand={handleToggleInventoryExpand}
      onViewItem={(id) => setViewingItemId(id)}
      onCloseViewItem={() => setViewingItemId(null)}
      onRefetch={useCallback(
        () => void listQuery.refetch(),
        [listQuery.refetch],
      )}
    />
  );
}
