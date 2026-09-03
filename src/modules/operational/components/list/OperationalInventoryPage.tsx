import { useMemo, useState, useCallback } from "react";
import {
  Eye,
  Pencil,
  Network,
  Package,
  Power,
  PowerOff,
  Download,
} from "lucide-react";
import { fmtQty } from "@/shared/utils/format";

import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { InventoryItemFormDrawer } from "@/modules/inventory-core/components/InventoryItemFormDrawer";
import { ConnectionGraphDrawer } from "@/modules/purchase-orders-core/components/ConnectionGraphDrawer";
import { useInventoryGraph } from "@/modules/inventory-core/hooks/useInventoryGraph";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { useProductionOrderDrawer } from "@/modules/production-core/hooks/useProductionOrderDrawer";
import { ProductionOrderDrawer } from "@/modules/production-core/components/ProductionOrderDrawer";
import { useIaDrawer } from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { IaFormDrawer } from "@/modules/inventory-adjustments/components/IaFormDrawer";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useAuthStore } from "@/modules/auth/domain/authStore";

import { useStockColumns } from "@/modules/operational/components/list/columns/stockColumns";
import {
  useOperationalListStore,
  type OperationalStockTab,
} from "@/modules/operational/hooks/useOperationalListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useT } from "@/core/i18n";
import {
  type InventoryStockRow,
  operationalApi,
} from "@/modules/operational/api/operationalApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";
import type { Updater } from "@tanstack/react-table";
import { InventoryStockViewModeCombobox } from "@/modules/operational/components/list/InventoryStockViewModeCombobox";
import { InventoryStockViewConfigDrawer } from "@/modules/operational/components/list/InventoryStockViewConfigDrawer";
import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

