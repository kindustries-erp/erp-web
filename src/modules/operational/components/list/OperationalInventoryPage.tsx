import { useMemo, useEffect } from "react";
import { Eye } from "lucide-react";

import { StandardTable } from "@/shared/components/StandardTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { InventoryItemFormDrawer } from "@/modules/inventory-core/components/InventoryItemFormDrawer";
import { InventoryTimelineBlock } from "@/modules/operational/components/list/InventoryTimelineBlock";
import { OperationalTableActions } from "@/modules/operational/components/list/OperationalTableActions";
import { useStockColumns } from "@/modules/operational/components/list/columns/stockColumns";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import type { InventoryStockRow } from "@/modules/operational/api/operationalApi";
import type { InventoryMovementsPayload } from "@/modules/inventory-core/api/inventoryCoreApi";

interface OperationalInventoryPageProps {
  loading: boolean;
  error: string | null;
  stockItems: InventoryStockRow[];
  total: number;
  totalPages: number;
  viewingItemId: string | null;
  creatingItem: boolean;
  movLoadingId: string | null;
  movError: string | null;
  movMap: Record<string, InventoryMovementsPayload>;
  onToggleInventoryExpand: (row: InventoryStockRow) => void;
  onViewItem: (id: string) => void;
  onCloseViewItem: () => void;
  onOpenCreateItem: () => void;
  onCloseCreateItem: () => void;
  onRefetch: () => void;
  setActions?: (node: React.ReactNode) => void;
}

/**
 * Trang tổng hợp tồn kho (variant="inventory").
 * Extracted từ OperationalListPage.tsx (dòng 1698–1841).
 */
export function OperationalInventoryPage({
  loading,
  error,
  stockItems,
  total,
  totalPages,
  viewingItemId,
  creatingItem,
  movLoadingId,
  movError,
  movMap,
  onToggleInventoryExpand,
  onViewItem,
  onCloseViewItem,
  onOpenCreateItem,
  onCloseCreateItem,
  onRefetch,
  setActions,
}: OperationalInventoryPageProps) {
  const t = useT();
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    filterPanelOpen,
    setFilterPanelOpen,
    searchInput,
    setSearchInput,
    itemTypeFilter,
    setItemTypeFilter,
    expandedStockItemIds,
    inventorySort,
    toggleInventorySort,
    resetAllFilters,
  } = useOperationalListStore();

  const activeFilterCount = [!!searchInput, !!itemTypeFilter].filter(
    Boolean,
  ).length;

  const stockColumns = useStockColumns({
    expandedStockItemIds,
    onToggleExpand: onToggleInventoryExpand,
  });

  const expandedStockRowKeys = useMemo(
    () =>
      stockItems
        .filter((row) => expandedStockItemIds[row.inventory_item_id])
        .map((row) => `${row.inventory_item_id}-${row.branch_id || "all"}`),
    [expandedStockItemIds, stockItems],
  );

  console.log("DEBUG INVENTORY EXPAND", {
    expandedStockItemIds,
    expandedStockRowKeys,
    firstItemKey: stockItems[0]
      ? `${stockItems[0].inventory_item_id}-${stockItems[0].branch_id || "all"}`
      : null,
  });

  const itemTypeOptions = useMemo(
    () => [
      { value: "RAW", label: t("inventory.itemTypes.raw") },
      { value: "FG", label: t("inventory.itemTypes.fg") },
      { value: "WIP", label: t("inventory.itemTypes.wip") },
    ],
    [t],
  );

  const inventoryFilterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      custom: [
        {
          key: "itemType",
          label: t("inventory.filter.itemTypeLabel"),
          placeholder: t("inventory.filter.itemTypePlaceholder"),
          options: itemTypeOptions,
        },
      ],
    }),
    [t, itemTypeOptions],
  );

  useEffect(() => {
    if (setActions) {
      setActions(
        <OperationalTableActions
          loading={loading}
          onRefresh={onRefetch}
          onFilterToggle={() => setFilterPanelOpen((v) => !v)}
          activeFilterCount={activeFilterCount}
          onCreate={onOpenCreateItem}
        />,
      );
    }
  }, [setActions, loading, onRefetch, setFilterPanelOpen, activeFilterCount]);

  return (
    <>
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <StandardTable
            tableId="inventory-stock-table"
            enableColumnVisibility={true}
            items={stockItems}
            columns={stockColumns}
            getRowKey={(row) =>
              `${row.inventory_item_id}-${row.branch_id || "all"}`
            }
            loading={loading}
            error={error}
            emptyLabel={t("Chưa có tồn kho.")}
            minWidth={1300}
            onRowClick={(row) => onViewItem(row.inventory_item_id)}
            expandedRowKeys={expandedStockRowKeys}
            renderSubRow={(row) => (
              <InventoryTimelineBlock
                itemId={row.inventory_item_id}
                loadingId={movLoadingId}
                error={movError}
                data={movMap[row.inventory_item_id]}
              />
            )}
            sortArray={inventorySort ? [inventorySort] : undefined}
            onSort={(key) => toggleInventorySort(key)}
            actions={(row) => [
              {
                label: t("inventory.action.details"),
                icon: <Eye size={14} />,
                onClick: () => onViewItem(row.inventory_item_id),
              },
            ]}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
        <FilterPanel
          config={inventoryFilterConfig}
          filter={{
            state: {
              period: "",
              dateFrom: "",
              dateTo: "",
              channel: "",
              search: searchInput,
              amountMin: "",
              amountMax: "",
              status: "",
              counterpartySource: "",
              custom: { itemType: itemTypeFilter },
            },
            inputs: { search: searchInput, amountMin: "", amountMax: "" },
            panelOpen: filterPanelOpen,
            openPanel: () => setFilterPanelOpen(true),
            closePanel: () => setFilterPanelOpen(false),
            togglePanel: () => setFilterPanelOpen((v) => !v),
            setPeriod: () => {},
            setDateFrom: () => {},
            setDateTo: () => {},
            setChannel: () => {},
            setSearchInput: (v: string) => setSearchInput(v),
            setAmountMinInput: () => {},
            setAmountMaxInput: () => {},
            setStatus: () => {},
            setCounterpartySource: () => {},
            setCustom: (key: string, v: string) => {
              if (key === "itemType") {
                setItemTypeFilter(v);
                setPage(1);
              }
            },
            resetAll: resetAllFilters,
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>
      <InventoryItemFormDrawer
        open={!!viewingItemId || creatingItem}
        onClose={() => {
          onCloseViewItem();
          onCloseCreateItem();
        }}
        itemId={viewingItemId}
        onSuccess={onRefetch}
      />
    </>
  );
}
