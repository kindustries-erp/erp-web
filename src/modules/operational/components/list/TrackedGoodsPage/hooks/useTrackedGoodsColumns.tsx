import React, { useMemo } from "react";
import { useT } from "@/core/i18n";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatGMT7 } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export interface UseTrackedGoodsColumnsOptions {
  currentTab: string;
  tableState: ReturnType<typeof useTableColumnState>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  handleSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  handleSearchChange: (key: string, val: string) => void;
  handleFilterChange: (key: string, vals: string[]) => void;
  fetchSerialOptions: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{ items: any[]; total: number; next: number | null }>;
  setSelectedItem: (item: InventorySerialRow | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setPage: (page: number) => void;
}

export function useTrackedGoodsColumns({
  currentTab,
  tableState,
  getSortState,
  handleSortChange,
  handleSearchChange,
  handleFilterChange,
  fetchSerialOptions,
  setSelectedItem,
  setDrawerOpen,
  setPage,
}: UseTrackedGoodsColumnsOptions) {
  const t = useT();

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
            title={t("inventoryTracking.createdAt", "Ngày nhập")}
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
            title={t("inventoryTracking.itemCode", "Mã VT")}
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
            title={t("inventoryTracking.itemName", "Tên VT")}
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
                        : t("inventoryTracking.serialNo", "Số Seri")
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
      ...(currentTab === "vehicle"
        ? [
            {
              key: "vinNo",
              header: (
                <TableColumnHeaderFilter
                  title={t("inventoryTracking.vinNo", "Số VIN")}
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
                  title={t("inventoryTracking.engineNo", "Số máy")}
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
            title={t("common.status", "Trạng thái")}
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
                  {
                    value: "IN_STOCK",
                    label: t("status.inStock", "Tồn kho"),
                  },
                  {
                    value: "RESERVED",
                    label: t("status.reserved", "Giữ chỗ"),
                  },
                  {
                    value: "SOLD",
                    label: t("status.sold", "Đã bán"),
                  },
                  {
                    value: "RETURNED",
                    label: t("status.returned", "Đổi trả"),
                  },
                  {
                    value: "DELIVERING",
                    label: t("status.DELIVERING", "Đang giao"),
                  },
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
                  {t("status.inStock", "Tồn kho")}
                </span>
              );
            case "RESERVED":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 font-medium">
                  {t("status.reserved", "Giữ chỗ")}
                </span>
              );
            case "SOLD":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">
                  {t("status.sold", "Đã bán")}
                </span>
              );
            case "RETURNED":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">
                  {t("status.returned", "Đổi trả")}
                </span>
              );
            case "DELIVERING":
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 font-medium">
                  {t("status.DELIVERING", "Đang giao")}
                </span>
              );
            default:
              return (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                  {row.status || t("status.inStock", "Tồn kho")}
                </span>
              );
          }
        },
      },
      {
        key: "goodsIssueNo",
        header: (
          <TableColumnHeaderFilter
            title={t("inventoryTracking.goodsIssueNo", "Phiếu xuất kho")}
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
            title={t("inventoryTracking.goodsIssueDate", "Ngày XK")}
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
      ...(currentTab === "vehicle" || currentTab === "parts"
        ? [
            {
              key: "soNo",
              header: (
                <TableColumnHeaderFilter
                  title={t("sales.order", "Đơn hàng")}
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
                  title={t("sales.deliveryDate", "Ngày giao")}
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
      ...(currentTab === "vehicle"
        ? [
            {
              key: "color",
              header: (
                <TableColumnHeaderFilter
                  title={t("inventoryTracking.color", "Màu sắc")}
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
                  title={t("inventoryTracking.dealerCode", "Mã đại lý")}
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
                  title={t("inventoryTracking.dealerName", "Tên đại lý")}
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
      ...(currentTab === "lot" || currentTab === "custom"
        ? [
            {
              key: "notes",
              header: (
                <TableColumnHeaderFilter
                  title={t("common.remarks", "Ghi chú")}
                  sortState={getSortState("notes")}
                  onSortChange={(state: any) =>
                    handleSortChange("notes", state)
                  }
                  searchValue={tableState.columnSearch["notes"] || ""}
                  onSearchChange={(val: any) =>
                    handleSearchChange("notes", val)
                  }
                  selectedFilters={tableState.columnFilters["notes"] || []}
                  onFilterChange={(vals) => handleFilterChange("notes", vals)}
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
    [
      t,
      tableState,
      currentTab,
      getSortState,
      handleSortChange,
      handleSearchChange,
      handleFilterChange,
      fetchSerialOptions,
      setSelectedItem,
      setDrawerOpen,
      setPage,
    ],
  );

  return columns;
}
