import { useMemo } from "react";
import { FileText } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable } from "@/shared/components/DataTable";
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
  config: { title: string; desc: string; cta?: string };
  loading: boolean;
  error: string | null;
  stockItems: InventoryStockRow[];
  total: number;
  totalPages: number;
  viewingItemId: string | null;
  movLoadingId: string | null;
  movError: string | null;
  movMap: Record<string, InventoryMovementsPayload>;
  onToggleInventoryExpand: (row: InventoryStockRow) => void;
  onViewItem: (id: string) => void;
  onCloseViewItem: () => void;
  onRefetch: () => void;
}

const ITEM_TYPE_OPTIONS = [
  { value: "RAW", label: "RAW — Linh kiện" },
  { value: "FG", label: "FG — Thành phẩm" },
  { value: "WIP", label: "WIP — Bán thành phẩm" },
];

/**
 * Trang tổng hợp tồn kho (variant="inventory").
 * Extracted từ OperationalListPage.tsx (dòng 1698–1841).
 */
export function OperationalInventoryPage({
  config,
  loading,
  error,
  stockItems,
  total,
  totalPages,
  viewingItemId,
  movLoadingId,
  movError,
  movMap,
  onToggleInventoryExpand,
  onViewItem,
  onCloseViewItem,
  onRefetch,
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

  const inventoryFilterConfig: FilterPanelConfig = {
    search: true,
    custom: [
      {
        key: "itemType",
        label: "Loại item",
        placeholder: "Tất cả loại item",
        options: ITEM_TYPE_OPTIONS,
      },
    ],
  };

  return (
    <PageLayout
      title={config.title}
      desc={config.desc}
      icon={<FileText className="h-4 w-4" />}
      actions={
        <OperationalTableActions
          loading={loading}
          onRefresh={onRefetch}
          onFilterToggle={() => setFilterPanelOpen((v) => !v)}
          activeFilterCount={activeFilterCount}
        />
      }
    >
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <DataTable
            items={stockItems}
            columns={stockColumns}
            getRowKey={(row) =>
              `${row.inventory_item_id}-${row.branch_id || "all"}`
            }
            loading={loading}
            error={error}
            emptyLabel={t("Chưa có tồn kho.")}
            minWidth={760}
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
        open={!!viewingItemId}
        onClose={onCloseViewItem}
        itemId={viewingItemId}
        onSuccess={onRefetch}
      />
    </PageLayout>
  );
}
