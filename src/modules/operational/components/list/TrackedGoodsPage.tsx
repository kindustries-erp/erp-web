import { useState, useMemo, useEffect, useCallback } from "react";

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
import { Barcode, Eye, PanelRightOpen } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { TrackedGoodsDrawer } from "./TrackedGoodsDrawer";
import { SoPreviewDrawer } from "@/modules/sales-orders-core/components/SoPreviewDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";

export function TrackedGoodsPage({
  fixedTrackingPolicy,
  title,
  desc,
}: {
  fixedTrackingPolicy?: string;
  title?: string;
  desc?: string;
} = {}) {
  const t = useT();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [trackingPolicyFilter, setTrackingPolicyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [missingSerialFilter, setMissingSerialFilter] = useState(false);
  const [sortField, setSortField] = useState("-created_at");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventorySerialRow | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewSoNo, setPreviewSoNo] = useState<string | null>(null);
  const giDrawer = useGiDrawer();

  const tableState = useTableColumnState(
    fixedTrackingPolicy
      ? `inventory-tracked-goods-${fixedTrackingPolicy.toLowerCase()}-table`
      : "inventory-tracked-goods-table",
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
    trackingPolicy: fixedTrackingPolicy || trackingPolicyFilter || undefined,
    status: statusFilter || undefined,
    missingSerial: missingSerialFilter || undefined,
    sort: [sortField],
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

  const activeFilterCount = [
    !!search,
    !!itemTypeFilter,
    !!trackingPolicyFilter,
    !!statusFilter,
    missingSerialFilter,
  ].filter(Boolean).length;

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
    [],
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
                <span className="text-sm">{datePart}</span>
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
            queryKeyPrefix="inventory-serial-options"
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
            queryKeyPrefix="inventory-serial-options"
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
      {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title={t("Số Seri")}
            sortState={getSortState("serialNo")}
            onSortChange={(state) => handleSortChange("serialNo", state)}
            searchValue={tableState.columnSearch["serialNo"] || ""}
            onSearchChange={(val) => handleSearchChange("serialNo", val)}
            selectedFilters={tableState.columnFilters["serialNo"] || []}
            onFilterChange={(vals) => handleFilterChange("serialNo", vals)}
            align="center"
            columnKey="serialNo"
            queryKeyPrefix="inventory-serial-options"
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 200,
        className: "align-middle text-left text-gray-800",
        headerClassName: "text-center",
        cell: (row) => (
          <TableText
            text={row.serialNo || "—"}
            enableCopy
            tooltip={true}
            onDrawerClick={() => {
              setSelectedItem(row);
              setDrawerOpen(true);
            }}
          />
        ),
      },
      {
        key: "vinNo",
        header: (
          <TableColumnHeaderFilter
            title={t("Số VIN")}
            sortState={getSortState("vinNo")}
            onSortChange={(state) => handleSortChange("vinNo", state)}
            searchValue={tableState.columnSearch["vinNo"] || ""}
            onSearchChange={(val) => handleSearchChange("vinNo", val)}
            selectedFilters={tableState.columnFilters["vinNo"] || []}
            onFilterChange={(vals) => handleFilterChange("vinNo", vals)}
            align="center"
            columnKey="vinNo"
            queryKeyPrefix="inventory-serial-options"
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 200,
        className: "align-middle text-left text-gray-800",
        headerClassName: "text-center",
        cell: (row) => (
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
            onSortChange={(state) => handleSortChange("engineNo", state)}
            searchValue={tableState.columnSearch["engineNo"] || ""}
            onSearchChange={(val) => handleSearchChange("engineNo", val)}
            selectedFilters={tableState.columnFilters["engineNo"] || []}
            onFilterChange={(vals) => handleFilterChange("engineNo", vals)}
            align="center"
            columnKey="engineNo"
            queryKeyPrefix="inventory-serial-options"
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 200,
        className: "align-middle text-left text-gray-800",
        headerClassName: "text-center",
        cell: (row) => (
          <TableText
            text={row.engineNo || "—"}
            enableCopy={!!row.engineNo}
            tooltip={!!row.engineNo}
          />
        ),
      },
      ...(fixedTrackingPolicy
        ? []
        : [
            {
              key: "trackingPolicyName",
              header: (
                <TableColumnHeaderFilter
                  title={t("Chính sách Tracking")}
                  sortState={getSortState("trackingPolicyName")}
                  onSortChange={(state: any) =>
                    handleSortChange("trackingPolicyName", state)
                  }
                  searchValue={
                    tableState.columnSearch["trackingPolicyName"] || ""
                  }
                  onSearchChange={(val: any) =>
                    handleSearchChange("trackingPolicyName", val)
                  }
                  selectedFilters={
                    tableState.columnFilters["trackingPolicyName"] || []
                  }
                  onFilterChange={(vals: any) =>
                    handleFilterChange("trackingPolicyName", vals)
                  }
                  align="center"
                  columnKey="trackingPolicyName"
                  queryKeyPrefix="inventory-serial-options"
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 180,
              className: "align-middle text-left",
              headerClassName: "text-center",
              cell: (row: any) => row.item?.trackingPolicyName || "—",
            },
          ]),
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title={t("Trạng thái")}
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => handleFilterChange("status", vals)}
            align="center"
            columnKey="status"
            queryKeyPrefix="inventory-serial-options"
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
            queryKeyPrefix="inventory-serial-options"
            allFilters={tableState.columnFilters}
            fetchOptions={fetchSerialOptions}
          />
        ),
        size: 200,
        className: "align-middle text-center",
        headerClassName: "text-center",
        cell: (row) => {
          if (!row.lifecycle?.goodsIssueNo) return "—";
          return (
            <div className="flex flex-col gap-1 w-full pr-1">
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="truncate text-primary font-normal">
                  {row.lifecycle.goodsIssueNo}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (row.lifecycle?.goodsIssueId) {
                      giDrawer.openDetail(row.lifecycle.goodsIssueId);
                    }
                  }}
                  className="shrink-0 p-1 flex items-center justify-center outline-none"
                >
                  <PanelRightOpen className="w-3.5 h-3.5 text-primary opacity-40 hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
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
      ...(fixedTrackingPolicy === "SERIAL"
        ? []
        : [
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
                  queryKeyPrefix="inventory-serial-options"
                  allFilters={tableState.columnFilters}
                  fetchOptions={fetchSerialOptions}
                />
              ),
              size: 200,
              className: "align-middle text-center",
              headerClassName: "text-center",
              cell: (row: any) => {
                if (!row.soNo) return "—";
                return (
                  <div className="flex flex-col gap-1 w-full pr-1">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="truncate text-primary font-normal">
                        {row.soNo}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSoNo(row.soNo || null);
                        }}
                        className="shrink-0 p-1 flex items-center justify-center outline-none"
                      >
                        <PanelRightOpen className="w-3.5 h-3.5 text-primary opacity-40 hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
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
          ]),

      ...(fixedTrackingPolicy === "SERIAL"
        ? []
        : [
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
                  queryKeyPrefix="inventory-serial-options"
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
                  queryKeyPrefix="inventory-serial-options"
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
                  queryKeyPrefix="inventory-serial-options"
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
          ]),
    ],
    [t, tableState, fetchSerialOptions],
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
  }, [tableState]);

  const rowActions = useCallback(
    (row: InventorySerialRow): ActionDropdownItem[] => [
      {
        groupLabel: t("TRA CỨU"),
        items: [
          {
            label: t("Chi tiết"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () => {
              setSelectedItem(row);
              setDrawerOpen(true);
            },
          },
        ],
      },
    ],
    [t],
  );

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}
      <SpreadsheetPageTemplate
        title={title || t("Serial / Tracking")}
        desc={desc || t("Danh sách sản phẩm / vật tư có tracking")}
        icon={<Barcode className="h-5 w-5" />}
        tableId={
          fixedTrackingPolicy
            ? `inventory-tracked-goods-${fixedTrackingPolicy.toLowerCase()}-table`
            : "inventory-tracked-goods-table"
        }
        items={items}
        columns={columns}
        getRowKey={(row) => row.id}
        rowActions={rowActions}
        loading={loading}
        error={error}
        emptyLabel={t("Chưa có dữ liệu.")}
        minWidth={1200}
        sortArray={[sortField]}
        onSort={(key) => {
          if (sortField === key) setSortField(`-${key}`);
          else if (sortField === `-${key}`) setSortField("");
          else setSortField(key);
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
