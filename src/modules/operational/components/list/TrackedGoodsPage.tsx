import { useState, useMemo, useEffect, useCallback } from "react";

import { useInventorySerialsQuery } from "@/modules/inventory-core/hooks/useInventorySerialsQuery";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatGMT7 } from "@/shared/utils/format";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Barcode, Eye } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { TrackedGoodsDrawer } from "./TrackedGoodsDrawer";

export function TrackedGoodsPage() {
  const t = useT();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [trackingPolicyFilter, setTrackingPolicyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("-created_at");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventorySerialRow | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    trackingPolicy: trackingPolicyFilter || undefined,
    status: statusFilter || undefined,
    sort: [sortField],
  });

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
  ].filter(Boolean).length;

  const columns: DataTableColumn<InventorySerialRow>[] = useMemo(
    () => [
      {
        key: "createdAt",
        header: t("Ngày"),
        size: 100,
        className: "align-middle text-right",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "created_at",
        cell: (row) => (
          <Tooltip
            content={formatGMT7(row.createdAt, "datetime-sec")}
            side="top"
          >
            <span className="cursor-help border-b border-dotted border-gray-400">
              {formatGMT7(row.createdAt, "date")}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "itemCode",
        header: t("Mã vật tư"),
        size: 100,
        className: "align-middle text-left",
        headerClassName: "text-center",
        cell: (row) => row.item?.sku || "—",
      },
      {
        key: "itemName",
        header: t("Tên vật tư"),
        className: "align-middle min-w-[250px] text-left",
        headerClassName: "text-center",
        cell: (row) => (
          <div className="font-medium">{row.item?.itemName || "—"}</div>
        ),
      },
      {
        key: "serialNo",
        header: t("SerialNo"),
        className:
          "align-middle min-w-[150px] text-left font-medium text-blue-600",
        headerClassName: "text-center",
        sortable: true,
        sortKey: "serial_no",
        cell: (row) => row.serialNo || "—",
      },
      {
        key: "vinNo",
        header: t("Số VIN"),
        className:
          "align-middle min-w-[150px] text-left font-medium text-blue-600",
        headerClassName: "text-center",
        cell: (row) => row.vinNo || "—",
      },
      {
        key: "engineNo",
        header: t("Số máy"),
        className:
          "align-middle min-w-[150px] text-left font-medium text-blue-600",
        headerClassName: "text-center",
        cell: (row) => row.engineNo || "—",
      },
      {
        key: "trackingPolicyName",
        header: t("Chính sách Tracking"),
        className: "align-middle min-w-[180px] text-left",
        headerClassName: "text-center",
        cell: (row) => row.item?.trackingPolicyName || "—",
      },
      {
        key: "status",
        header: t("Trạng thái"),
        className: "align-middle min-w-[120px] text-center",
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
        key: "soNo",
        header: t("Đơn hàng"),
        className: "align-middle min-w-[120px] text-center",
        headerClassName: "text-center",
        cell: (row) => {
          if (!row.soNo) return "—";
          // Use link to SO page. Ensure routing is configured, assuming it is /erp/sales-orders
          return (
            <a
              href={`/erp/sales-orders?search=${row.soNo}`}
              className="text-primary hover:underline"
            >
              {row.soNo}
            </a>
          );
        },
      },

      {
        key: "delivery",
        header: t("Ngày giao"),
        className: "align-middle min-w-[100px] text-center",
        headerClassName: "text-center",
        cell: (row) => {
          return row.lifecycle?.deliveryDate
            ? formatGMT7(row.lifecycle.deliveryDate, "date")
            : "—";
        },
      },

      {
        key: "attributes",
        header: t("Thuộc tính"),
        className: "align-middle min-w-[200px] text-left",
        headerClassName: "text-center",
        cell: (row) => {
          if (!row.attributes) return "—";

          let entries: Array<{ key: string; value: string }> = [];
          if (Array.isArray(row.attributes)) {
            entries = row.attributes;
          } else if (typeof row.attributes === "object") {
            entries = Object.entries(row.attributes).map(([k, v]) => ({
              key: k,
              value: String(v),
            }));
          }

          if (entries.length === 0) return "—";

          return (
            <ul className="list-disc list-inside text-xs text-muted-foreground whitespace-pre-wrap">
              {entries.map((entry, i) => (
                <li key={i}>
                  <span className="font-medium">{entry.key}:</span>{" "}
                  {entry.value}
                </li>
              ))}
            </ul>
          );
        },
      },
    ],
    [t],
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      custom: [
        {
          key: "itemType",
          label: t("Loại vật tư"),
          placeholder: t("Tất cả"),
          options: [
            { value: "FG", label: "Thành phẩm (FG)" },
            { value: "RAW", label: "Nguyên vật liệu (RAW)" },
            { value: "WIP", label: "Bán thành phẩm (WIP)" },
          ],
        },
        {
          key: "trackingPolicy",
          label: t("Chính sách Tracking"),
          placeholder: t("Tất cả"),
          options: [
            { value: "SERIAL", label: "Serial" },
            { value: "LOT", label: "Lô (Lot)" },
            { value: "VEHICLE", label: "Xe (VIN/EN)" },
            { value: "CUSTOM", label: "Tùy chỉnh" },
          ],
        },
        {
          key: "status",
          label: t("Trạng thái"),
          placeholder: t("Tất cả"),
          options: [
            { value: "IN_STOCK", label: "Tồn kho" },
            { value: "RESERVED", label: "Đã giữ chỗ" },
            { value: "SOLD", label: "Đã bán" },
            { value: "RETURNED", label: "Đổi trả" },
          ],
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
    setPage(1);
  }, []);

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
        title={t("Serial / Tracking")}
        desc={t("Danh sách sản phẩm / vật tư có tracking")}
        icon={<Barcode className="h-5 w-5" />}
        tableId="inventory-tracked-goods-table"
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
    </>
  );
}
