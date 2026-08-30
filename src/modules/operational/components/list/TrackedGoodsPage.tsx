import { useState, useMemo, useEffect, useCallback, useRef } from "react";

import { useInventorySerialsQuery } from "@/modules/inventory-core/hooks/useInventorySerialsQuery";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  inventoryCoreApi,
  type InventorySerialRow,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatGMT7 } from "@/shared/utils/format";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Barcode, Eye, Pencil, FileText, PackageMinus } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { TabItem } from "@/shared/components/PageLayout";
import { TrackedGoodsDrawer } from "./TrackedGoodsDrawer";
import { SoPreviewDrawer } from "@/modules/sales-orders-core/components/SoPreviewDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";

export interface TrackedGoodsPageProps {
  fixedTrackingPolicy?: string;
  title?: string;
  desc?: string;
  initialTab?: string;
}

export function TrackedGoodsPage({
  fixedTrackingPolicy,
  title,
  desc,
  initialTab,
}: TrackedGoodsPageProps = {}) {
  const t = useT();

  const pageTabs: TabItem[] = useMemo(
    () => [
      {
        value: "vehicle",
        label: t("inventoryTracking.tabVehicle", "Xe / Thành phẩm"),
      },
      {
        value: "parts",
        label: t("inventoryTracking.tabParts", "Phụ tùng / Serial"),
      },
      {
        value: "lot",
        label: t("inventoryTracking.tabLot", "Lô (Lot)"),
      },
      {
        value: "custom",
        label: t("inventoryTracking.tabCustom", "Tùy chỉnh (Custom)"),
      },
    ],
    [t],
  );

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (initialTab) return initialTab;
    if (fixedTrackingPolicy) {
      const p = fixedTrackingPolicy.toLowerCase();
      if (p === "serial") return "parts";
      return p;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        ["vehicle", "parts", "lot", "custom"].includes(tabParam)
      ) {
        return tabParam;
      }
    }
    return "vehicle";
  });

  const activeTrackingPolicy = useMemo(() => {
    if (fixedTrackingPolicy) return fixedTrackingPolicy;
    switch (currentTab) {
      case "vehicle":
        return "VEHICLE";
      case "parts":
        return "SERIAL";
      case "lot":
        return "LOT";
      case "custom":
        return "CUSTOM";
      default:
        return "VEHICLE";
    }
  }, [fixedTrackingPolicy, currentTab]);

  const tableId = useMemo(() => {
    if (fixedTrackingPolicy) {
      return `inventory-tracked-goods-${fixedTrackingPolicy.toLowerCase()}-table`;
    }
    return `inventory-tracked-goods-${currentTab}-table`;
  }, [fixedTrackingPolicy, currentTab]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [trackingPolicyFilter, setTrackingPolicyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [missingSerialFilter, setMissingSerialFilter] = useState(false);
  const [sortField] = useState("-created_at");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventorySerialRow | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [previewSoNo, setPreviewSoNo] = useState<string | null>(null);
  const giDrawer = useGiDrawer();

  const tableState = useTableColumnState(tableId);

  const tabStatesRef = useRef<
    Record<
      string,
      {
        page: number;
        pageSize: number;
        search: string;
        searchInput: string;
        itemTypeFilter: string;
        trackingPolicyFilter: string;
        statusFilter: string;
        missingSerialFilter: boolean;
      }
    >
  >({});

  const handleTabChange = useCallback(
    (nextTab: string) => {
      // 1. Lưu lại state của tab hiện tại
      tabStatesRef.current[currentTab] = {
        page,
        pageSize,
        search,
        searchInput,
        itemTypeFilter,
        trackingPolicyFilter,
        statusFilter,
        missingSerialFilter,
      };

      // 2. Phục hồi state của tab tiếp theo (hoặc khởi tạo mặc định)
      const nextState = tabStatesRef.current[nextTab] || {
        page: 1,
        pageSize: 50,
        search: "",
        searchInput: "",
        itemTypeFilter: "",
        trackingPolicyFilter: "",
        statusFilter: "",
        missingSerialFilter: false,
      };

      setCurrentTab(nextTab);
      setPage(nextState.page);
      setPageSize(nextState.pageSize);
      setSearch(nextState.search);
      setSearchInput(nextState.searchInput);
      setItemTypeFilter(nextState.itemTypeFilter);
      setTrackingPolicyFilter(nextState.trackingPolicyFilter);
      setStatusFilter(nextState.statusFilter);
      setMissingSerialFilter(nextState.missingSerialFilter);

      // KHÔNG gọi tableState.resetFilters() -> Giữ nguyên column filters, column searches, column sorts riêng cho mỗi tableId
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (nextTab === "vehicle") {
          url.searchParams.delete("tab");
        } else {
          url.searchParams.set("tab", nextTab);
        }
        window.history.replaceState(null, "", url.toString());
      }
    },
    [
      currentTab,
      page,
      pageSize,
      search,
      searchInput,
      itemTypeFilter,
      trackingPolicyFilter,
      statusFilter,
      missingSerialFilter,
    ],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query = useInventorySerialsQuery({
    page,
    pageSize,
    search: search || undefined,
    itemType: itemTypeFilter || undefined,
    trackingPolicy: activeTrackingPolicy || trackingPolicyFilter || undefined,
    status: statusFilter || undefined,
    missingSerial: missingSerialFilter || undefined,
    sort:
      tableState.sorts.length > 0
        ? tableState.sorts
        : sortField
          ? [sortField]
          : undefined,
    column_search: JSON.stringify(tableState.columnSearch),
    column_filters: JSON.stringify(tableState.columnFilters),
  });

  useEffect(() => {
    const handleRefresh = () => {
      query.refetch();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);
    return () => window.removeEventListener("refresh_erp_data", handleRefresh);
  }, [query]);

  const loading = query.isLoading || query.isFetching;
  const error = query.error
    ? extractApiError(query.error, "Lỗi tải dữ liệu")
    : null;
  const items = query.data?.items || [];
  const total = query.data?.total || 0;
  const totalPages = query.data?.totalPages || 0;

  const activeFilterCount = useMemo(() => {
    let count = [
      !!search,
      !!itemTypeFilter,
      !!trackingPolicyFilter,
      !!statusFilter,
      missingSerialFilter,
    ].filter(Boolean).length;

    const activeCols = new Set<string>();
    if (tableState.columnFilters) {
      Object.entries(tableState.columnFilters).forEach(([col, f]) => {
        if (f && f.length > 0) activeCols.add(col);
      });
    }
    if (tableState.columnSearch) {
      Object.entries(tableState.columnSearch).forEach(([col, s]) => {
        if (s && String(s).trim().length > 0) activeCols.add(col);
      });
    }
    count += Math.max(activeCols.size, tableState.activeFilterCount || 0);

    return count;
  }, [
    search,
    itemTypeFilter,
    trackingPolicyFilter,
    statusFilter,
    missingSerialFilter,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.activeFilterCount,
  ]);

  const fetchSerialOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await inventoryCoreApi.getSerialColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr ? JSON.parse(filtersStr) : undefined,
        activeTrackingPolicy,
      );
      return {
        items: res.items.map((i: any) => ({
          label: String(i),
          value: String(i),
        })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [activeTrackingPolicy],
  );

  const getSortState = (key: string) => {
    if (tableState.sorts.includes(key)) return "asc";
    if (tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    tableState.setSort(key, state);
    setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    tableState.setColumnSearch(key, val);
    setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    tableState.setColumnFilter(key, vals);
    setPage(1);
  };

  const columns: DataTableColumn<InventorySerialRow>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        hideable: false,
        sortable: false,
        headerClassName: "text-center",
        className: "text-center font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "createdAt",
        header: (
          <TableColumnHeaderFilter
            title={t("Ngày nhập")}
            sortState={getSortState("createdAt")}
            onSortChange={(state) => handleSortChange("createdAt", state)}
            searchValue={tableState.columnSearch["createdAt"] || ""}
            onSearchChange={(val) => handleSearchChange("createdAt", val)}
            selectedFilters={tableState.columnFilters["createdAt"] || []}
            onFilterChange={(vals) => handleFilterChange("createdAt", vals)}
            align="center"
            columnKey="createdAt"
            hideFilter={true}
            hideFooter={true}
            isActive={!!tableState.columnSearch["createdAt"]}
            dateRangeSlot={({ close }) => {
              const val = tableState.columnSearch["createdAt"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    tableState.setColumnSearch("createdAt", next);
                    setPage(1);
                  }}
                  onClose={close}
                />
              );
            }}
          />
        ),
        size: 140,
        className: "align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => {
          const dateTime = formatGMT7(row.createdAt, "datetime");
          const [datePart = "", timePart = ""] = dateTime.split(" ");

          return (
            <Tooltip content={formatGMT7(row.createdAt, "datetime-sec")}>
              <div className="cursor-help inline-flex flex-row items-baseline gap-1.5 whitespace-nowrap leading-tight">
                <span className="text-sm text-gray-900">{datePart}</span>
                <span className="text-xs text-gray-500">{timePart}</span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "itemCode",
        header: (
          <TableColumnHeaderFilter
            title={t("Mã VT")}
            sortState={getSortState("itemCode")}
            onSortChange={(state) => handleSortChange("itemCode", state)}
            searchValue={tableState.columnSearch["itemCode"] || ""}
            onSearchChange={(val) => handleSearchChange("itemCode", val)}
            selectedFilters={tableState.columnFilters["itemCode"] || []}
            onFilterChange={(vals) => handleFilterChange("itemCode", vals)}
            align="center"
            columnKey="itemCode"
            queryKeyPrefix={`inventory-serial-options-${currentTab}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 150,
        className: "align-middle text-left",
        headerClassName: "text-center",
        cell: (row) => (
          <TableText
            text={row.item?.sku || "—"}
            enableCopy
            onDrawerClick={() => {
              setSelectedItem(row);
              setDrawerOpen(true);
            }}
          />
        ),
      },
      {
        key: "itemName",
        header: (
          <TableColumnHeaderFilter
            title={t("Tên VT")}
            sortState={getSortState("itemName")}
            onSortChange={(state) => handleSortChange("itemName", state)}
            searchValue={tableState.columnSearch["itemName"] || ""}
            onSearchChange={(val) => handleSearchChange("itemName", val)}
            selectedFilters={tableState.columnFilters["itemName"] || []}
            onFilterChange={(vals) => handleFilterChange("itemName", vals)}
            align="center"
            columnKey="itemName"
            queryKeyPrefix={`inventory-serial-options-${currentTab}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 200,
        className: "align-middle text-left",
        headerClassName: "text-center",
        cell: (row) => {
          const name = row.item?.itemName || "—";
          return (
            <Tooltip content={name} side="top">
              <div className="truncate w-full">{name}</div>
            </Tooltip>
          );
        },
      },
      // Cột Số Lô (Lot): Chỉ hiển thị trên tab 'lot'
      ...(currentTab === "lot"
        ? [
            {
              key: "lotNo",
              header: (
                <TableColumnHeaderFilter
                  title={t("inventoryTrackingLot.lotCode", "Số Lô (Lot)")}
                  sortState={getSortState("lotNo")}
                  onSortChange={(state: any) =>
                    handleSortChange("lotNo", state)
                  }
                  searchValue={tableState.columnSearch["lotNo"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("lotNo", val)
                  }
                  selectedFilters={tableState.columnFilters["lotNo"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("lotNo", vals)
                  }
                  align="center"
                  columnKey="lotNo"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 160,
              className: "align-middle text-left font-medium text-gray-800",
              headerClassName: "text-center",
              cell: (row: any) => (
                <TableText
                  text={row.lotNo || "—"}
                  enableCopy={!!row.lotNo}
                  tooltip={!!row.lotNo}
                  onDetailClick={() => {
                    setSelectedItem(row);
                    setDrawerOpen(true);
                  }}
                />
              ),
            },
          ]
        : []),
      // Cột Số Seri: Hiển thị trên vehicle, parts, custom
      ...(currentTab !== "lot"
        ? [
            {
              key: "serialNo",
              header: (
                <TableColumnHeaderFilter
                  title={
                    currentTab === "custom"
                      ? t("inventoryTracking.barcode", "Mã Barcode / QR")
                      : currentTab === "vehicle"
                        ? t(
                            "inventoryTracking.serialVehicle",
                            "Số Seri xe (COC)",
                          )
                        : t("Số Seri")
                  }
                  sortState={getSortState("serialNo")}
                  onSortChange={(state: any) =>
                    handleSortChange("serialNo", state)
                  }
                  searchValue={tableState.columnSearch["serialNo"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("serialNo", val)
                  }
                  selectedFilters={tableState.columnFilters["serialNo"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("serialNo", vals)
                  }
                  align="center"
                  columnKey="serialNo"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 200,
              className: "align-middle text-left text-gray-800",
              headerClassName: "text-center",
              cell: (row: any) => (
                <TableText
                  text={row.serialNo || "—"}
                  enableCopy
                  tooltip={true}
                  onDetailClick={() => {
                    setSelectedItem(row);
                    setDrawerOpen(true);
                  }}
                />
              ),
            },
          ]
        : []),
      // Cột Số VIN & Số máy: Chỉ hiển thị trên tab 'vehicle'
      ...(currentTab === "vehicle"
        ? [
            {
              key: "vinNo",
              header: (
                <TableColumnHeaderFilter
                  title={t("Số VIN")}
                  sortState={getSortState("vinNo")}
                  onSortChange={(state: any) =>
                    handleSortChange("vinNo", state)
                  }
                  searchValue={tableState.columnSearch["vinNo"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("vinNo", val)
                  }
                  selectedFilters={tableState.columnFilters["vinNo"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("vinNo", vals)
                  }
                  align="center"
                  columnKey="vinNo"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 200,
              className: "align-middle text-left text-gray-800",
              headerClassName: "text-center",
              cell: (row: any) => (
                <TableText
                  text={row.vinNo || "—"}
                  enableCopy={!!row.vinNo}
                  tooltip={!!row.vinNo}
                />
              ),
            },
            {
              key: "engineNo",
              header: (
                <TableColumnHeaderFilter
                  title={t("Số máy")}
                  sortState={getSortState("engineNo")}
                  onSortChange={(state: any) =>
                    handleSortChange("engineNo", state)
                  }
                  searchValue={tableState.columnSearch["engineNo"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("engineNo", val)
                  }
                  selectedFilters={tableState.columnFilters["engineNo"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("engineNo", vals)
                  }
                  align="center"
                  columnKey="engineNo"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 200,
              className: "align-middle text-left text-gray-800",
              headerClassName: "text-center",
              cell: (row: any) => (
                <TableText
                  text={row.engineNo || "—"}
                  enableCopy={!!row.engineNo}
                  tooltip={!!row.engineNo}
                />
              ),
            },
          ]
        : []),
      // Cột Thuộc tính tùy chỉnh (JSON Attributes): Chỉ hiển thị trên tab 'custom'
      ...(currentTab === "custom"
        ? [
            {
              key: "attributes",
              header: (
                <TableColumnHeaderFilter
                  title={t(
                    "inventoryTrackingCustom.customMetadata",
                    "Thuộc tính tùy chỉnh",
                  )}
                  sortState="none"
                  onSortChange={() => {}}
                  searchValue={tableState.columnSearch["attributes"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("attributes", val)
                  }
                  selectedFilters={tableState.columnFilters["attributes"] || []}
                  onFilterChange={(vals) =>
                    handleFilterChange("attributes", vals)
                  }
                  hideFilter={true}
                  align="center"
                  columnKey="attributes"
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                />
              ),
              size: 250,
              enableResizing: true,
              className: "align-middle text-left text-xs text-muted-foreground",
              headerClassName: "text-center",
              cell: (row: any) => {
                if (!row.attributes || Object.keys(row.attributes).length === 0)
                  return "—";
                return (
                  <Tooltip content={JSON.stringify(row.attributes, null, 2)}>
                    <div className="flex flex-wrap gap-1 max-w-[240px] truncate cursor-help">
                      {Object.entries(row.attributes)
                        .slice(0, 2)
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      {Object.keys(row.attributes).length > 2 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{Object.keys(row.attributes).length - 2}
                        </span>
                      )}
                    </div>
                  </Tooltip>
                );
              },
            },
          ]
        : []),
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title={t("Trạng thái")}
            sortState={getSortState("status")}
            onSortChange={(state) => handleSortChange("status", state)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => handleFilterChange("status", vals)}
            align="center"
            columnKey="status"
            queryKeyPrefix={`inventory-serial-options-${currentTab}`}
            allFilters={tableState.columnFilters}
            fetchOptions={async () => {
              return {
                items: [
                  { value: "IN_STOCK", label: "Tồn kho" },
                  { value: "RESERVED", label: "Giữ chỗ" },
                  { value: "SOLD", label: "Đã bán" },
                  { value: "RETURNED", label: "Đổi trả" },
                  { value: "DELIVERING", label: t("status.DELIVERING") },
                ],
                total: 5,
                next: null,
              };
            }}
          />
        ),
        size: 120,
        className: "align-middle text-center",
        headerClassName: "text-center",
        cell: (row) => {
          switch (row.status) {
            case "IN_STOCK":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-medium">
                  Tồn kho
                </span>
              );
            case "RESERVED":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 font-medium">
                  Giữ chỗ
                </span>
              );
            case "SOLD":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">
                  Đã bán
                </span>
              );
            case "RETURNED":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">
                  Đổi trả
                </span>
              );
            case "DELIVERING":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 font-medium">
                  {t("status.DELIVERING")}
                </span>
              );
            default:
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                  {row.status || "Tồn kho"}
                </span>
              );
          }
        },
      },
      {
        key: "goodsIssueNo",
        header: (
          <TableColumnHeaderFilter
            title={t("Phiếu xuất kho")}
            sortState={getSortState("goodsIssueNo")}
            onSortChange={(state) => handleSortChange("goodsIssueNo", state)}
            searchValue={tableState.columnSearch["goodsIssueNo"] || ""}
            onSearchChange={(val) => handleSearchChange("goodsIssueNo", val)}
            selectedFilters={tableState.columnFilters["goodsIssueNo"] || []}
            onFilterChange={(vals) => handleFilterChange("goodsIssueNo", vals)}
            align="center"
            columnKey="goodsIssueNo"
            showBlankOption={true}
            queryKeyPrefix={`inventory-serial-options-${currentTab}`}
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 200,
        className: "align-middle text-left",
        headerClassName: "text-center",
        cell: (row) => {
          if (!row.lifecycle?.goodsIssueNo) return "—";
          return (
            <TableText
              text={row.lifecycle.goodsIssueNo}
              tooltip={row.lifecycle.goodsIssueNo}
              enableCopy={true}
              textClassName="font-medium text-primary"
            />
          );
        },
      },
      {
        key: "goodsIssueDate",
        header: (
          <TableColumnHeaderFilter
            title={t("Ngày XK")}
            sortState={getSortState("goodsIssueDate")}
            onSortChange={(state) => handleSortChange("goodsIssueDate", state)}
            searchValue={tableState.columnSearch["goodsIssueDate"] || ""}
            onSearchChange={(val) => handleSearchChange("goodsIssueDate", val)}
            selectedFilters={tableState.columnFilters["goodsIssueDate"] || []}
            onFilterChange={(vals) =>
              handleFilterChange("goodsIssueDate", vals)
            }
            align="center"
            columnKey="goodsIssueDate"
            hideFilter={true}
            hideFooter={true}
            isActive={!!tableState.columnSearch["goodsIssueDate"]}
            dateRangeSlot={({ close }) => {
              const val = tableState.columnSearch["goodsIssueDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    tableState.setColumnSearch("goodsIssueDate", next);
                    setPage(1);
                  }}
                  onClose={close}
                />
              );
            }}
          />
        ),
        size: 120,
        className: "align-middle text-right",
        headerClassName: "text-center",
        cell: (row) =>
          row.lifecycle?.goodsIssueDate
            ? formatGMT7(row.lifecycle.goodsIssueDate, "date")
            : "—",
      },
      // Đơn hàng & Ngày giao: Hiển thị trên vehicle và parts
      ...(currentTab === "vehicle" || currentTab === "parts"
        ? [
            {
              key: "soNo",
              header: (
                <TableColumnHeaderFilter
                  title={t("Đơn hàng")}
                  sortState={getSortState("soNo")}
                  onSortChange={(state: any) => handleSortChange("soNo", state)}
                  searchValue={tableState.columnSearch["soNo"] || ""}
                  onSearchChange={(val: any) => handleSearchChange("soNo", val)}
                  selectedFilters={tableState.columnFilters["soNo"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("soNo", vals)
                  }
                  align="center"
                  columnKey="soNo"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 200,
              className: "align-middle text-left",
              headerClassName: "text-center",
              cell: (row: any) => {
                if (!row.soNo) return "—";
                return (
                  <TableText
                    text={row.soNo}
                    tooltip={row.soNo}
                    enableCopy={true}
                    textClassName="font-medium text-primary"
                  />
                );
              },
            },
            {
              key: "delivery",
              header: (
                <TableColumnHeaderFilter
                  title={t("Ngày giao")}
                  sortState={getSortState("delivery")}
                  onSortChange={(state: any) =>
                    handleSortChange("delivery", state)
                  }
                  searchValue={tableState.columnSearch["delivery"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("delivery", val)
                  }
                  selectedFilters={tableState.columnFilters["delivery"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("delivery", vals)
                  }
                  align="center"
                  columnKey="delivery"
                  hideFilter={true}
                  hideFooter={true}
                  isActive={!!tableState.columnSearch["delivery"]}
                  dateRangeSlot={({ close }) => {
                    const val = tableState.columnSearch["delivery"] || "";
                    const [from = "", to = ""] = val.split("|");
                    return (
                      <DateRangeColumnSlot
                        dateFrom={from}
                        dateTo={to}
                        onChange={(f, t) => {
                          const next = f || t ? `${f}|${t}` : "";
                          tableState.setColumnSearch("delivery", next);
                          setPage(1);
                        }}
                        onClose={close}
                      />
                    );
                  }}
                />
              ),
              size: 120,
              className: "align-middle text-right",
              headerClassName: "text-center",
              cell: (row: any) => {
                return row.lifecycle?.deliveryDate
                  ? formatGMT7(row.lifecycle.deliveryDate, "date")
                  : "—";
              },
            },
          ]
        : []),

      // Màu sắc & Đại lý: Chỉ hiển thị trên vehicle
      ...(currentTab === "vehicle"
        ? [
            {
              key: "color",
              header: (
                <TableColumnHeaderFilter
                  title={t("Màu sắc")}
                  sortState={getSortState("color")}
                  onSortChange={(state: any) =>
                    handleSortChange("color", state)
                  }
                  searchValue={tableState.columnSearch["color"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("color", val)
                  }
                  selectedFilters={tableState.columnFilters["color"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("color", vals)
                  }
                  align="center"
                  columnKey="color"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 100,
              className: "align-middle text-left",
              headerClassName: "text-center",
              cell: (row: any) => row.attributes?.color || "—",
            },
            {
              key: "dealerCode",
              header: (
                <TableColumnHeaderFilter
                  title={t("Mã đại lý")}
                  sortState={getSortState("dealer_code")}
                  onSortChange={(state: any) =>
                    handleSortChange("dealer_code", state)
                  }
                  searchValue={tableState.columnSearch["dealer_code"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("dealer_code", val)
                  }
                  selectedFilters={
                    tableState.columnFilters["dealer_code"] || []
                  }
                  onFilterChange={(vals: any) =>
                    handleFilterChange("dealer_code", vals)
                  }
                  align="center"
                  columnKey="dealer_code"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 120,
              className: "align-middle text-left",
              headerClassName: "text-center",
              cell: (row: any) => row.attributes?.dealer_code || "—",
            },
            {
              key: "dealerName",
              header: (
                <TableColumnHeaderFilter
                  title={t("Tên đại lý")}
                  sortState={getSortState("dealer_name")}
                  onSortChange={(state: any) =>
                    handleSortChange("dealer_name", state)
                  }
                  searchValue={tableState.columnSearch["dealer_name"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("dealer_name", val)
                  }
                  selectedFilters={
                    tableState.columnFilters["dealer_name"] || []
                  }
                  onFilterChange={(vals: any) =>
                    handleFilterChange("dealer_name", vals)
                  }
                  align="center"
                  columnKey="dealer_name"
                  showBlankOption={true}
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 250,
              className: "align-middle text-left",
              headerClassName: "text-center",
              cell: (row: any) =>
                row.attributes?.dealer_name ? (
                  <Tooltip content={row.attributes.dealer_name} side="top">
                    <span className="truncate block max-w-full cursor-help">
                      {row.attributes.dealer_name}
                    </span>
                  </Tooltip>
                ) : (
                  "—"
                ),
            },
          ]
        : []),
      // Cột Ghi chú: Hiển thị trên tab lot và custom
      ...(currentTab === "lot" || currentTab === "custom"
        ? [
            {
              key: "notes",
              header: (
                <TableColumnHeaderFilter
                  title={t("Ghi chú", "Ghi chú")}
                  sortState={getSortState("notes")}
                  onSortChange={(state: any) =>
                    handleSortChange("notes", state)
                  }
                  searchValue={tableState.columnSearch["notes"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("notes", val)
                  }
                  selectedFilters={tableState.columnFilters["notes"] || []}
                  onFilterChange={(vals: any) =>
                    handleFilterChange("notes", vals)
                  }
                  hideFilter={true}
                  align="center"
                  columnKey="notes"
                  queryKeyPrefix={`inventory-serial-options-${currentTab}`}
                  allFilters={tableState.columnFilters}
                />
              ),
              size: 180,
              enableResizing: true,
              className: "align-middle text-left text-muted-foreground text-sm",
              headerClassName: "text-center",
              cell: (row: any) => row.notes || "—",
            },
          ]
        : []),
    ],
    [t, tableState, currentTab, fixedTrackingPolicy, fetchSerialOptions],
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: false,
      custom: [
        {
          key: "missingSerial",
          label: "Tình trạng Serial",
          placeholder: "Tất cả",
          options: [{ value: "true", label: "Chưa có Serial (Trống)" }],
        },
      ],
    }),
    [t],
  );

  const resetAllFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setItemTypeFilter("");
    setTrackingPolicyFilter("");
    setStatusFilter("");
    setMissingSerialFilter(false);
    tableState.resetFilters();
    setPage(1);
    if (tabStatesRef.current[currentTab]) {
      tabStatesRef.current[currentTab] = {
        page: 1,
        pageSize: 50,
        search: "",
        searchInput: "",
        itemTypeFilter: "",
        trackingPolicyFilter: "",
        statusFilter: "",
        missingSerialFilter: false,
      };
    }
  }, [tableState, currentTab]);

  const rowActions = useCallback(
    (row: InventorySerialRow): ActionDropdownItem[] => [
      {
        groupLabel: t("TRA CỨU"),
        items: [
          {
            label: t("Chi tiết", "Xem chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => {
              setSelectedItem(row);
              setDrawerMode("view");
              setDrawerOpen(true);
            },
          },
          ...(row.lifecycle?.goodsIssueId || row.lifecycle?.goodsIssueNo
            ? [
                {
                  label: t("Xem phiếu xuất kho", "Xem phiếu xuất kho"),
                  icon: <PackageMinus className="w-3.5 h-3.5" />,
                  onClick: () => {
                    if (row.lifecycle?.goodsIssueId) {
                      giDrawer.openDetail(row.lifecycle.goodsIssueId);
                    }
                  },
                },
              ]
            : []),
          ...(row.soNo
            ? [
                {
                  label: t("Xem đơn hàng", "Xem đơn hàng"),
                  icon: <FileText className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setPreviewSoNo(row.soNo || null);
                  },
                },
              ]
            : []),
        ],
      },
      {
        groupLabel: t("THAO TÁC"),
        items: [
          {
            label: t("Chỉnh sửa", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => {
              setSelectedItem(row);
              setDrawerMode("edit");
              setDrawerOpen(true);
            },
          },
        ],
      },
    ],
    [t, giDrawer],
  );

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}
      <SpreadsheetPageTemplate
        tabs={!fixedTrackingPolicy ? pageTabs : undefined}
        activeTab={!fixedTrackingPolicy ? currentTab : undefined}
        onTabChange={!fixedTrackingPolicy ? handleTabChange : undefined}
        title={
          title || t("nav.items.erpInventoryTrackingGroup", "Theo dõi hàng hoá")
        }
        desc={
          desc ||
          t(
            "inventoryTracking.desc",
            "Quản lý định danh và truy xuất nguồn gốc xe, linh kiện, lô hàng và mã tùy chỉnh",
          )
        }
        icon={<Barcode className="h-5 w-5" />}
        tableId={tableId}
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        loading={loading}
        error={error}
        emptyLabel={t("Chưa có dữ liệu.")}
        minWidth={1200}
        sortArray={
          tableState.sorts.length > 0
            ? tableState.sorts
            : sortField
              ? [sortField]
              : []
        }
        onSort={(key) => {
          const currentState = getSortState(key);
          const nextState =
            currentState === "none"
              ? "asc"
              : currentState === "asc"
                ? "desc"
                : "none";
          handleSortChange(key, nextState);
        }}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRefresh={() => query.refetch()}
        activeFilterCount={activeFilterCount}
        onClearAllFilters={resetAllFilters}
        filterConfig={filterConfig}
        filter={{
          state: {
            period: "",
            dateFrom: "",
            dateTo: "",
            channel: "",
            search: search,
            amountMin: "",
            amountMax: "",
            status: "",
            counterpartySource: "",
            custom: {
              itemType: itemTypeFilter,
              trackingPolicy: trackingPolicyFilter,
              status: statusFilter,
              missingSerial: missingSerialFilter ? "true" : "",
            },
          },
          inputs: { search: searchInput, amountMin: "", amountMax: "" },
          setSearchInput: setSearchInput,
          openPanel: () => setFilterPanelOpen(true),
          closePanel: () => setFilterPanelOpen(false),
          togglePanel: () => setFilterPanelOpen((v) => !v),
          setPeriod: () => {},
          setDateFrom: () => {},
          setDateTo: () => {},
          setChannel: () => {},
          setAmountMinInput: () => {},
          setAmountMaxInput: () => {},
          setStatus: () => {},
          setCounterpartySource: () => {},
          setCustom: (key: string, v: string) => {
            if (key === "itemType") {
              setItemTypeFilter(v);
            } else if (key === "trackingPolicy") {
              setTrackingPolicyFilter(v);
            } else if (key === "status") {
              setStatusFilter(v);
            } else if (key === "missingSerial") {
              setMissingSerialFilter(v === "true");
            }
            setPage(1);
          },
          resetAll: resetAllFilters,
          hasActiveFilter: activeFilterCount > 0,
          activeFilterCount,
          panelOpen: filterPanelOpen,
        }}
      />
      <TrackedGoodsDrawer
        open={drawerOpen}
        item={selectedItem}
        initialMode={drawerMode}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => {
          query.refetch();
          setDrawerOpen(false);
        }}
      />
      <SoPreviewDrawer
        open={!!previewSoNo}
        soNo={previewSoNo}
        onClose={() => setPreviewSoNo(null)}
      />
      <GiFormDrawer drawer={giDrawer} />
    </>
  );
}