interface OperationalInventoryPageProps {
  loading: boolean;
  error: string | null;
  stockItems: InventoryStockRow[];
  total: number;
  totalPages: number;
  viewingItemId: string | null;
  creatingItem: boolean;
  isEditMode?: boolean;
  setIsEditMode?: (edit: boolean) => void;
  onViewItem: (id: string) => void;
  onCloseViewItem: () => void;
  onOpenCreateItem: () => void;
  onCloseCreateItem: () => void;
  onRefetch: () => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (updater: Updater<Record<string, boolean>>) => void;
  bulkActionsNode?: React.ReactNode;
  activeColumnPresetKey?: string;
  columnViewPresets?: TableViewPreset[];
  onSelectViewPreset?: (preset: TableViewPreset) => void;
  onOpenCreateView?: () => void;
  onOpenEditView?: (preset: TableViewPreset) => void;
  onDeleteViewPreset?: (key: string) => void;
  viewConfigDrawerOpen?: boolean;
  onCloseViewConfigDrawer?: () => void;
  editingViewPreset?: TableViewPreset | null;
  onSaveViewPreset?: (data: {
    key?: string;
    label: string;
    columnVisibility: Record<string, boolean>;
  }) => void;
  onResetDefaultViewPreset?: (key: string) => void;
  currentColumnVisibility?: Record<string, boolean>;
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
  isEditMode: controlledEditMode,
  setIsEditMode: controlledSetIsEditMode,
  onViewItem,
  onCloseViewItem,
  onOpenCreateItem,
  onCloseCreateItem,
  onRefetch,
  rowSelection,
  onRowSelectionChange,
  bulkActionsNode,
  activeColumnPresetKey,
  columnViewPresets = [],
  onSelectViewPreset,
  onOpenCreateView,
  onOpenEditView,
  onDeleteViewPreset,
  viewConfigDrawerOpen = false,
  onCloseViewConfigDrawer,
  editingViewPreset,
  onSaveViewPreset,
  onResetDefaultViewPreset,
  currentColumnVisibility,
}: OperationalInventoryPageProps) {
  const t = useT();
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    searchInput,
    itemTypeFilter,
    stockTab,
    setStockTab,
    resetAllFilters,
  } = useOperationalListStore();

  const tableState = useTableColumnState("inventory-stock-table");

  const [internalEditMode, setInternalEditMode] = useState(false);
  const isEditMode =
    controlledEditMode !== undefined ? controlledEditMode : internalEditMode;
  const setIsEditMode = controlledSetIsEditMode || setInternalEditMode;

  const [graphOpen, setGraphOpen] = useState(false);
  const [graphItemId, setGraphItemId] = useState<string | null>(null);
  const inventoryGraph = useInventoryGraph();

  const showToast = useUIStore((s) => s.showToast);

  const employee = useAuthStore((s) => s.employee);
  const isGraphAdmin = employee?.email === "admin@liouni.com";

  const grDrawer = useGrDrawer({});
  const giDrawer = useGiDrawer({});
  const iaDrawer = useIaDrawer({});

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

  const handleExportExcel = async () => {
    try {
      showToast({ title: "Đang tạo file Excel...", variant: "default" });
      const blob = await operationalApi.exportInventoryStock({
        search: searchInput || undefined,
        stock_tab: stockTab === "ALL" ? undefined : stockTab,
        item_type: itemTypeFilter || undefined,
        sort: tableState.sorts.length > 0 ? tableState.sorts : undefined,
        column_search: tableState.columnSearch,
        column_filters: tableState.columnFilters,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
      const hhmmss = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      a.download = `Bao_cao_xuat_nhap_kho_${yyyymmdd}_${hhmmss}.xlsx`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast({ title: "Xuất Excel thành công", variant: "default" });
    } catch {
      showToast({ title: "Không thể xuất Excel", variant: "destructive" });
    }
  };

  const handleClearAllFilters = useCallback(() => {
    resetAllFilters();
    tableState.resetFilters();
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const stockTabParam = url.searchParams.get(ErpUrlQueryParam.STOCK_TAB);
      const newParams = new URLSearchParams();
      if (stockTabParam && stockTabParam !== "ALL") {
        newParams.set(ErpUrlQueryParam.STOCK_TAB, stockTabParam);
      }
      const newRelativePath = `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
      window.history.replaceState(null, "", newRelativePath);
      useAppStore
        .getState()
        .updateCurrentTabUrl("erp-inventory-stock", newRelativePath);
    }
  }, [resetAllFilters, tableState, setPage]);

  const handleStockTabChange = useCallback(
    (nextTab: OperationalStockTab) => {
      setStockTab(nextTab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (nextTab && nextTab !== "ALL") {
          url.searchParams.set(ErpUrlQueryParam.STOCK_TAB, nextTab);
        } else {
          url.searchParams.delete(ErpUrlQueryParam.STOCK_TAB);
        }
        window.history.replaceState(null, "", url.toString());
      }
    },
    [setStockTab],
  );

  const customActionsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs<OperationalStockTab>
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-3 text-xs rounded-full"
        items={[
          { value: "ALL", label: t("common.all", "Tất cả") },
          {
            value: "IN_STOCK",
            label: t("inventory.stockInStock", "Còn tồn kho"),
          },
          {
            value: "OUT_OF_STOCK",
            label: t("inventory.stockOutOfStock", "Hết hàng"),
          },
          {
            value: "NEGATIVE",
            label: t("inventory.stockNegative", "Tồn âm"),
          },
        ]}
        value={stockTab}
        onValueChange={handleStockTabChange}
        hideBorder
      />

      {onSelectViewPreset &&
        onOpenCreateView &&
        onOpenEditView &&
        onDeleteViewPreset && (
          <>
            <div className="hidden sm:block h-4 w-px bg-slate-300/80 dark:bg-slate-700/80 shrink-0" />
            <InventoryStockViewModeCombobox
              presets={columnViewPresets}
              activePresetKey={activeColumnPresetKey || "overview"}
              onSelect={onSelectViewPreset}
              onCreateView={onOpenCreateView}
              onEditView={onOpenEditView}
              onDeleteView={onDeleteViewPreset}
            />
          </>
        )}
    </div>
  );

  const stockColumns = useStockColumns({
    stockItems,
    onViewItem,
  });

  const summaryRow = useMemo(() => {
    const totalOnHand = stockItems.reduce(
      (acc, curr) => acc + Number(curr.on_hand_qty || 0),
      0,
    );
    const totalIn = stockItems.reduce(
      (acc, curr) => acc + Number(curr.received_qty || 0),
      0,
    );
    const totalOut = stockItems.reduce(
      (acc, curr) => acc + Number(curr.issued_qty || 0),
      0,
    );
    const totalReserved = stockItems.reduce(
      (acc, curr) => acc + Number(curr.reserved_qty || 0),
      0,
    );
    const totalStockValue = stockItems.reduce(
      (acc, curr) => acc + Number(curr.stock_value || 0),
      0,
    );
    return {
      item_name: null,
      on_hand_qty: fmtQty(totalOnHand),
      received_qty: fmtQty(totalIn),
      issued_qty: fmtQty(totalOut),
      reserved_qty: fmtQty(totalReserved),
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
      getRowClassName={(item: InventoryStockRow) => {
        const s = (item.status || "").toUpperCase();
        if (
          s === "INACTIVE" ||
          s === "CANCELLED" ||
          s === "CANCELED" ||
          s === "VOID" ||
          s.includes("HỦY")
        ) {
          return "opacity-40 text-muted-foreground";
        }
        return undefined;
      }}
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
      onCreate={onOpenCreateItem}
      createLabel={t("common.create", "Tạo mới")}
      createActions={[
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: [
            {
              label: t("inventory.exportExcel", "Xuất Excel Bảng kê"),
              icon: <Download className="w-4 h-4 text-emerald-600" />,
              onClick: handleExportExcel,
            },
          ],
        },
      ]}
      customActionsNode={customActionsNode}
      bulkActionsNode={bulkActionsNode}
      activeFilterCount={tableState.activeFilterCount || 0}
      onClearAllFilters={handleClearAllFilters}
      enableRowSelection={false}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      sortArray={tableState.sorts.length > 0 ? tableState.sorts : undefined}
      onSort={(key: string) => {
        tableState.toggleSort(key);
        useOperationalListStore.getState().setPage(1);
      }}
      rowActions={(row: InventoryStockRow) => [
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: [
            {
              label: t("inventory.action.details", "Xem chi tiết"),
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: () => {
                setIsEditMode(false);
                onViewItem(row.inventory_item_id);
              },
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
        {
          groupLabel: t("groupThaoTac", "Thao tác"),
          items: [
            {
              label: t("inventory.action.edit", "Chỉnh sửa"),
              icon: <Pencil className="h-3.5 w-3.5" />,
              onClick: () => {
                setIsEditMode(true);
                onViewItem(row.inventory_item_id);
              },
            },
            ...(row.status === "ACTIVE"
              ? [
                  {
                    label: t("Ngừng hoạt động"),
                    icon: <PowerOff size={14} className="text-red-500" />,
                    variant: "danger" as const,
                    onClick: async () => {
                      try {
                        await inventoryCoreApi.update(row.inventory_item_id, {
                          status: "INACTIVE",
                        });
                        showToast({
                          title: `Đã ngừng hoạt động ${row.item_code}`,
                          variant: "success",
                        });
                        onRefetch();
                      } catch (e: any) {
                        showToast({
                          title:
                            e?.response?.data?.message ||
                            e?.message ||
                            "Lỗi thao tác",
                          variant: "destructive",
                        });
                      }
                    },
                  },
                ]
              : row.status === "INACTIVE"
                ? [
                    {
                      label: t("Kích hoạt"),
                      icon: <Power size={14} className="text-emerald-500" />,
                      onClick: async () => {
                        try {
                          await inventoryCoreApi.update(row.inventory_item_id, {
                            status: "ACTIVE",
                          });
                          showToast({
                            title: `Đã kích hoạt ${row.item_code}`,
                            variant: "success",
                          });
                          onRefetch();
                        } catch (e: any) {
                          showToast({
                            title:
                              e?.response?.data?.message ||
                              e?.message ||
                              "Lỗi thao tác",
                            variant: "destructive",
                          });
                        }
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
          setIsEditMode(false);
          onCloseViewItem();
          onCloseCreateItem();
        }}
        itemId={viewingItemId}
        viewOnly={!creatingItem && !isEditMode}
        onSuccess={onRefetch}
        onOpenDocument={(docId, docType) => {
          if (docType === "GOODS_RECEIPT") {
            void grDrawer.openDetail(docId, true);
          } else if (docType === "GOODS_ISSUE") {
            void giDrawer.openDetail(docId, true);
          } else if (docType === "INVENTORY_ADJUSTMENT") {
            void iaDrawer.openDetail(docId, true);
          } else if (docType === "PRODUCTION_ORDER") {
            void openPoDetail(docId);
          }
        }}
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
      <IaFormDrawer drawer={iaDrawer} />
      <ProductionOrderDrawer
        open={poOpen}
        editing={editingPo}
        viewOnly={viewOnlyPo}
        onClose={() => setPoOpen(false)}
        onSaved={() => {}}
        drawerState={poDrawer}
      />

      {onCloseViewConfigDrawer && onSaveViewPreset && (
        <InventoryStockViewConfigDrawer
          open={viewConfigDrawerOpen}
          onClose={onCloseViewConfigDrawer}
          preset={editingViewPreset}
          currentColumnVisibility={currentColumnVisibility}
          onSave={onSaveViewPreset}
          onResetDefault={onResetDefaultViewPreset}
        />
      )}
    </SpreadsheetPageTemplate>
  );
}
