import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, RefreshCw, DownloadCloud } from "lucide-react";
import api from "@/core/api/axiosInstance";
import { DataTableColumn } from "@/shared/components/DataTable";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { FilterButton } from "@/shared/components/FilterPanel";
import { TableText } from "@/shared/components/DataTable/TableText";
import { VinfastPartsStockDetailDrawer } from "./VinfastPartsStockDetailDrawer";
import { VinfastPartsSyncDrawer } from "./VinfastPartsSyncDrawer";

interface VinfastPartsStockTemplateProps {
  vehicleType: "oto" | "xemay";
  title: string;
  description?: string;
}

export function VinfastPartsStockTemplate({
  vehicleType,
  title,
  description,
}: VinfastPartsStockTemplateProps) {
  const { t } = useTranslation(["reports", "common"]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const tableState = useTableColumnState(`vinfast-parts-stock-${vehicleType}`);

  const activeSort = tableState.sorts[0] || "";
  let sortBy = "";
  let sortOrder = "";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "qtyBalance";
    sortOrder = "desc";
  }

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

  const fetchColumnOptions = useCallback(
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
      const parsedFilters = filtersStr ? JSON.parse(filtersStr) : {};
      const res = await api.get("/api/v1/vinfast-parts/stock/column-options", {
        params: {
          columnKey,
          search,
          page: pageParam,
          limit: 20,
          filters: JSON.stringify(parsedFilters),
          vehicleType: vehicleType === "oto" ? "CAR" : "MOTORBIKE",
        },
      });
      return {
        items: res.data.items.map((i: any) => ({
          label: i != null ? String(i) : "(Trống)",
          value: i != null ? String(i) : "",
        })),
        total: res.data.total,
        next: res.data.page < res.data.totalPages ? res.data.page + 1 : null,
      };
    },
    [vehicleType],
  );

  const commonFilterProps = useMemo(
    () => ({
      enableSelectAllMatching: true,
      queryKeyPrefix: `vinfast-parts-stock-options-${vehicleType}`,
      allFilters: tableState.columnFilters,
      fetchOptions: fetchColumnOptions,
    }),
    [tableState.columnFilters, fetchColumnOptions, vehicleType],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "vinfast-parts-stock",
      vehicleType,
      page,
      pageSize,
      sortBy,
      sortOrder,
      tableState.columnSearch,
      tableState.columnFilters,
      tableState.sorts,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("vehicleType", vehicleType);

      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortDir", sortOrder);
      if (tableState.sorts.length > 0)
        params.append("sorts", JSON.stringify(tableState.sorts));
      if (Object.keys(tableState.columnSearch).length > 0)
        params.append("column_search", JSON.stringify(tableState.columnSearch));
      if (Object.keys(tableState.columnFilters).length > 0)
        params.append(
          "column_filters",
          JSON.stringify(tableState.columnFilters),
        );

      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      const res = await api.get(`/api/v1/vinfast-parts/stock?${params}`);
      return res.data;
    },
  });

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        key: "actions",
        header: "",
        size: 48,
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                groupLabel: t("actionGroup.search", "TRA CỨU"),
                items: [
                  {
                    label: t("action.viewDetails", "Chi tiết"),
                    icon: <Eye className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setCatalogData(row);
                      setSelectedSku(row.sku);
                    },
                  },
                ],
              },
            ]}
          />
        ),
      },
      {
        key: "sku",
        header: (
          <TableColumnHeaderFilter
            title={t("Mã phụ tùng", "Part SKU")}
            sortState={getSortState("sku")}
            onSortChange={(state) => handleSortChange("sku", state)}
            searchValue={tableState.columnSearch["sku"] || ""}
            onSearchChange={(val) => handleSearchChange("sku", val)}
            selectedFilters={tableState.columnFilters["sku"] || []}
            onFilterChange={(vals) => handleFilterChange("sku", vals)}
            align="center"
            columnKey="sku"
            {...commonFilterProps}
          />
        ),
        size: 200,
        headerClassName: "text-center",
        cell: (row) => (
          <TableText
            text={row.sku}
            enableCopy={true}
            onDrawerClick={(e) => {
              e.stopPropagation();
              setCatalogData(row);
              setSelectedSku(row.sku);
            }}
          />
        ),
      },
      {
        key: "name",
        header: (
          <TableColumnHeaderFilter
            title={t("Tên phụ tùng", "Part Name")}
            sortState={getSortState("name")}
            onSortChange={(state) => handleSortChange("name", state)}
            searchValue={tableState.columnSearch["name"] || ""}
            onSearchChange={(val) => handleSearchChange("name", val)}
            selectedFilters={tableState.columnFilters["name"] || []}
            onFilterChange={(vals) => handleFilterChange("name", vals)}
            align="center"
            columnKey="name"
            {...commonFilterProps}
          />
        ),
        size: 300,
        headerClassName: "text-center",
        cell: (row) => (
          <div className="truncate w-full max-w-[280px]" title={row.name || ""}>
            {row.name || "—"}
          </div>
        ),
      },
      {
        key: "uom",
        header: (
          <TableColumnHeaderFilter
            title={t("ĐVT", "UOM")}
            sortState={getSortState("uom")}
            onSortChange={(state) => handleSortChange("uom", state)}
            searchValue={tableState.columnSearch["uom"] || ""}
            onSearchChange={(val) => handleSearchChange("uom", val)}
            selectedFilters={tableState.columnFilters["uom"] || []}
            onFilterChange={(vals) => handleFilterChange("uom", vals)}
            align="center"
            columnKey="uom"
            {...commonFilterProps}
          />
        ),
        size: 100,
        className: "text-center",
        headerClassName: "text-center",
        cell: (row) => row.uom || "—",
      },
      {
        key: "qtyIn",
        header: (
          <TableColumnHeaderFilter
            title={t("Tổng Nhập", "Total IN")}
            sortState={getSortState("qtyIn")}
            onSortChange={(state) => handleSortChange("qtyIn", state)}
            searchValue={tableState.columnSearch["qtyIn"] || ""}
            onSearchChange={(val) => handleSearchChange("qtyIn", val)}
            selectedFilters={tableState.columnFilters["qtyIn"] || []}
            onFilterChange={(vals) => handleFilterChange("qtyIn", vals)}
            align="center"
            columnKey="qtyIn"
            {...commonFilterProps}
          />
        ),
        size: 120,
        className: "text-right font-medium text-emerald-700",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyIn).toLocaleString(),
      },
      {
        key: "qtyOut",
        header: (
          <TableColumnHeaderFilter
            title={t("Tổng Xuất", "Total OUT")}
            sortState={getSortState("qtyOut")}
            onSortChange={(state) => handleSortChange("qtyOut", state)}
            searchValue={tableState.columnSearch["qtyOut"] || ""}
            onSearchChange={(val) => handleSearchChange("qtyOut", val)}
            selectedFilters={tableState.columnFilters["qtyOut"] || []}
            onFilterChange={(vals) => handleFilterChange("qtyOut", vals)}
            align="center"
            columnKey="qtyOut"
            {...commonFilterProps}
          />
        ),
        size: 120,
        className: "text-right font-medium text-rose-700",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyOut).toLocaleString(),
      },
      {
        key: "qtyBalance",
        header: (
          <TableColumnHeaderFilter
            title={t("Tồn cuối", "Balance")}
            sortState={getSortState("qtyBalance")}
            onSortChange={(state) => handleSortChange("qtyBalance", state)}
            searchValue={tableState.columnSearch["qtyBalance"] || ""}
            onSearchChange={(val) => handleSearchChange("qtyBalance", val)}
            selectedFilters={tableState.columnFilters["qtyBalance"] || []}
            onFilterChange={(vals) => handleFilterChange("qtyBalance", vals)}
            align="center"
            columnKey="qtyBalance"
            {...commonFilterProps}
          />
        ),
        size: 120,
        className: "text-right font-bold text-slate-800",
        headerClassName: "text-right",
        cell: (row) => Number(row.qtyBalance).toLocaleString(),
      },
    ],
    [
      t,
      tableState,
      commonFilterProps,
      getSortState,
      handleSortChange,
      handleSearchChange,
      handleFilterChange,
    ],
  );

  return (
    <>
      <SpreadsheetPageTemplate
        tableId={`vinfast-parts-stock-${vehicleType}`}
        title={title}
        desc={description}
        icon={<FileText className="w-5 h-5 text-gray-500" />}
        activeFilterCount={tableState.activeFilterCount}
        onClearAllFilters={() => tableState.resetFilters()}
        createLabel={t("action.create", "Tạo mới")}
        createActions={[
          {
            groupLabel: t("actionGroup.system", "HỆ THỐNG"),
            items: [
              {
                label: t("action.syncLedger", "Đồng bộ sổ cái"),
                icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
                onClick: () => {
                  setSyncDrawerOpen(true);
                },
              },
            ],
          },
          {
            groupLabel: t("actionGroup.search", "TRA CỨU"),
            items: [
              {
                label: t("action.downloadReport", "Tải bảng kê"),
                icon: <DownloadCloud className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  alert("Tính năng đang phát triển");
                },
              },
            ],
          },
        ]}
        extraActions={
          tableState.activeFilterCount > 0 ? (
            <FilterButton
              onClick={() => {}}
              activeCount={tableState.activeFilterCount}
              onClear={() => tableState.resetFilters()}
            />
          ) : null
        }
        items={data?.data || []}
        columns={columns}
        loading={isLoading || isFetching}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={data?.totalPages || 0}
        onPage={setPage}
        onPageSize={setPageSize}
        getRowKey={(row: any) => row.sku}
      />

      <VinfastPartsStockDetailDrawer
        open={!!selectedSku}
        onClose={() => {
          setSelectedSku(null);
          setCatalogData(null);
        }}
        sku={selectedSku || ""}
        catalogData={catalogData}
      />

      <VinfastPartsSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
      />
    </>
  );
}
