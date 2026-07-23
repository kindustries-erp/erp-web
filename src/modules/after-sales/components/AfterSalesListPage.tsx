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
import { Shield, Eye, Copy, Check } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useAfterSalesQuery } from "../hooks/useAfterSalesQuery";
import { SoPreviewDrawer } from "@/modules/sales-orders-core/components/SoPreviewDrawer";
import { Button } from "@/shared/components/ui/Button";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";

export function AfterSalesListPage() {
  const t = useT();

  const CopyIconBtn = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="opacity-0 group-hover:opacity-100 hover:text-gray-900 transition-opacity p-1"
        title={copied ? t("Đã copy") : t("Copy")}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    );
  };

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
      search: { placeholder: t("Tìm theo serial, khách hàng...") },
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
    refetch: fetchList,
  } = useAfterSalesQuery({
    page,
    pageSize,
    search: filter.state.search,
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

  // handleSort removed in favor of tableState

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

  const columns = [
    {
      key: "expectedDeliveryDate",
      size: 150,
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
        />
      ),
      size: 170,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group">
          <Button
            variant="link"
            onClick={() => handleRowClick(row)}
            className="font-medium text-primary hover:underline p-0 h-auto flex-1 truncate justify-start"
          >
            {row.serialNo || "-"}
          </Button>
          {row.serialNo && <CopyIconBtn text={row.serialNo} />}
        </div>
      ),
    },
    {
      key: "vinNo",
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
        />
      ),
      size: 170,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group">
          <span className="font-medium text-gray-800 flex-1 truncate">
            {row.vinNo || "-"}
          </span>
          {row.vinNo && <CopyIconBtn text={row.vinNo} />}
        </div>
      ),
    },
    {
      key: "engineNo",
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
        />
      ),
      size: 170,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group">
          <span className="font-medium text-gray-800 flex-1 truncate">
            {row.engineNo || "-"}
          </span>
          {row.engineNo && <CopyIconBtn text={row.engineNo} />}
        </div>
      ),
    },
    {
      key: "soNo",
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
        />
      ),
      cell: (row: any) => {
        if (!row.soNo) return "—";
        return (
          <Button
            variant="link"
            onClick={() => setPreviewSoNo(row.soNo || null)}
            className="text-primary hover:underline p-0 h-auto"
          >
            {row.soNo}
          </Button>
        );
      },
    },
    {
      key: "trackingAttributes",
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
        />
      ),
      size: 250,
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
          return <span className="text-gray-400">Chưa kích hoạt</span>;
        const isActive =
          !row.warrantyEndDate || new Date(row.warrantyEndDate) >= new Date();
        return (
          <div className="flex flex-col">
            <span className={isActive ? "text-green-600" : "text-red-600"}>
              {isActive ? "Đang bảo hành" : "Hết bảo hành"}
            </span>
            <span className="text-xs text-muted-foreground">
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
        loading={loading}
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
        onRefresh={fetchList}
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
