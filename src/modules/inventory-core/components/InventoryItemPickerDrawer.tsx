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
  CheckSquare,
  Trash2,
  PackagePlus,
  Info,
  Plus,
  Minus,
  ClipboardList,
  Eye,
  RotateCcw,
  Layers,
  Layers3,
  Box,
  Tags,
  ShieldCheck,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { setPortalTarget } from "@/shared/components/portalStore";
import type { RowSelectionState } from "@tanstack/react-table";

export interface SelectedPickerItem extends ErpInventoryItem {
  qty?: number;
}

export interface InventoryItemPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectItems: (items: SelectedPickerItem[]) => void;
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
    qty?: number;
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Map<string, SelectedPickerItem>
  >(new Map());
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [bulkQty, setBulkQty] = useState<string>("1");

  // Reset/Initialize state on open
  useEffect(() => {
    if (open) {
      const initialMap = new Map<string, SelectedPickerItem>();
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
              qty: item.qty ?? 1,
            } as unknown as SelectedPickerItem);
          }
        });
      }
      setSelectedItemsMap(initialMap);
      setPage(1);
      setShowSelectedOnly(false);
      setBulkQty("1");
      tableState.resetFilters();
    }
  }, [open]);

  // Reset page on column filter/search change
  useEffect(() => {
    setPage(1);
  }, [
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    showSelectedOnly,
  ]);

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
    enabled: open && !showSelectedOnly,
    staleTime: 30_000,
  });

  const rawItems = useMemo(() => data?.items || [], [data]);
  const totalApiItems = data?.total || 0;
  const totalApiPages = data?.totalPages || 1;

  // Auto-fill missing uom, itemType, trackingPolicy for selected items when rawItems loads
  useEffect(() => {
    if (rawItems.length > 0) {
      setSelectedItemsMap((prev) => {
        let changed = false;
        const next = new Map(prev);
        rawItems.forEach((raw) => {
          const selected = next.get(raw.id);
          if (selected) {
            const currentUom =
              typeof selected.uom === "object"
                ? (selected.uom as any)?.name ||
                  (selected.uom as any)?.code ||
                  ""
                : selected.uom || "";
            const rawUom =
              typeof raw.uom === "object"
                ? (raw.uom as any)?.name || (raw.uom as any)?.code || ""
                : raw.uom || "";

            if (rawUom && (!currentUom || currentUom === "—")) {
              next.set(raw.id, {
                ...selected,
                uom: raw.uom,
                itemType: selected.itemType || raw.itemType,
                trackingPolicy: selected.trackingPolicy || raw.trackingPolicy,
              });
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [rawItems]);

  const handleCreatedItemSuccess = (createdItem?: ErpInventoryItem) => {
    if (createdItem && createdItem.id) {
      const itemWithQty: SelectedPickerItem = {
        ...createdItem,
        qty: 1,
      };
      setSelectedItemsMap((prev) => {
        const next = new Map(prev);
        next.set(createdItem.id, itemWithQty);
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
  const mapItemToFlat = (item: SelectedPickerItem | ErpInventoryItem) => {
    const typeCode =
      typeof item.itemType === "object"
        ? (item.itemType as any)?.code || (item.itemType as any)?.name || "PART"
        : item.itemType || "PART";
    const uomName =
      typeof item.uom === "object"
        ? (item.uom as any)?.name || (item.uom as any)?.code || ""
        : item.uom || "";
    const policyCode = (item.trackingPolicy as any)?.code || "NORMAL";

    const typeLabel =
      typeCode === "GOODS" || typeCode === "PRODUCT"
        ? t("Hàng hóa")
        : typeCode === "SERVICE"
          ? t("Dịch vụ")
          : t("Phụ tùng");

    const policyLabel =
      policyCode === "SERIAL"
        ? t("Theo dõi Serial")
        : policyCode === "LOT"
          ? t("Theo dõi Lô (Lot)")
          : t("Không định danh");

    const selectedEntry = selectedItemsMap.get(item.id);
    const itemQty = selectedEntry?.qty ?? (item as any).qty ?? 1;

    return {
      ...item,
      sku: item.sku || "",
      itemName: item.itemName || "",
      qty: itemQty,
      uom: uomName,
      itemType: typeLabel,
      trackingPolicy: policyLabel,
    };
  };

  const flatApiItems = useMemo(() => {
    return rawItems.map(mapItemToFlat);
  }, [rawItems, selectedItemsMap, t]);

  const allSelectedFlatItems = useMemo(() => {
    return Array.from(selectedItemsMap.values()).map(mapItemToFlat);
  }, [selectedItemsMap, t]);

  // Helper lọc đa năng hỗ trợ cả __ALL_MATCHING__ (Chọn tất cả) và __BLANK__
  const matchColumnFilter = (item: any, col: string, filterVals: string[]) => {
    if (!filterVals || filterVals.length === 0) return true;

    // 1. Xử lý cờ __ALL_MATCHING__ khi người dùng click "(Chọn tất cả kết quả tìm kiếm)"
    if (filterVals.includes("__ALL_MATCHING__")) {
      const searchPart = filterVals[1]
        ? String(filterVals[1]).toLowerCase().trim()
        : "";
      if (!searchPart) {
        // Chọn tất cả mà không có từ khóa search -> toàn bộ khớp
        return true;
      }
      const val = String(item[col] ?? "").toLowerCase();
      return val.includes(searchPart);
    }

    const rawVal = item[col];
    const strVal =
      rawVal !== undefined && rawVal !== null ? String(rawVal) : "";

    // 2. Xử lý cờ lọc trống
    if (
      filterVals.includes("__BLANK__") &&
      (!strVal || strVal === "" || strVal === "—")
    ) {
      return true;
    }

    // 3. Khớp giá trị thông thường
    return filterVals.includes(strVal);
  };

  // Apply column filters and column search on selected items
  const filteredSelectedItems = useMemo(() => {
    let result = allSelectedFlatItems;

    for (const [col, filterVals] of Object.entries(tableState.columnFilters)) {
      if (filterVals && filterVals.length > 0) {
        result = result.filter((item: any) =>
          matchColumnFilter(item, col, filterVals),
        );
      }
    }

    for (const [col, searchVal] of Object.entries(tableState.columnSearch)) {
      if (searchVal && searchVal.trim().length > 0) {
        const query = searchVal.trim().toLowerCase();
        result = result.filter((item: any) => {
          const val = String(item[col] ?? "").toLowerCase();
          return val.includes(query);
        });
      }
    }

    if (tableState.sorts.length > 0) {
      const sortKey = tableState.sorts[0];
      const isDesc = sortKey.startsWith("-");
      const cleanKey = isDesc ? sortKey.slice(1) : sortKey;

      result = [...result].sort((a: any, b: any) => {
        if (cleanKey === "qty") {
          const numA = Number(a.qty || 0);
          const numB = Number(b.qty || 0);
          return isDesc ? numB - numA : numA - numB;
        }
        const valA = String(a[cleanKey] ?? "");
        const valB = String(b[cleanKey] ?? "");
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    return result;
  }, [
    allSelectedFlatItems,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
  ]);

  // Items to display in the main table
  const displayItems = useMemo(() => {
    if (showSelectedOnly) {
      const start = (page - 1) * pageSize;
      return filteredSelectedItems.slice(start, start + pageSize);
    }

    let result = flatApiItems;

    for (const [col, filterVals] of Object.entries(tableState.columnFilters)) {
      if (filterVals && filterVals.length > 0) {
        result = result.filter((item: any) =>
          matchColumnFilter(item, col, filterVals),
        );
      }
    }

    for (const [col, searchVal] of Object.entries(tableState.columnSearch)) {
      if (searchVal && searchVal.trim().length > 0) {
        const query = searchVal.trim().toLowerCase();
        result = result.filter((item: any) => {
          const val = String(item[col] ?? "").toLowerCase();
          return val.includes(query);
        });
      }
    }

    if (tableState.sorts.length > 0) {
      const sortKey = tableState.sorts[0];
      const isDesc = sortKey.startsWith("-");
      const cleanKey = isDesc ? sortKey.slice(1) : sortKey;

      result = [...result].sort((a: any, b: any) => {
        if (cleanKey === "qty") {
          const numA = Number(a.qty || 0);
          const numB = Number(b.qty || 0);
          return isDesc ? numB - numA : numA - numB;
        }
        const valA = String(a[cleanKey] ?? "");
        const valB = String(b[cleanKey] ?? "");
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    return result;
  }, [
    showSelectedOnly,
    filteredSelectedItems,
    flatApiItems,
    page,
    pageSize,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
  ]);

  const activeTotal = showSelectedOnly
    ? filteredSelectedItems.length
    : totalApiItems;
  const activeTotalPages = showSelectedOnly
    ? Math.max(1, Math.ceil(filteredSelectedItems.length / pageSize))
    : totalApiPages;

  // ---------------------------------------------------------------------------
  // Sync TanStack rowSelection with persistent selectedItemsMap
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const currentSelection: Record<string, boolean> = {};
    displayItems.forEach((item) => {
      if (selectedItemsMap.has(item.id)) {
        currentSelection[item.id] = true;
      }
    });
    setRowSelection(currentSelection);
  }, [displayItems, selectedItemsMap]);

  const handleRowSelectionChange = (updater: any) => {
    setRowSelection((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      setSelectedItemsMap((prevMap) => {
        const nextMap = new Map(prevMap);
        displayItems.forEach((item) => {
          if (next[item.id]) {
            if (!nextMap.has(item.id)) {
              nextMap.set(item.id, {
                ...(item as unknown as SelectedPickerItem),
                qty: (item as any).qty ?? 1,
              });
            }
          } else {
            nextMap.delete(item.id);
          }
        });
        return nextMap;
      });

      return next;
    });
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    setSelectedItemsMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        next.set(id, {
          ...existing,
          qty: Math.max(0.01, Number(newQty) || 1),
        });
      }
      return next;
    });
  };

  const handleApplyBulkQty = () => {
    const val = parseFloat(bulkQty);
    if (isNaN(val) || val <= 0) return;
    setSelectedItemsMap((prev) => {
      const next = new Map(prev);
      next.forEach((item, id) => {
        next.set(id, {
          ...item,
          qty: val,
        });
      });
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

  const headerFilterItems = showSelectedOnly
    ? allSelectedFlatItems
    : flatApiItems;

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: listHookLike,
        items: headerFilterItems,
      }),
    [listHookLike, headerFilterItems],
  );

  // ---------------------------------------------------------------------------
  // Columns Definition
  // ---------------------------------------------------------------------------
  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      // 1. Cột STT: Chuẩn 40px, căn giữa tuyệt đối, DataTable đã tự truyền 1-based index (idx)
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
      // 2. Cột Mã linh kiện
      {
        key: "sku",
        header: headerFilter("sku", t("Mã linh kiện (SKU)"), {
          enableSelectAllMatching: false,
        }),
        size: 150,
        enableResizing: true,
        headerClassName: "w-[150px] min-w-[130px]",
        className: "w-[150px] min-w-[130px] font-mono text-xs font-semibold",
        cell: (item: any) => (
          <TableText
            text={item.sku}
            enableCopy={true}
            textClassName="font-mono text-xs font-semibold text-foreground"
          />
        ),
      },
      // 3. Cột Tên linh kiện
      {
        key: "itemName",
        header: headerFilter("itemName", t("Tên linh kiện / Mặt hàng"), {
          enableSelectAllMatching: false,
        }),
        size: 260,
        enableResizing: true,
        headerClassName: "w-[260px] min-w-[200px]",
        className: "w-[260px] min-w-[200px]",
        cell: (item: any) => {
          const selectedItem = selectedItemsMap.get(item.id);
          const isSelected = Boolean(selectedItem);
          const isAlreadyInPo = existingItemIds.includes(item.id);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {item.itemName}
              </span>
              {isSelected ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-muted text-foreground border-border shrink-0 font-medium"
                >
                  {t("Đã chọn")}
                  {selectedItem?.qty && selectedItem.qty > 1
                    ? ` (x${selectedItem.qty})`
                    : ""}
                </Badge>
              ) : isAlreadyInPo ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 bg-muted/50 text-muted-foreground border-border/70 shrink-0"
                >
                  {t("Đã có")}
                </Badge>
              ) : null}
            </div>
          );
        },
      },
      // 4. Cột SL ĐẶT (EDIT TRỰC TIẾP NGAY TRÊN TABLE)
      {
        key: "qty",
        header: headerFilter.qty("qty", t("SL đặt")),
        size: 130,
        enableResizing: true,
        headerClassName: "w-[130px] min-w-[110px] text-center",
        className: "w-[130px] min-w-[110px] text-center p-1",
        cell: (item: any) => {
          const selectedItem = selectedItemsMap.get(item.id);
          const isSelected = Boolean(selectedItem);
          const currentQty = selectedItem?.qty ?? "";

          return (
            <div
              className="flex items-center justify-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={!isSelected || Number(currentQty) <= 1}
                onClick={() => {
                  const next = Math.max(
                    1,
                    Math.round(Number(currentQty || 1) - 1),
                  );
                  handleUpdateQty(item.id, next);
                }}
                className={cn(
                  "h-6 w-6 inline-flex items-center justify-center rounded border border-border text-muted-foreground transition-colors",
                  isSelected
                    ? "hover:bg-muted hover:text-foreground cursor-pointer"
                    : "opacity-30 cursor-not-allowed",
                )}
                title={t("Giảm")}
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={0.01}
                step="any"
                placeholder="1"
                value={isSelected ? currentQty : ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    if (!isSelected) {
                      // Tự động tick chọn khi nhập số lượng
                      setSelectedItemsMap((prev) => {
                        const next = new Map(prev);
                        next.set(item.id, {
                          ...(item as unknown as SelectedPickerItem),
                          qty: val,
                        });
                        return next;
                      });
                    } else {
                      handleUpdateQty(item.id, val);
                    }
                  } else if (e.target.value === "" && isSelected) {
                    handleUpdateQty(item.id, 1);
                  }
                }}
                className={cn(
                  "w-14 h-6 text-center text-xs font-bold rounded border outline-none transition-all tabular-nums",
                  isSelected
                    ? "border-foreground/30 bg-muted/40 text-foreground font-semibold focus:ring-1 focus:ring-foreground/20"
                    : "border-border bg-background text-muted-foreground hover:border-border-hover focus:border-foreground/40 focus:bg-background focus:text-foreground",
                )}
              />
              <button
                type="button"
                onClick={() => {
                  if (!isSelected) {
                    setSelectedItemsMap((prev) => {
                      const next = new Map(prev);
                      next.set(item.id, {
                        ...(item as unknown as SelectedPickerItem),
                        qty: 1,
                      });
                      return next;
                    });
                  } else {
                    handleUpdateQty(item.id, (Number(currentQty) || 1) + 1);
                  }
                }}
                className="h-6 w-6 inline-flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                title={t("Tăng")}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          );
        },
      },
      // 5. Cột ĐVT
      {
        key: "uom",
        header: headerFilter("uom", t("ĐVT"), {
          enableSelectAllMatching: false,
        }),
        size: 80,
        enableResizing: true,
        headerClassName: "w-[80px] min-w-[70px] text-center",
        className:
          "w-[80px] min-w-[70px] text-center text-xs text-muted-foreground",
        cell: (item: any) => item.uom || "—",
      },
      // 6. Cột Loại hàng
      {
        key: "itemType",
        header: headerFilter("itemType", t("Loại hàng"), {
          enableSelectAllMatching: false,
        }),
        size: 110,
        enableResizing: true,
        headerClassName: "w-[110px] min-w-[100px] text-center",
        className: "w-[110px] min-w-[100px] text-center",
        cell: (item: any) => (
          <Badge
            variant="secondary"
            className="text-[10px] font-medium px-2 py-0.5 bg-muted text-foreground border-border/50"
          >
            {item.itemType || t("Phụ tùng")}
          </Badge>
        ),
      },
      // 7. Cột Quy cách theo dõi
      {
        key: "trackingPolicy",
        header: headerFilter("trackingPolicy", t("Quy cách theo dõi"), {
          enableSelectAllMatching: false,
        }),
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
  // Calculations for Right Panel & Subtotal Row
  // ---------------------------------------------------------------------------
  const selectedItemsList = useMemo(
    () => Array.from(selectedItemsMap.values()),
    [selectedItemsMap],
  );

  const selectedCount = selectedItemsList.length;

  const totalSelectedQty = useMemo(() => {
    return selectedItemsList.reduce(
      (sum, item) => sum + Number(item.qty || 1),
      0,
    );
  }, [selectedItemsList]);

  const totalEstimatedAmount = useMemo(() => {
    return selectedItemsList.reduce((sum, item) => {
      const price = Number((item as any).costPrice || 0);
      const qty = Number(item.qty || 1);
      return sum + qty * price;
    }, 0);
  }, [selectedItemsList]);

  // ---------------------------------------------------------------------------
  // Grouped Breakdowns for Right Panel Overview (ĐVT, Loại hàng, Quy cách)
  // ---------------------------------------------------------------------------
  const uomBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { uom: string; skuCount: number; totalQty: number }
    >();
    selectedItemsList.forEach((item) => {
      let uomName = "";
      if (typeof item.uom === "object" && item.uom) {
        uomName = (item.uom as any)?.name || (item.uom as any)?.code || "";
      } else if (typeof (item as any).uom === "string") {
        uomName = String((item as any).uom).trim();
      }

      // Tra cứu dự phòng từ rawItems nếu uom chưa có
      if (!uomName || uomName === "—") {
        const found = rawItems.find((r) => r.id === item.id);
        if (found) {
          uomName =
            typeof found.uom === "object"
              ? (found.uom as any)?.name || (found.uom as any)?.code || ""
              : found.uom || "";
        }
      }

      if (!uomName || uomName === "—") {
        uomName = t("Chưa phân loại");
      }

      const existing = map.get(uomName) || {
        uom: uomName,
        skuCount: 0,
        totalQty: 0,
      };
      existing.skuCount += 1;
      existing.totalQty += Number(item.qty || 1);
      map.set(uomName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [selectedItemsList, rawItems, t]);

  const itemTypeBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { typeName: string; skuCount: number; totalQty: number }
    >();
    selectedItemsList.forEach((item) => {
      let typeCode =
        typeof item.itemType === "object"
          ? (item.itemType as any)?.code || (item.itemType as any)?.name || ""
          : item.itemType || "";

      if (!typeCode) {
        const found = rawItems.find((r) => r.id === item.id);
        if (found) {
          typeCode =
            typeof found.itemType === "object"
              ? (found.itemType as any)?.code ||
                (found.itemType as any)?.name ||
                "PART"
              : found.itemType || "PART";
        }
      }

      const label =
        typeCode === "GOODS" || typeCode === "PRODUCT"
          ? t("Hàng hóa")
          : typeCode === "SERVICE"
            ? t("Dịch vụ")
            : t("Phụ tùng");
      const existing = map.get(label) || {
        typeName: label,
        skuCount: 0,
        totalQty: 0,
      };
      existing.skuCount += 1;
      existing.totalQty += Number(item.qty || 1);
      map.set(label, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [selectedItemsList, rawItems, t]);

  const trackingPolicyBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { policyName: string; skuCount: number; totalQty: number }
    >();
    selectedItemsList.forEach((item) => {
      let policyCode =
        (item.trackingPolicy as any)?.code ||
        (item as any).trackingPolicy ||
        "";

      if (!policyCode) {
        const found = rawItems.find((r) => r.id === item.id);
        if (found) {
          policyCode =
            (found.trackingPolicy as any)?.code ||
            (found as any).trackingPolicy ||
            "NORMAL";
        }
      }

      const label =
        policyCode === "SERIAL" || policyCode === "Theo dõi Serial"
          ? t("Theo dõi Serial")
          : policyCode === "LOT" || policyCode === "Theo dõi Lô (Lot)"
            ? t("Theo dõi Lô (Lot)")
            : t("Không định danh");
      const existing = map.get(label) || {
        policyName: label,
        skuCount: 0,
        totalQty: 0,
      };
      existing.skuCount += 1;
      existing.totalQty += Number(item.qty || 1);
      map.set(label, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [selectedItemsList, rawItems, t]);

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
            ? `${t("Xác nhận")} (${selectedCount} ${t("mặt hàng")} • ${totalSelectedQty} ${t("SL")})`
            : t("Xác nhận"),
        primary: true,
        onClick: handleConfirm,
      },
    ],
    [selectedCount, totalSelectedQty, t, onClose, handleConfirm],
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
          "Tra cứu danh mục linh kiện, chọn nhiều mặt hàng và điều chỉnh số lượng dự kiến đặt mua.",
        )}
        icon={<PackagePlus className="w-5 h-5 text-foreground" />}
        actions={actions}
        rightPanelTitle={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-foreground" />
              <span className="font-semibold text-foreground">
                {t("Dự kiến đặt hàng")}
              </span>
            </div>
            {selectedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive shrink-0"
                title={t("Bỏ chọn tất cả các linh kiện")}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {t("Bỏ hết")}
              </Button>
            )}
          </div>
        }
        rightPanel={
          <div className="flex flex-col h-full space-y-3">
            {selectedCount > 0 ? (
              <>
                {/* Gom nhóm tổng quan (Neutral Cards) */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[calc(100vh-280px)]">
                  {/* Nhóm theo ĐVT */}
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {t("Theo Đơn vị tính (ĐVT)")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 bg-muted/40 text-muted-foreground"
                      >
                        {uomBreakdown.length} {t("ĐVT")}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {uomBreakdown.map((item) => (
                        <div
                          key={item.uom}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/20 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span className="font-semibold">{item.uom}</span>
                            <span className="text-[11px] text-muted-foreground">
                              ({item.skuCount} {t("mặt hàng")})
                            </span>
                          </div>
                          <span className="font-bold tabular-nums text-foreground">
                            {item.totalQty.toLocaleString("vi-VN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm theo Loại hàng */}
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Tags className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {t("Theo Loại hàng")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 bg-muted/40 text-muted-foreground"
                      >
                        {itemTypeBreakdown.length} {t("nhóm")}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {itemTypeBreakdown.map((item) => (
                        <div
                          key={item.typeName}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/20 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span>{item.typeName}</span>
                            <span className="text-[11px] text-muted-foreground">
                              ({item.skuCount} {t("mặt hàng")})
                            </span>
                          </div>
                          <span className="font-bold tabular-nums text-foreground">
                            {item.totalQty.toLocaleString("vi-VN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm theo Quy cách theo dõi */}
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {t("Theo Quy cách theo dõi")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 bg-muted/40 text-muted-foreground"
                      >
                        {trackingPolicyBreakdown.length} {t("quy cách")}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {trackingPolicyBreakdown.map((item) => (
                        <div
                          key={item.policyName}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/20 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span>{item.policyName}</span>
                            <span className="text-[11px] text-muted-foreground">
                              ({item.skuCount} {t("mặt hàng")})
                            </span>
                          </div>
                          <span className="font-bold tabular-nums text-foreground">
                            {item.totalQty.toLocaleString("vi-VN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Bottom stats: Enhanced Order KPI Stat Cards */}
                <div className="p-3 rounded-xl border border-border/90 bg-muted/40 space-y-2.5 shadow-2xs">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Box 1: Số mặt hàng */}
                    <div className="p-2.5 rounded-lg bg-background border border-border/70 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Layers3 className="w-3.5 h-3.5 text-foreground/70" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {t("Mặt hàng")}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tabular-nums text-foreground tracking-tight">
                          {selectedCount}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {t("mã")}
                        </span>
                      </div>
                    </div>

                    {/* Box 2: Tổng số lượng */}
                    <div className="p-2.5 rounded-lg bg-background border border-border/70 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Box className="w-3.5 h-3.5 text-foreground/70" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {t("Tổng SL đặt")}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tabular-nums text-foreground tracking-tight">
                          {totalSelectedQty.toLocaleString("vi-VN")}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {t("SL")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dòng tạm tính (nếu có giá) */}
                  {totalEstimatedAmount > 0 && (
                    <div className="flex items-center justify-between pt-1 px-1 border-t border-dashed border-border/70 text-xs">
                      <span className="text-muted-foreground font-medium">
                        {t("Tạm tính dự kiến")}:
                      </span>
                      <span className="font-bold tabular-nums text-foreground text-sm">
                        {totalEstimatedAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  )}
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
                <p className="text-[11px] leading-relaxed max-w-[210px]">
                  {t(
                    "Tích chọn checkbox ở bảng bên trái hoặc nhập số lượng trực tiếp để thêm linh kiện cần đặt mua.",
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
                <span>
                  {showSelectedOnly
                    ? t("Linh kiện đã chọn")
                    : t("Danh mục linh kiện")}
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  ({activeTotal.toLocaleString("vi-VN")} {t("mặt hàng")})
                </span>
                {showSelectedOnly && (
                  <Badge
                    variant="outline"
                    className="bg-muted text-foreground border-border text-[10px] font-medium"
                  >
                    {t("Đang lọc")}
                  </Badge>
                )}
              </div>
            }
            titleExtra={
              <div className="flex items-center gap-2">
                {/* Nút lọc nhanh linh kiện đã chọn (Neutral Style) */}
                <Button
                  variant={showSelectedOnly ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowSelectedOnly((prev) => !prev);
                    setPage(1);
                  }}
                  className={cn(
                    "h-7 px-2.5 text-xs font-medium transition-all",
                    showSelectedOnly
                      ? "bg-foreground text-background font-semibold hover:bg-foreground/90"
                      : "text-foreground border-border hover:bg-muted",
                  )}
                  title={
                    showSelectedOnly
                      ? t(
                          "Đang xem linh kiện đã chọn. Bấm để xem toàn bộ danh mục",
                        )
                      : t("Lọc hiển thị những linh kiện đã chọn")
                  }
                >
                  {showSelectedOnly ? (
                    <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  ) : (
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  )}
                  <span>
                    {showSelectedOnly ? t("Xem tất cả") : t("Lọc đã chọn")}
                  </span>
                  {selectedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-1.5 px-1.5 py-0 h-4 text-[10px] font-bold rounded-full",
                        showSelectedOnly
                          ? "bg-background text-foreground"
                          : "bg-muted text-foreground border border-border/50",
                      )}
                    >
                      {selectedCount}
                    </Badge>
                  )}
                </Button>

                {!showSelectedOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateItemOpen(true)}
                    className="h-7 px-2.5 text-xs font-medium text-foreground border-border hover:bg-muted transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t("Tạo mới mặt hàng")}
                  </Button>
                )}

                {/* Đặt SL hàng loạt ngay trên toolbar bảng danh mục linh kiện */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-border bg-muted/30 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {t("Đặt SL hàng loạt")}:
                  </span>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    value={bulkQty}
                    onChange={(e) => setBulkQty(e.target.value)}
                    placeholder="1"
                    className="w-12 h-6 text-center text-xs font-bold rounded border border-border bg-background focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none tabular-nums text-foreground"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyBulkQty}
                    disabled={
                      selectedCount === 0 || !bulkQty || Number(bulkQty) <= 0
                    }
                    className="h-6 px-2 text-xs font-medium border-border text-foreground hover:bg-muted"
                  >
                    {t("Áp dụng")}
                  </Button>
                </div>

                {tableState.activeFilterCount > 0 && (
                  <FilterButton
                    activeCount={tableState.activeFilterCount}
                    className="h-7 text-xs"
                    onClear={() => {
                      tableState.resetFilters();
                      setPage(1);
                    }}
                  />
                )}

                {/* Portal Target cho ColumnToggle (Settings2) và FullscreenToggle từ DataTable */}
                <div
                  ref={(el) =>
                    setPortalTarget("inventory-item-picker-drawer-table", el)
                  }
                  className="empty:hidden flex items-center justify-center"
                />
              </div>
            }
            collapsible
            defaultCollapsed={false}
          >
            {showSelectedOnly && (
              <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-md bg-muted/40 border border-border text-xs text-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-foreground" />
                  <span>
                    {t("Đang hiển thị")}{" "}
                    <strong className="font-semibold">{activeTotal}</strong>{" "}
                    {t("linh kiện đã chọn trong đơn.")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSelectedOnly(false)}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {t("Quay lại toàn bộ danh mục")}
                </Button>
              </div>
            )}

            <DataTable
              tableId="inventory-item-picker-drawer-table"
              tableMeta={{
                listHook: listHookLike,
                items: headerFilterItems,
              }}
              columns={columns as any}
              items={displayItems}
              loading={!showSelectedOnly && isLoading}
              variant="spreadsheet"
              enableRowSelection={true}
              rowSelection={rowSelection}
              onRowSelectionChange={handleRowSelectionChange}
              getRowKey={(item) => item.id}
              emptyLabel={
                showSelectedOnly
                  ? t("Chưa có linh kiện nào được chọn")
                  : t("Không tìm thấy linh kiện nào phù hợp")
              }
              containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
              total={activeTotal}
              page={page}
              pageSize={pageSize}
              totalPages={activeTotalPages}
              onPage={setPage}
              onPageSize={(newSize: number) => {
                setPageSize(newSize);
                setPage(1);
              }}
              summaryRow={{
                itemName: (
                  <div className="text-right w-full font-semibold text-xs text-muted-foreground">
                    {t("Tổng SL đặt")}:
                  </div>
                ),
                qty: (
                  <div className="text-center font-bold text-xs tabular-nums text-foreground">
                    {totalSelectedQty.toLocaleString("vi-VN")}
                  </div>
                ),
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
