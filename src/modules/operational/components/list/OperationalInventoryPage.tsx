import { useMemo, useEffect, useState } from "react";
import { Eye, Network } from "lucide-react";
import { fmtQty } from "@/shared/utils/format";

import { StandardTable } from "@/shared/components/StandardTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { InventoryItemFormDrawer } from "@/modules/inventory-core/components/InventoryItemFormDrawer";
import { ConnectionGraphDrawer } from "@/modules/purchase-orders-core/components/ConnectionGraphDrawer";
import { useInventoryGraph } from "@/modules/inventory-core/hooks/useInventoryGraph";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { useProductionOrderDrawer } from "@/modules/production-core/hooks/useProductionOrderDrawer";
import { ProductionOrderDrawer } from "@/modules/production-core/components/ProductionOrderDrawer";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { InventoryTimelineBlock } from "@/modules/operational/components/list/InventoryTimelineBlock";
import { OperationalTableActions } from "@/modules/operational/components/list/OperationalTableActions";
import { useStockColumns } from "@/modules/operational/components/list/columns/stockColumns";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import type { InventoryStockRow } from "@/modules/operational/api/operationalApi";
import type { InventoryMovementsPayload } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { Updater } from "@tanstack/react-table";

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
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (updater: Updater<Record<string, boolean>>) => void;
  bulkActionsNode?: React.ReactNode;
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
  rowSelection,
  onRowSelectionChange,
  bulkActionsNode,
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

  const [graphOpen, setGraphOpen] = useState(false);
  const [graphItemId, setGraphItemId] = useState<string | null>(null);
  const inventoryGraph = useInventoryGraph();

  const employee = useAuthStore((s) => s.employee);
  const isGraphAdmin = employee?.email === "admin@liouni.com";

  const grDrawer = useGrDrawer({});
  const giDrawer = useGiDrawer({});

  const [poOpen, setPoOpen] = useState(false);
  const [editingPo, setEditingPo] = useState<ErpProductionOrder | null>(null);
  const [viewOnlyPo, setViewOnlyPo] = useState(false);

  const poDrawer = useProductionOrderDrawer({
    open: poOpen,
    editing: editingPo,
    onClose: () => setPoOpen(false),
    onSaved: () => {},
  });

  const openPoDetail = async (id: string) => {
    try {
      const detail = await productionCoreApi.get(id);
      setEditingPo(detail);
      setViewOnlyPo(true);
      setPoOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

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

  const summaryRow = useMemo(() => {
    const totalOnHand = stockItems.reduce(
      (acc, curr) => acc + Number(curr.on_hand_qty || 0),
      0,
    );
    const totalStockValue = stockItems.reduce(
      (acc, curr) => acc + Number(curr.stock_value || 0),
      0,
    );
    return {
      item_name: (
        <span className="text-muted-foreground">
          {t("Tổng (trang hiện tại)")}
        </span>
      ),
      on_hand_qty: fmtQty(totalOnHand),
      stock_value: fmtQty(totalStockValue),
    };
  }, [stockItems, t]);

  useEffect(() => {
    if (setActions) {
      setActions(
        <OperationalTableActions
          loading={loading}
          onRefresh={onRefetch}
          onFilterToggle={() => setFilterPanelOpen((v) => !v)}
          activeFilterCount={activeFilterCount}
          onCreate={onOpenCreateItem}
          bulkActionsNode={bulkActionsNode}
          portalId="inventory-stock-table"
        />,
      );
    }
  }, [
    setActions,
    loading,
    onRefetch,
    setFilterPanelOpen,
    activeFilterCount,
    bulkActionsNode,
  ]);

  return (
    <>
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex items-start flex-1 min-h-0">
        <div className="flex-1 min-w-0 space-y-4 flex flex-col h-full">
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
            enableColumnResizing={true}
            enableRowSelection={true}
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
            variant="spreadsheet"
            expandedRowKeys={expandedStockRowKeys}
            summaryRow={summaryRow}
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
              ...(isGraphAdmin
                ? [
                    {
                      label: t("Đồ thị liên kết"),
                      icon: <Network size={14} />,
                      onClick: () => {
                        setGraphItemId(row.inventory_item_id);
                        setGraphOpen(true);
                        void inventoryGraph.loadGraph(row.inventory_item_id);
                      },
                    },
                  ]
                : []),
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
      <ConnectionGraphDrawer
        open={graphOpen}
        onClose={() => {
          setGraphOpen(false);
          setGraphItemId(null);
          inventoryGraph.reset();
        }}
        title="Đồ thị liên kết Kho"
        subtitle={
          graphItemId
            ? `Vật tư: ${stockItems.find((i) => i.inventory_item_id === graphItemId)?.item_name || graphItemId}`
            : undefined
        }
        loading={inventoryGraph.loading}
        error={inventoryGraph.error}
        initialNodes={inventoryGraph.nodes}
        initialEdges={inventoryGraph.edges}
        layout={inventoryGraph.layout}
        toggleLayout={inventoryGraph.toggleLayout}
        onNodeClick={(node) => {
          if (!node.docId) return;
          if (node.nodeType === "inventory_item") {
            onViewItem(node.docId);
          } else if (node.nodeType === "goods_receipt") {
            void grDrawer.openDetail(node.docId, true);
          } else if (node.nodeType === "goods_issue") {
            void giDrawer.openDetail(node.docId, true);
          } else if (node.nodeType === "production_order") {
            void openPoDetail(node.docId);
          }
        }}
      />
      <GrFormDrawer drawer={grDrawer} />
      <GiFormDrawer drawer={giDrawer} />
      <ProductionOrderDrawer
        open={poOpen}
        editing={editingPo}
        viewOnly={viewOnlyPo}
        onClose={() => setPoOpen(false)}
        onSaved={() => {}}
        drawerState={poDrawer}
      />
    </>
  );
}
