import { useEffect, useState, useCallback, useMemo } from "react";
import { extractApiError } from "@/shared/utils/apiError";
import { type InventoryStockRow } from "@/modules/operational/api/operationalApi";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useOperationalListQuery } from "@/modules/operational/hooks/useOperationalListQuery";
import { OperationalInventoryPage } from "@/modules/operational/components/list/OperationalInventoryPage";
import { Button } from "@/shared/components/ui/Button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Download, Trash, CheckSquare } from "lucide-react";
import { useT } from "@/core/i18n";

export function InventoryListPage() {
  const variant = "inventory" as const;
  const t = useT();

  const listStore = useOperationalListStore();
  const {
    searchInput,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    itemTypeFilter,
  } = listStore;

  const tableState = useTableColumnState("inventory-stock-table");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

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
        onViewItem={(id) => setViewingItemId(id)}
        onCloseViewItem={() => setViewingItemId(null)}
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
