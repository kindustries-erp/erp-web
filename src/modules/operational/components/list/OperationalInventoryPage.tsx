import { useMemo, useState } from "react";
import { Eye, Network, Package, Plus } from "lucide-react";
import { fmtQty } from "@/shared/utils/format";

import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
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
import { useStockColumns } from "@/modules/operational/components/list/columns/stockColumns";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import type { InventoryStockRow } from "@/modules/operational/api/operationalApi";
import {
  inventoryCoreApi,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
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

  const { data: itemTypesData } = useAppQuery({
    queryKey: ["inventory-item-types", "active"],
    queryFn: () =>
      inventoryCoreApi.listItemTypes({ pageSize: 100, isActive: true }),
  });

  const itemTypeOptions = useMemo(() => {
    const items = itemTypesData?.items || [];
    return items.map((it) => ({
      value: it.code,
      label: it.name,
    }));
  }, [itemTypesData]);

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
      item_name: null,
      on_hand_qty: fmtQty(totalOnHand),
      stock_value: fmtQty(totalStockValue),
    };
  }, [stockItems, t]);

  return (
    <SpreadsheetPageTemplate
      title={t("inventory.tabStock")}
      desc={t("inventory.descStock")}
      icon={<Package className="h-5 w-5" />}
      tableId="inventory-stock-table"
      loading={loading}
      error={error}
      items={stockItems}
      columns={stockColumns}
      getRowKey={(row: InventoryStockRow) =>
        `${row.inventory_item_id}-${row.branch_id || "all"}`
      }
      emptyLabel={t("Chưa có tồn kho.")}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={setPage}
      onPageSize={(size: number) => {
        setPageSize(size);
        setPage(1);
      }}
      onRefresh={onRefetch}
      createActions={[
        {
          groupLabel: t("groupThemMoi", "Thêm mới"),
          items: [
            {
              label: t("common.create", "Tạo mới"),
              icon: <Plus className="w-4 h-4 text-emerald-600" />,
              onClick: onOpenCreateItem,
            },
          ],
        },
      ]}
      bulkActionsNode={bulkActionsNode}
      filterConfig={inventoryFilterConfig}
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
        openPanel: () => setFilterPanelOpen(true),
        closePanel: () => setFilterPanelOpen(false),
        togglePanel: () => setFilterPanelOpen((v) => !v),
        hasActiveFilter: activeFilterCount > 0,
        activeFilterCount,
        panelOpen: filterPanelOpen,
      }}
      enableRowSelection={false}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      expandedRowKeys={expandedStockRowKeys}
      renderSubRow={(row: InventoryStockRow) => (
        <InventoryTimelineBlock
          itemId={row.inventory_item_id}
          loadingId={movLoadingId}
          error={movError}
          data={movMap[row.inventory_item_id]}
        />
      )}
      sortArray={inventorySort ? [inventorySort] : undefined}
      onSort={(key: string) => toggleInventorySort(key)}
      rowActions={(row: InventoryStockRow) => [
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: [
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
          ],
        },
      ]}
      summaryRow={summaryRow}
    >
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
    </SpreadsheetPageTemplate>
  );
}
