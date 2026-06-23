import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { useInventorySerialsQuery } from "@/modules/inventory-core/hooks/useInventorySerialsQuery";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import type { FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import { OperationalTableActions } from "@/modules/operational/components/list/OperationalTableActions";
import { formatGMT7 } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";

export function TrackedGoodsPage({
  setActions,
}: {
  setActions?: (node: React.ReactNode) => void;
}) {
  const t = useT();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [trackingPolicyFilter, setTrackingPolicyFilter] = useState("");
  const [sortField, setSortField] = useState("-created_at");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

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
  ].filter(Boolean).length;

  const columns: DataTableColumn<InventorySerialRow>[] = useMemo(
    () => [
      {
        key: "itemCode",
        header: t("Mã vật tư"),
        className: "align-middle min-w-[220px]",
        cell: (row) => row.item?.sku || "—",
      },
      {
        key: "itemName",
        header: t("Tên vật tư"),
        className: "align-middle min-w-[250px]",
        cell: (row) => (
          <div>
            <div className="font-medium">{row.item?.itemName || "—"}</div>
            <div className="text-xs text-gray-500">
              {row.item?.itemType} • {row.item?.trackingPolicy}
            </div>
          </div>
        ),
      },
      {
        key: "serialNo",
        header: t("Mã Tracking / Serial"),
        className: "align-middle min-w-[200px]",
        sortable: true,
        sortKey: "serial_no",
        cell: (row) => {
          if (row.vin || row.engineNo) {
            return (
              <div>
                <div className="font-medium text-blue-600">
                  VIN: {row.vin || "—"} / EN: {row.engineNo || "—"}
                </div>
                {row.serialNo && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ID nội bộ: {row.serialNo}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div className="font-medium text-blue-600">
              {row.serialNo || "—"}
            </div>
          );
        },
      },
      {
        key: "createdAt",
        header: t("Ngày ghi nhận"),
        className: "align-middle min-w-[160px]",
        sortable: true,
        sortKey: "created_at",
        cell: (row) => (
          <Tooltip content={formatGMT7(row.createdAt, "datetime-sec")} side="top">
            <span className="cursor-help border-b border-dotted border-gray-400">
              {formatGMT7(row.createdAt, "date")}
            </span>
          </Tooltip>
        ),
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
      ],
    }),
    [t],
  );

  const resetAllFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setItemTypeFilter("");
    setTrackingPolicyFilter("");
    setPage(1);
  }, []);

  useEffect(() => {
    if (setActions) {
      setActions(
        <OperationalTableActions
          loading={loading}
          onRefresh={() => query.refetch()}
          onFilterToggle={() => setFilterPanelOpen((v) => !v)}
          activeFilterCount={activeFilterCount}
          onCreate={() => {}}
        />,
      );
    }
  }, [setActions, loading, query.refetch, activeFilterCount]);

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}
      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <StandardTable
            tableId="inventory-tracked-goods-table"
            enableColumnVisibility={true}
            items={items}
            columns={columns}
            getRowKey={(row) => row.id}
            loading={loading}
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
            actions={() => []}
            onPage={setPage}
            onPageSize={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
        <FilterPanel
          config={filterConfig}
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
              custom: {
                itemType: itemTypeFilter,
                trackingPolicy: trackingPolicyFilter,
              },
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
            setSearchInput: setSearchInput,
            setAmountMinInput: () => {},
            setAmountMaxInput: () => {},
            setStatus: () => {},
            setCounterpartySource: () => {},
            setCustom: (key: string, v: string) => {
              if (key === "itemType") {
                setItemTypeFilter(v);
              } else if (key === "trackingPolicy") {
                setTrackingPolicyFilter(v);
              }
              setPage(1);
            },
            resetAll: resetAllFilters,
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>
    </>
  );
}
