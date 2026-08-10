import { useState, useMemo, useCallback } from "react";
import { StandardTable } from "@/shared/components/StandardTable";
import { money } from "@/shared/utils/format";
import api from "@/core/api/axiosInstance";
import {
  VinfastPartDashboardTableRow,
  useVinfastPartsDashboardTable,
} from "@/shared/hooks/useVinfastPartsDashboardTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";

interface Props {
  filterState: any;
  vehicleType: "CAR" | "MOTORBIKE";
  title: string;
  onRowClick?: (row: VinfastPartDashboardTableRow) => void;
}

export function VinfastPartDashboardTable({
  filterState,
  vehicleType,
  title,
  onRowClick,
}: Props) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const tableState = useTableColumnState(
    `vinfast-parts-dashboard-${vehicleType}`,
  );

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
  };

  const fetchDashboardTableOptions = useCallback(
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
      const params = new URLSearchParams();
      params.set("columnKey", columnKey);
      params.set("search", search || "");
      params.set("page", String(pageParam || 1));
      params.set("limit", "20");
      if (filtersStr) params.set("filters", filtersStr);
      if (filterState?.dateFrom) params.set("dateFrom", filterState.dateFrom);
      if (filterState?.dateTo) params.set("dateTo", filterState.dateTo);
      if (vehicleType) params.set("vehicleType", vehicleType);
      const res = await api.get(
        `/api/v1/reports/vinfast-parts-dashboard-table/column-options?${params}`,
      );
      const d = res.data as {
        items: { value: string; label: string }[];
        total: number;
        page: number;
        totalPages: number;
      };
      const NUMERIC_QTY_COLS = new Set(["qtyBought", "qtySold"]);
      const NUMERIC_AMOUNT_COLS = new Set([
        "amountBought",
        "amountSold",
        "profit",
      ]);
      const formatOptionLabel = (raw: string, col: string): string => {
        const n = parseFloat(raw);
        if (isNaN(n)) return raw;
        if (NUMERIC_QTY_COLS.has(col))
          return Math.round(n).toLocaleString("vi-VN");
        if (NUMERIC_AMOUNT_COLS.has(col))
          return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
        return raw;
      };
      return {
        items: d.items.map((item) => ({
          value: item.value,
          label: formatOptionLabel(item.value, columnKey),
        })),
        total: d.total,
        next: d.page < d.totalPages ? d.page + 1 : null,
      };
    },
    [filterState, vehicleType],
  );

  const renderTextHeaderFilter = (key: string, title: string) => (
    <TableColumnHeaderFilter
      title={title}
      align="center"
      sortState={getSortState(key)}
      onSortChange={(state) => handleSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => handleSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => handleFilterChange(key, vals)}
      columnKey={key}
      queryKeyPrefix={`vinfast-dashboard-options-${vehicleType}`}
      fetchOptions={fetchDashboardTableOptions}
      allFilters={tableState.columnFilters}
    />
  );

  const { data, isLoading } = useVinfastPartsDashboardTable(
    filterState,
    page,
    limit,
    vehicleType,
    tableState,
  );

  const columns: any[] = useMemo(
    () => [
      {
        key: "itemCode",
        header: renderTextHeaderFilter("itemCode", "Mã phụ tùng"),
        size: 200,
        enableResizing: true,
        className: "w-[200px] text-left",
        headerClassName: "w-[200px] text-left",
        cell: (row: any) => (
          <TableText
            text={row.itemCode}
            enableCopy={true}
            tooltip={true}
            onDrawerClick={(e) => {
              e.stopPropagation();
              onRowClick?.(row);
            }}
          />
        ),
      },
      {
        key: "itemName",
        header: renderTextHeaderFilter("itemName", "Tên phụ tùng"),
        className: "text-left w-full",
        headerClassName: "w-full text-left",
        cell: (row: any) => (
          <div className="text-left w-full truncate" title={row.itemName}>
            {row.itemName}
          </div>
        ),
      },
      {
        key: "qtyBought",
        header: renderTextHeaderFilter("qtyBought", "SL Mua"),
        className: "w-[100px] text-right",
        headerClassName: "w-[100px] text-right",
        cell: (row: any) => <div className="text-right">{row.qtyBought}</div>,
      },
      {
        key: "amountBought",
        header: renderTextHeaderFilter("amountBought", "Tiền Mua"),
        className: "w-[150px] text-right",
        headerClassName: "w-[150px] text-right",
        cell: (row: any) => (
          <div className="text-right text-[#ea580c]">
            {money(row.amountBought)} đ
          </div>
        ),
      },
      {
        key: "qtySold",
        header: renderTextHeaderFilter("qtySold", "SL Bán"),
        className: "w-[100px] text-right",
        headerClassName: "w-[100px] text-right",
        cell: (row: any) => <div className="text-right">{row.qtySold}</div>,
      },
      {
        key: "amountSold",
        header: renderTextHeaderFilter("amountSold", "Tiền Bán"),
        className: "w-[150px] text-right",
        headerClassName: "w-[150px] text-right",
        cell: (row: any) => (
          <div className="text-right text-[#059669]">
            {money(row.amountSold)} đ
          </div>
        ),
      },
      {
        key: "profit",
        header: renderTextHeaderFilter("profit", "Lợi nhuận"),
        className: "w-[150px] text-right",
        headerClassName: "w-[150px] text-right",
        cell: (row: any) => {
          const val = row.profit;
          return (
            <div
              className={`text-right font-semibold ${val < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {money(val)} đ
            </div>
          );
        },
      },
    ],
    [renderTextHeaderFilter, onRowClick],
  );

  const subTotalQtyBought = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.qtyBought) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalAmountBought = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.amountBought) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalQtySold = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.qtySold) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalAmountSold = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.amountSold) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalProfit = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.profit) || 0),
      0,
    );
  }, [data?.items]);

  return (
    <div className="flex flex-col h-full">
      <h4 className="font-semibold text-sm text-slate-700 mb-2">{title}</h4>
      <div className="flex-1">
        <StandardTable
          columns={columns}
          items={data?.items || []}
          getRowKey={(row: any) => row.itemCode}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          onPageSize={setLimit}
          page={page}
          pageSize={limit}
          loading={isLoading}
          minWidth={500}
          enableColumnResizing={false}
          variant="spreadsheet"
          summaryRow={{
            itemName: (
              <span className="font-semibold text-right block">Tổng</span>
            ),
            qtyBought: (
              <span className="font-semibold text-right block">
                {subTotalQtyBought}
              </span>
            ),
            amountBought: (
              <span className="text-[#ea580c] font-semibold text-right block">
                {money(subTotalAmountBought)} đ
              </span>
            ),
            qtySold: (
              <span className="font-semibold text-right block">
                {subTotalQtySold}
              </span>
            ),
            amountSold: (
              <span className="text-[#059669] font-semibold text-right block">
                {money(subTotalAmountSold)} đ
              </span>
            ),
            profit: (
              <span
                className={`text-right font-semibold block ${subTotalProfit < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {money(subTotalProfit)} đ
              </span>
            ),
          }}
        />
      </div>
    </div>
  );
}
