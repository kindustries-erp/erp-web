import React, { useState, useMemo, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import {
  DataTable,
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { FilterButton } from "@/shared/components/FilterPanel";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { InventoryItemFormDrawer } from "@/modules/inventory-core/components/InventoryItemFormDrawer";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Package,
  CheckSquare,
  X,
  Trash2,
  PackagePlus,
  Info,
  Plus,
} from "lucide-react";
import { useT } from "@/core/i18n";
import type { RowSelectionState } from "@tanstack/react-table";

export interface InventoryItemPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectItems: (items: ErpInventoryItem[]) => void;
  /** Danh sách ID linh kiện đã có trên đơn để hiển thị đánh dấu */
  existingItemIds?: string[];
  /** Danh sách linh kiện đã chọn sẵn từ form (để pre-populate selection) */
  preSelectedItems?: Array<{
    id: string;
    sku?: string;
    itemName?: string;
    itemType?: any;
    uom?: any;
    costPrice?: number;
  }>;
  zIndex?: number;
}

export function InventoryItemPickerDrawer({
  open,
  onClose,
  onSelectItems,
  existingItemIds = [],
  preSelectedItems = [],
  zIndex = 600,
}: InventoryItemPickerDrawerProps) {
  const t = useT();
  const queryClient = useQueryClient();
  const tableState = useTableColumnState("inventory-item-picker-drawer-table");

  // ---------------------------------------------------------------------------
  // Filters & Selection State
  // ---------------------------------------------------------------------------
  const [selectedPanelSearch, setSelectedPanelSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Map<string, ErpInventoryItem>
  >(new Map());
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [createItemOpen, setCreateItemOpen] = useState(false);

  // Reset/Initialize state on open
  useEffect(() => {
    if (open) {
      const initialMap = new Map<string, ErpInventoryItem>();
      if (preSelectedItems && preSelectedItems.length > 0) {
        preSelectedItems.forEach((item) => {
          if (item.id) {
            initialMap.set(item.id, {
              id: item.id,
              sku: item.sku || "",
              itemName: item.itemName || "",
              itemType: item.itemType || "PART",
              uom: item.uom || "",
              costPrice: item.costPrice,
            } as unknown as ErpInventoryItem);
          }
        });
      }
      setSelectedItemsMap(initialMap);
      setSelectedPanelSearch("");
      setPage(1);
      tableState.resetFilters();
    }
  }, [open]);

  // Reset page on column filter/search change
  useEffect(() => {
    setPage(1);
  }, [tableState.columnSearch, tableState.columnFilters, tableState.sorts]);

  // ---------------------------------------------------------------------------
  // Query Items from API
  // ---------------------------------------------------------------------------
  const activeSearch =
    tableState.columnSearch.sku?.trim() ||
    tableState.columnSearch.itemName?.trim() ||
    undefined;

  const { data, isLoading } = useQuery({
    queryKey: [
      "inventory-picker-items",
      {
        page,
        pageSize,
        search: activeSearch,
        columnFilters: tableState.columnFilters,
        sorts: tableState.sorts,
      },
    ],
    queryFn: async () => {
      return inventoryCoreApi.list({
        page,
        pageSize,
        search: activeSearch,
      });
    },
    enabled: open,
    staleTime: 30_000,
  });

  const rawItems = useMemo(() => data?.items || [], [data]);
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleCreatedItemSuccess = (createdItem?: ErpInventoryItem) => {
    if (createdItem && createdItem.id) {
      setSelectedItemsMap((prev) => {
        const next = new Map(prev);
        next.set(createdItem.id, createdItem);
        return next;
      });
      setRowSelection((prev) => ({
        ...prev,
        [createdItem.id]: true,
      }));
    }
    void queryClient.invalidateQueries({
      queryKey: ["inventory-picker-items"],
    });
  };

  // ---------------------------------------------------------------------------
  // Flatten items for column header filter & client-side filtering
  // ---------------------------------------------------------------------------
  const flatItems = useMemo(() => {
    return rawItems.map((item) => {
      const typeCode =
        typeof item.itemType === "object"
          ? item.itemType?.code || item.itemType?.name || "PART"
          : item.itemType || "PART";
      const uomName = item.uom?.name || item.uom?.code || "";
      const policyCode = item.trackingPolicy?.code || "NORMAL";

      const typeLabel =
        typeCode === "GOODS" || typeCode === "PRODUCT"
          ? "Hàng hóa"
          : typeCode === "SERVICE"
            ? "Dịch vụ"
            : "Phụ tùng";

      const policyLabel =
        policyCode === "SERIAL"
          ? "Theo dõi Serial"
          : policyCode === "LOT"
            ? "Theo dõi Lô (Lot)"
            : "Không định danh";

      return {
        ...item,
        sku: item.sku || "",
        itemName: item.itemName || "",
        uom: uomName,
        itemType: typeLabel,
        trackingPolicy: policyLabel,
      };
    });
  }, [rawItems]);

  // Apply column filters and column search on current page items
  const displayItems = useMemo(() => {
    let result = flatItems;

    // Filter by column filters
    for (const [col, filterVals] of Object.entries(tableState.columnFilters)) {
      if (filterVals && filterVals.length > 0) {
        result = result.filter((item: any) => {
          const val = String(item[col] ?? "");
          return filterVals.includes(val);
        });
      }
    }

    // Filter by column search
    for (const [col, searchVal] of Object.entries(tableState.columnSearch)) {
      if (searchVal && searchVal.trim().length > 0) {
        const query = searchVal.trim().toLowerCase();
        result = result.filter((item: any) => {
          const val = String(item[col] ?? "").toLowerCase();
          return val.includes(query);
        });
      }
    }

    // Sort by column sorts
    if (tableState.sorts.length > 0) {
      const sortKey = tableState.sorts[0];
      const isDesc = sortKey.startsWith("-");
      const cleanKey = isDesc ? sortKey.slice(1) : sortKey;

      result = [...result].sort((a: any, b: any) => {
        const valA = String(a[cleanKey] ?? "");
        const valB = String(b[cleanKey] ?? "");
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    return result;
  }, [
    flatItems,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
  ]);

  // ---------------------------------------------------------------------------
  // Sync TanStack rowSelection with persistent selectedItemsMap
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const currentSelection: Record<string, boolean> = {};
    rawItems.forEach((item) => {
      if (selectedItemsMap.has(item.id)) {
        currentSelection[item.id] = true;
      }
    });
    setRowSelection(currentSelection);
  }, [rawItems, selectedItemsMap]);

  const handleRowSelectionChange = (updater: any) => {
    setRowSelection((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      setSelectedItemsMap((prevMap) => {
        const nextMap = new Map(prevMap);
        rawItems.forEach((item) => {
          if (next[item.id]) {
            nextMap.set(item.id, item);
          } else {
            nextMap.delete(item.id);
          }
        });
        return nextMap;
      });

      return next;
    });
  };

  const handleRemoveSelectedItem = (id: string) => {
    setSelectedItemsMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedItemsMap(new Map());
    setRowSelection({});
  };

  const handleConfirm = () => {
    const selectedList = Array.from(selectedItemsMap.values());
    onSelectItems(selectedList);
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Table Column Header Filter Setup
  // ---------------------------------------------------------------------------
  const listHookLike = useMemo(
    () => ({
      sorts: tableState.sorts,
      setSort: (key: string, state: "asc" | "desc" | "none") => {
        tableState.setSort(key, state);
      },
      columnFilters: tableState.columnFilters,
      setColumnFilter: (key: string, vals: string[]) => {
        tableState.setColumnFilter(key, vals);
      },
      columnSearch: tableState.columnSearch,
      setColumnSearch: (key: string, val: string) => {
        tableState.setColumnSearch(key, val);
      },
    }),
    [tableState],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: listHookLike,
        items: flatItems,
      }),
    [listHookLike, flatItems],
  );

  // ---------------------------------------------------------------------------
  // Columns Definition
  // ---------------------------------------------------------------------------
  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        hideable: false,
        sortable: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "sku",
        header: headerFilter("sku", t("Mã linh kiện (SKU)")),
        size: 150,
        enableResizing: true,
        headerClassName: "w-[150px] min-w-[130px]",
        className: "w-[150px] min-w-[130px] font-mono text-xs font-semibold",
        cell: (item: any) => (
          <TableText
            text={item.sku}
            enableCopy={true}
            textClassName="font-mono text-xs font-semibold text-primary"
          />
        ),
      },
      {
        key: "itemName",
        header: headerFilter("itemName", t("Tên linh kiện / Mặt hàng")),
        size: 260,
        enableResizing: true,
        headerClassName: "w-[260px] min-w-[200px]",
        className: "w-[260px] min-w-[200px]",
        cell: (item: any) => {
          const isSelected = selectedItemsMap.has(item.id);
          const isAlreadyInPo = existingItemIds.includes(item.id);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {item.itemName}
              </span>
              {isSelected ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 font-medium"
                >
                  {t("Đã chọn")}
                </Badge>
              ) : isAlreadyInPo ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200 shrink-0"
                >
                  {t("Đã có")}
                </Badge>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "uom",
        header: headerFilter("uom", t("ĐVT")),
        size: 80,
        enableResizing: true,
        headerClassName: "w-[80px] min-w-[70px] text-center",
        className:
          "w-[80px] min-w-[70px] text-center text-xs text-muted-foreground",
        cell: (item: any) => item.uom || "—",
      },
      {
        key: "itemType",
        header: headerFilter("itemType", t("Loại hàng")),
        size: 110,
        enableResizing: true,
        headerClassName: "w-[110px] min-w-[100px] text-center",
        className: "w-[110px] min-w-[100px] text-center",
        cell: (item: any) => (
          <Badge
            variant="secondary"
            className="text-[10px] font-medium px-2 py-0.5"
          >
            {item.itemType || "Phụ tùng"}
          </Badge>
        ),
      },
      {
        key: "trackingPolicy",
        header: headerFilter("trackingPolicy", t("Quy cách theo dõi")),
        size: 140,
        enableResizing: true,
        headerClassName: "w-[140px] min-w-[120px] text-center",
        className: "w-[140px] min-w-[120px] text-center",
        cell: (item: any) => (
          <span className="text-xs text-muted-foreground">
            {item.trackingPolicy}
          </span>
        ),
      },
    ],
    [headerFilter, selectedItemsMap, existingItemIds, t],
  );

  // ---------------------------------------------------------------------------
  // Filter selected items for Right Panel
  // ---------------------------------------------------------------------------
  const selectedItemsList = useMemo(
    () => Array.from(selectedItemsMap.values()),
    [selectedItemsMap],
  );

  const filteredSelectedList = useMemo(() => {
    if (!selectedPanelSearch.trim()) return selectedItemsList;
    const q = selectedPanelSearch.toLowerCase().trim();
    return selectedItemsList.filter(
      (i) =>
        i.sku.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q),
    );
  }, [selectedItemsList, selectedPanelSearch]);

  const selectedCount = selectedItemsList.length;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const actions: DrawerAction[] = useMemo(
    () => [
      {
        label: t("Hủy"),
        variant: "outline",
        onClick: onClose,
      },
      {
        label:
          selectedCount > 0
            ? `${t("Xác nhận")} (${selectedCount})`
            : t("Xác nhận"),
        primary: true,
        onClick: handleConfirm,
      },
    ],
    [selectedCount, t, onClose, handleConfirm],
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        layout="2-columns"
        size="xl"
        enableFullscreen={true}
        collapsibleRightPanel={true}
        rightPanelDefaultCollapsed={false}
        stickyRightPanel={true}
        zIndex={zIndex}
        onClose={onClose}
        title={t("Chọn linh kiện từ danh mục kho")}
        subtitle={t(
          "Tra cứu danh mục linh kiện, chọn nhiều mặt hàng để thêm hàng loạt vào đơn mua hàng.",
        )}
        icon={<PackagePlus className="w-5 h-5 text-primary" />}
        actions={actions}
        rightPanelTitle={
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              {t("Linh kiện đã chọn")}
            </span>
            <Badge
              variant={selectedCount > 0 ? "default" : "secondary"}
              className="px-1.5 py-0 h-5 text-xs font-semibold"
            >
              {selectedCount}
            </Badge>
          </div>
        }
        rightPanel={
          <div className="flex flex-col h-full space-y-3">
            {selectedCount > 0 ? (
              <>
                {/* Header inside right panel */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/60">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={selectedPanelSearch}
                      onChange={(e) => setSelectedPanelSearch(e.target.value)}
                      placeholder={t("Lọc trong danh sách chọn...")}
                      className="w-full h-8 pl-8 pr-7 text-xs rounded-md border border-border bg-background hover:border-border-hover focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                    {selectedPanelSearch && (
                      <button
                        type="button"
                        onClick={() => setSelectedPanelSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t("Bỏ hết")}
                  </Button>
                </div>

                {/* Scrollable list of selected items */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[calc(100vh-320px)]">
                  {filteredSelectedList.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex items-start justify-between gap-2 p-2.5 rounded-lg border border-border/70 bg-card hover:border-primary/40 hover:shadow-2xs transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {item.sku}
                          </span>
                          {item.uom && (
                            <span className="text-[10px] text-muted-foreground px-1 bg-muted rounded">
                              {typeof item.uom === "object"
                                ? item.uom.name || item.uom.code
                                : item.uom}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground font-medium line-clamp-2">
                          {item.itemName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSelectedItem(item.id)}
                        className="h-6 w-6 p-0 opacity-40 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all shrink-0"
                        title={t("Bỏ chọn")}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Bottom stats */}
                <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex justify-between items-center">
                  <span>{t("Tổng cộng")}:</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {selectedCount} {t("mặt hàng")}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
                  <Info className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  {t("Chưa có linh kiện nào được chọn")}
                </p>
                <p className="text-[11px] leading-relaxed max-w-[200px]">
                  {t(
                    "Tích chọn checkbox ở bảng bên trái để thêm các mặt hàng cần đặt mua.",
                  )}
                </p>
              </div>
            )}
          </div>
        }
        leftPanel={
          <DrawerSection
            title={
              <div className="flex items-center gap-2">
                <span>{t("Danh mục linh kiện")}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  ({totalItems.toLocaleString("vi-VN")} {t("mặt hàng")})
                </span>
              </div>
            }
            titleExtra={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateItemOpen(true)}
                  className="h-7 px-2.5 text-xs font-medium text-primary border-primary/40 hover:bg-primary/5 hover:border-primary transition-all"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t("Tạo mới mặt hàng")}
                </Button>
                {tableState.activeFilterCount > 0 && (
                  <FilterButton
                    activeCount={tableState.activeFilterCount}
                    onClick={() => {}}
                    className="h-7 py-1 text-xs"
                    onClear={tableState.resetFilters}
                  />
                )}
                {selectedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>
                      {t("Đã chọn")}: {selectedCount}
                    </span>
                  </div>
                )}
              </div>
            }
            collapsible
            defaultCollapsed={false}
          >
            <DataTable
              tableId="inventory-item-picker-drawer-table"
              tableMeta={{ listHook: listHookLike, items: flatItems }}
              columns={columns as any}
              items={displayItems}
              loading={isLoading}
              variant="spreadsheet"
              enableRowSelection={true}
              rowSelection={rowSelection}
              onRowSelectionChange={handleRowSelectionChange}
              getRowKey={(item) => item.id}
              emptyLabel={t("Không tìm thấy linh kiện nào phù hợp")}
              containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
              total={totalItems}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onPage={setPage}
              onPageSize={(newSize: number) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </DrawerSection>
        }
      />
      <InventoryItemFormDrawer
        open={createItemOpen}
        onClose={() => setCreateItemOpen(false)}
        itemId={null}
        onSuccess={handleCreatedItemSuccess}
        zIndex={(zIndex || 600) + 100}
      />
    </>
  );
}
