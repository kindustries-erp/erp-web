import { useMemo, useState, useEffect } from "react";
import { Eye, Network, Package, Power, PowerOff, Download } from "lucide-react";
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
import { useIaDrawer } from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { IaFormDrawer } from "@/modules/inventory-adjustments/components/IaFormDrawer";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useAuthStore } from "@/modules/auth/domain/authStore";

import { useStockColumns } from "@/modules/operational/components/list/columns/stockColumns";
import { useOperationalListStore } from "@/modules/operational/hooks/useOperationalListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  type InventoryStockRow,
  operationalApi,
} from "@/modules/operational/api/operationalApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import { useUIStore } from "@/core/config/uiStore";
import type { Updater } from "@tanstack/react-table";

interface OperationalInventoryPageProps {
  loading: boolean;
  error: string | null;
  stockItems: InventoryStockRow[];
  total: number;
  totalPages: number;
  viewingItemId: string | null;
  creatingItem: boolean;
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
    resetAllFilters,
  } = useOperationalListStore();

  const tableState = useTableColumnState("inventory-stock-table");

  const [graphOpen, setGraphOpen] = useState(false);
  const [graphItemId, setGraphItemId] = useState<string | null>(null);
  const inventoryGraph = useInventoryGraph();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("erp_preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.tables?.["inventory-stock-table"]) {
          delete parsed.tables["inventory-stock-table"];
          localStorage.setItem("erp_preferences", JSON.stringify(parsed));
          window.location.reload();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  const activeFilterCount = [!!searchInput, !!itemTypeFilter].filter(
    Boolean,
  ).length;

  const stockColumns = useStockColumns({
    stockItems,
    onViewItem,
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
      search: false,
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
        togglePanel: () => setFilterPanelOpen((v: boolean) => !v),
        hasActiveFilter: activeFilterCount > 0,
        activeFilterCount,
        panelOpen: filterPanelOpen,
      }}
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
        {
          groupLabel: t("Thao tác"),
          items: [
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
          onCloseViewItem();
          onCloseCreateItem();
        }}
        itemId={viewingItemId}
        viewOnly={!!viewingItemId}
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
    </SpreadsheetPageTemplate>
  );
}
