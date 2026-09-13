import React, { useState, useEffect, useMemo } from "react";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useDrawerStore } from "@/shared/stores/useDrawerStore";
import { AfterSalesDrawer } from "./AfterSalesDrawer";
import { format } from "date-fns";
import { Shield, Eye } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { useAfterSalesQuery } from "../hooks/useAfterSalesQuery";
import { SoPreviewDrawer } from "@/modules/sales-orders-core/components/SoPreviewDrawer";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { DataTableColumn } from "@/shared/components/DataTable";

export function AfterSalesListPage() {
  const t = useT();

  const { openDrawer, closeDrawer, isOpen, type, mode, entityData } =
    useDrawerStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [previewSoNo, setPreviewSoNo] = useState<string | null>(null);

  const tableState = useTableColumnState("after-sales-table");

  const getSortState = (key: string) => {
    if (tableState.sorts.includes(`-${key}`)) return "desc";
    if (tableState.sorts.includes(key)) return "asc";
    return undefined;
  };

  const fetchAfterSalesColumnOptions = async (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const res = await inventoryCoreApi.getSerialLifecycleColumnOptions(
      params.columnKey,
      params.search,
      params.pageParam,
      20,
      tableState.columnFilters,
    );
    return {
      items: res.items.map((i) => ({ label: i, value: i })),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
    };
  };
  const [dealerSearch, setDealerSearch] = useState("");

  const {
    data: dealersData,
    fetchNextPage: fetchNextDealers,
    isFetchingNextPage: loadingDealers,
  } = useBasicMasterInfinite({
    search: dealerSearch,
    limit: 50,
    entities: "customers",
  });

  const dealerOptions = useMemo(() => {
    return (
      dealersData?.pages.flatMap((p) =>
        (p.items.customers || []).map((c) => ({
          value: c.id,
          label: `${c.code} — ${c.displayName || c.name}`,
        })),
      ) || []
    );
  }, [dealersData]);

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: false,
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "dealerId",
          label: t("Đại lý"),
          placeholder: t("Chọn đại lý"),
          type: "combobox",
          options: dealerOptions,
          onSearch: setDealerSearch,
          onLoadMore: fetchNextDealers,
          loading: loadingDealers,
        },
      ],
    }),
    [t, dealerOptions, fetchNextDealers, loadingDealers],
  );
  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const {
    data: resData,
    isLoading: loading,
    isFetching,
    refetch: fetchList,
  } = useAfterSalesQuery({
    page,
    pageSize,
    dateFrom: filter.state.dateFrom,
    dateTo: filter.state.dateTo,
    sortField: tableState.sorts[0]
      ? tableState.sorts[0].startsWith("-")
        ? tableState.sorts[0].substring(1)
        : tableState.sorts[0]
      : undefined,
    sortOrder: tableState.sorts[0]
      ? tableState.sorts[0].startsWith("-")
        ? "desc"
        : "asc"
      : undefined,
    dealerId: filter.state.custom?.dealerId,
    column_search: JSON.stringify(tableState.columnSearch),
    column_filters: JSON.stringify(tableState.columnFilters),
  });

  useEffect(() => {
    setPage(1);
  }, [tableState.columnSearch, tableState.columnFilters, tableState.sorts]);

  const activeFilterCount = useMemo(() => {
    let count = tableState.activeFilterCount;
    if (filter.state.dateFrom || filter.state.dateTo) count += 1;
    if (filter.state.custom?.dealerId) count += 1;
    return count;
  }, [
    tableState.activeFilterCount,
    filter.state.dateFrom,
    filter.state.dateTo,
    filter.state.custom?.dealerId,
  ]);

  const handleClearAllFilters = () => {
    tableState.resetFilters();
    filter.resetAll();
    setPage(1);
  };

  const data = resData?.items || [];
  const total = resData?.total || 0;

  useEffect(() => {
    const handleRefresh = () => {
      fetchList();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);
    return () => window.removeEventListener("refresh_erp_data", handleRefresh);
  }, [fetchList]);

  const handleRowClick = (row: any) => {
    openDrawer("after-sales", "view", row.lifecycleId, row);
  };

  const rowActions = (row: any) => [
    {
      groupLabel: "TRA CỨU",
      items: [
        {
          label: "Chi tiết",
          icon: <Eye className="w-3.5 h-3.5" />,
          onClick: () => handleRowClick(row),
        },
      ],
    },
  ];

  const columns: DataTableColumn<any>[] = [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: any, idx: number) => <span>{idx}</span>,
    },
    {
      key: "expectedDeliveryDate",
      size: 150,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Ngày DK")}
          columnKey="expectedDeliveryDate"
          sortState={getSortState("expectedDeliveryDate") || "none"}
          onSortChange={(s) => tableState.setSort("expectedDeliveryDate", s)}
          searchValue={tableState.columnSearch["expectedDeliveryDate"] || ""}
          onSearchChange={(v) =>
            tableState.setColumnSearch("expectedDeliveryDate", v)
          }
          selectedFilters={
            tableState.columnFilters["expectedDeliveryDate"] || []
          }
          onFilterChange={(v) =>
            tableState.setColumnFilter("expectedDeliveryDate", v)
          }
          fetchOptions={fetchAfterSalesColumnOptions}
          hideFilter={true}
          hideFooter={true}
          isActive={Boolean(
            tableState.columnSearch["expectedDeliveryDate"] ||
            tableState.columnFilters["expectedDeliveryDate"]?.length,
          )}
          dateRangeSlot={({ close }) => {
            const val = tableState.columnSearch["expectedDeliveryDate"] || "";
            const [from = "", to = ""] = val.split("|");
            return (
              <DateRangeColumnSlot
                dateFrom={from}
                dateTo={to}
                onChange={(f, t) => {
                  const next = f || t ? `${f}|${t}` : "";
                  tableState.setColumnSearch("expectedDeliveryDate", next);
                }}
                onClose={close}
              />
            );
          }}
        />
      ),
      cell: (row: any) =>
        row.expectedDeliveryDate
          ? format(new Date(row.expectedDeliveryDate), "dd/MM/yyyy")
          : "-",
    },
    {
      key: "deliveryDate",
      size: 150,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Ngày giao")}
          columnKey="deliveryDate"
          sortState={getSortState("deliveryDate") || "none"}
          onSortChange={(s) => tableState.setSort("deliveryDate", s)}
          searchValue={tableState.columnSearch["deliveryDate"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("deliveryDate", v)}
          selectedFilters={tableState.columnFilters["deliveryDate"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("deliveryDate", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          hideFilter={true}
          hideFooter={true}
          isActive={Boolean(
            tableState.columnSearch["deliveryDate"] ||
            tableState.columnFilters["deliveryDate"]?.length,
          )}
          dateRangeSlot={({ close }) => {
            const val = tableState.columnSearch["deliveryDate"] || "";
            const [from = "", to = ""] = val.split("|");
            return (
              <DateRangeColumnSlot
                dateFrom={from}
                dateTo={to}
                onChange={(f, t) => {
                  const next = f || t ? `${f}|${t}` : "";
                  tableState.setColumnSearch("deliveryDate", next);
                }}
                onClose={close}
              />
            );
          }}
        />
      ),
      cell: (row: any) =>
        row.deliveryDate
          ? format(new Date(row.deliveryDate), "dd/MM/yyyy")
          : "-",
    },
    {
      key: "itemName",
      size: 200,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Sản phẩm")}
          columnKey="itemName"
          sortState={getSortState("itemName") || "none"}
          onSortChange={(s) => tableState.setSort("itemName", s)}
          searchValue={tableState.columnSearch["itemName"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("itemName", v)}
          selectedFilters={tableState.columnFilters["itemName"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("itemName", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["itemName"] ||
            tableState.columnFilters["itemName"]?.length,
          )}
        />
      ),
      cell: (row: any) => (
        <div className="flex flex-col">
          <span>{row.itemName}</span>
          <span className="text-xs text-muted-foreground">{row.sku}</span>
        </div>
      ),
    },
    {
      key: "serialNo",
      size: 180,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Số Seri")}
          columnKey="serialNo"
          sortState={getSortState("serialNo") || "none"}
          onSortChange={(s) => tableState.setSort("serialNo", s)}
          searchValue={tableState.columnSearch["serialNo"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("serialNo", v)}
          selectedFilters={tableState.columnFilters["serialNo"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("serialNo", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["serialNo"] ||
            tableState.columnFilters["serialNo"]?.length,
          )}
        />
      ),
      cell: (row: any) => (
        <TableText
          text={row.serialNo || "—"}
          tooltip={row.serialNo || false}
          enableCopy={Boolean(row.serialNo)}
          onDetailClick={row.serialNo ? () => handleRowClick(row) : undefined}
        />
      ),
    },
    {
      key: "vinNo",
      size: 180,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Số Khung")}
          columnKey="vinNo"
          sortState={getSortState("vinNo") || "none"}
          onSortChange={(s) => tableState.setSort("vinNo", s)}
          searchValue={tableState.columnSearch["vinNo"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("vinNo", v)}
          selectedFilters={tableState.columnFilters["vinNo"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("vinNo", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["vinNo"] ||
            tableState.columnFilters["vinNo"]?.length,
          )}
        />
      ),
      cell: (row: any) => (
        <TableText text={row.vinNo || "—"} enableCopy={Boolean(row.vinNo)} />
      ),
    },
    {
      key: "engineNo",
      size: 180,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Số Máy")}
          columnKey="engineNo"
          sortState={getSortState("engineNo") || "none"}
          onSortChange={(s) => tableState.setSort("engineNo", s)}
          searchValue={tableState.columnSearch["engineNo"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("engineNo", v)}
          selectedFilters={tableState.columnFilters["engineNo"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("engineNo", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["engineNo"] ||
            tableState.columnFilters["engineNo"]?.length,
          )}
        />
      ),
      cell: (row: any) => (
        <TableText
          text={row.engineNo || "—"}
          enableCopy={Boolean(row.engineNo)}
        />
      ),
    },
    {
      key: "soNo",
      size: 180,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Đơn hàng (SO)")}
          columnKey="soNo"
          sortState={getSortState("soNo") || "none"}
          onSortChange={(s) => tableState.setSort("soNo", s)}
          searchValue={tableState.columnSearch["soNo"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("soNo", v)}
          selectedFilters={tableState.columnFilters["soNo"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("soNo", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["soNo"] ||
            tableState.columnFilters["soNo"]?.length,
          )}
        />
      ),
      cell: (row: any) => (
        <TableText
          text={row.soNo || "—"}
          tooltip={row.soNo || false}
          enableCopy={Boolean(row.soNo)}
          onDrawerClick={
            row.soNo ? () => setPreviewSoNo(row.soNo || null) : undefined
          }
        />
      ),
    },
    {
      key: "trackingAttributes",
      size: 220,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Thuộc tính xe (Màu sắc)")}
          columnKey="color"
          sortState={getSortState("color") || "none"}
          onSortChange={(s) => tableState.setSort("color", s)}
          searchValue={tableState.columnSearch["color"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("color", v)}
          selectedFilters={tableState.columnFilters["color"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("color", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["color"] ||
            tableState.columnFilters["color"]?.length,
          )}
        />
      ),
      cell: (row: any) => {
        if (
          !row.trackingAttributes ||
          typeof row.trackingAttributes !== "object"
        )
          return "—";
        const attrNames: Record<string, string> = {
          color: "Màu sắc",
          dealer_code: "Mã đại lý",
          dealer_name: "Tên đại lý",
        };
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(row.trackingAttributes).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200"
              >
                <span className="font-medium mr-1">
                  {attrNames[k] || t(k)}:
                </span>
                {String(v)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "customerName",
      size: 180,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Khách hàng")}
          columnKey="customerName"
          sortState={getSortState("customerName") || "none"}
          onSortChange={(s) => tableState.setSort("customerName", s)}
          searchValue={tableState.columnSearch["customerName"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("customerName", v)}
          selectedFilters={tableState.columnFilters["customerName"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("customerName", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["customerName"] ||
            tableState.columnFilters["customerName"]?.length,
          )}
        />
      ),
      cell: (row: any) => (
        <div className="flex flex-col">
          <span>{row.customerName || "-"}</span>
          <span className="text-xs text-muted-foreground">
            {row.customerPhone}
          </span>
        </div>
      ),
    },
    {
      key: "activationDate",
      size: 150,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Ngày kích hoạt")}
          columnKey="activationDate"
          sortState={getSortState("activationDate") || "none"}
          onSortChange={(s) => tableState.setSort("activationDate", s)}
          searchValue={tableState.columnSearch["activationDate"] || ""}
          onSearchChange={(v) =>
            tableState.setColumnSearch("activationDate", v)
          }
          selectedFilters={tableState.columnFilters["activationDate"] || []}
          onFilterChange={(v) =>
            tableState.setColumnFilter("activationDate", v)
          }
          fetchOptions={fetchAfterSalesColumnOptions}
          hideFilter={true}
          hideFooter={true}
          isActive={Boolean(
            tableState.columnSearch["activationDate"] ||
            tableState.columnFilters["activationDate"]?.length,
          )}
          dateRangeSlot={({ close }) => {
            const val = tableState.columnSearch["activationDate"] || "";
            const [from = "", to = ""] = val.split("|");
            return (
              <DateRangeColumnSlot
                dateFrom={from}
                dateTo={to}
                onChange={(f, t) => {
                  const next = f || t ? `${f}|${t}` : "";
                  tableState.setColumnSearch("activationDate", next);
                }}
                onClose={close}
              />
            );
          }}
        />
      ),
      cell: (row: any) => {
        if (!row.warrantyActivatedAt) return "-";
        const dateObj = new Date(row.warrantyActivatedAt);
        return (
          <Tooltip content={format(dateObj, "yyyy-MM-dd HH:mm:ss")}>
            <span>{format(dateObj, "yyyy-MM-dd")}</span>
          </Tooltip>
        );
      },
    },
    {
      key: "warrantyActivatedAt",
      size: 150,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Bảo hành")}
          columnKey="warrantyActivatedAt"
          sortState={getSortState("warrantyActivatedAt") || "none"}
          onSortChange={(s) => tableState.setSort("warrantyActivatedAt", s)}
          searchValue={tableState.columnSearch["warrantyActivatedAt"] || ""}
          onSearchChange={(v) =>
            tableState.setColumnSearch("warrantyActivatedAt", v)
          }
          selectedFilters={
            tableState.columnFilters["warrantyActivatedAt"] || []
          }
          onFilterChange={(v) =>
            tableState.setColumnFilter("warrantyActivatedAt", v)
          }
          isActive={Boolean(
            tableState.columnSearch["warrantyActivatedAt"] ||
            tableState.columnFilters["warrantyActivatedAt"]?.length,
          )}
          fetchOptions={async (params) => {
            const all = [
              { label: "Đang bảo hành", value: "ACTIVE" },
              { label: "Hết bảo hành", value: "EXPIRED" },
              { label: "Chưa kích hoạt", value: "NOT_ACTIVATED" },
            ];
            const filtered = params.search
              ? all.filter((x) =>
                  x.label.toLowerCase().includes(params.search.toLowerCase()),
                )
              : all;
            return { items: filtered, total: filtered.length, next: null };
          }}
        />
      ),
      cell: (row: any) => {
        if (!row.warrantyActivatedAt)
          return (
            <div className="w-full flex justify-center">
              <Tooltip content={t("Chưa kích hoạt")}>
                <Badge
                  variant="secondary"
                  className="w-[110px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("Chưa kích hoạt")}
                </Badge>
              </Tooltip>
            </div>
          );
        const isActive =
          !row.warrantyEndDate || new Date(row.warrantyEndDate) >= new Date();
        return (
          <div className="flex flex-col items-center gap-0.5">
            <Tooltip
              content={isActive ? t("Đang bảo hành") : t("Hết bảo hành")}
            >
              <Badge
                variant={isActive ? "default" : "destructive"}
                className="w-[110px] inline-flex items-center justify-center text-center truncate"
              >
                {isActive ? t("Đang bảo hành") : t("Hết bảo hành")}
              </Badge>
            </Tooltip>
            <span className="text-[11px] text-muted-foreground">
              Đến:{" "}
              {row.warrantyEndDate
                ? format(new Date(row.warrantyEndDate), "dd/MM/yyyy")
                : "-"}
            </span>
          </div>
        );
      },
    },
    {
      key: "dealerName",
      size: 180,
      enableResizing: true,
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Đại lý")}
          columnKey="dealerName"
          sortState={getSortState("dealerName") || "none"}
          onSortChange={(s) => tableState.setSort("dealerName", s)}
          searchValue={tableState.columnSearch["dealerName"] || ""}
          onSearchChange={(v) => tableState.setColumnSearch("dealerName", v)}
          selectedFilters={tableState.columnFilters["dealerName"] || []}
          onFilterChange={(v) => tableState.setColumnFilter("dealerName", v)}
          fetchOptions={fetchAfterSalesColumnOptions}
          isActive={Boolean(
            tableState.columnSearch["dealerName"] ||
            tableState.columnFilters["dealerName"]?.length,
          )}
        />
      ),
      cell: (row: any) => row.dealerName || "-",
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate<any>
        title={t("Hậu mãi & Bảo hành")}
        desc={t("Quản lý thông tin bảo hành và vòng đời sản phẩm.")}
        icon={<Shield className="w-5 h-5" />}
        tableId="after-sales-table"
        items={data}
        columns={columns}
        getRowKey={(row: any) => row.lifecycleId}
        loading={loading || isFetching}
        emptyLabel={t("Không có dữ liệu")}
        activeFilterCount={activeFilterCount}
        onClearAllFilters={handleClearAllFilters}
        sortArray={
          tableState.sorts.length > 0
            ? tableState.sorts.map((s) => (s.startsWith("-") ? s : s))
            : []
        }
        onSort={(key) => tableState.toggleSort(key)}
        minWidth={1000}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={Math.ceil(total / pageSize)}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRefresh={() => fetchList()}
        filterConfig={filterConfig}
        filter={filter}
        rowActions={rowActions}
      />

      <AfterSalesDrawer
        open={isOpen && type === "after-sales"}
        onClose={closeDrawer}
        mode={mode as "view" | "edit"}
        data={entityData}
        onSaved={fetchList}
        onToggleEdit={() => {
          openDrawer(
            "after-sales",
            mode === "view" ? "edit" : "view",
            entityData.lifecycleId,
            entityData,
          );
        }}
        dealerOptions={dealerOptions}
        setDealerSearch={setDealerSearch}
        fetchNextDealers={fetchNextDealers}
        loadingDealers={loadingDealers}
      />

      <SoPreviewDrawer
        open={!!previewSoNo}
        onClose={() => setPreviewSoNo(null)}
        soNo={previewSoNo || ""}
      />
    </>
  );
}
