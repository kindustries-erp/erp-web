import * as React from "react";
import type { useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import {
  TableSortState,
  type V2DateRange,
  type V2TableQuery,
  type V2TableSort,
} from "@/v2/shared/types/v2-table";

export type InvoiceListHook = ReturnType<typeof useErpInvoicesList>;

const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const unionKeys = (a: object, b: object) => [
  ...new Set([...Object.keys(a), ...Object.keys(b)]),
];

/** Query V2 lấy từ state V1 (store theo tableId `erp-invoices-table-*`) để hydrate bảng khi mount */
export function buildInvoiceQuery(h: InvoiceListHook): V2TableQuery {
  const { dateFrom, dateTo, search } = h.filterPanel.state;
  return {
    page: h.page,
    pageSize: h.pageSize,
    sorts: h.sortBy
      ? [
          {
            columnKey: h.sortBy,
            direction:
              h.sortOrder === "desc" ? TableSortState.DESC : TableSortState.ASC,
          },
        ]
      : [],
    columnFilters: h.tableState.columnFilters,
    columnSearch: h.tableState.columnSearch,
    columnOperators: {},
    dateRanges:
      dateFrom || dateTo
        ? {
            invoiceDate: {
              from: dateFrom || undefined,
              to: dateTo || undefined,
            },
          }
        : {},
    search: search || undefined,
  };
}

function pushSort(h: InvoiceListHook, sort?: V2TableSort) {
  const current = h.tableState.sorts[0];
  const curKey = current ? current.replace(/^-/, "") : "";
  const curDir = current ? (current.startsWith("-") ? "desc" : "asc") : "none";
  const nextKey = sort?.columnKey ?? "";
  const nextDir = sort
    ? sort.direction === TableSortState.DESC
      ? "desc"
      : "asc"
    : "none";
  if (nextKey === curKey && nextDir === curDir) return;
  if (curKey) h.tableState.setSort(curKey, "none");
  if (nextKey) h.tableState.setSort(nextKey, nextDir);
}

function pushDate(h: InvoiceListHook, range?: V2DateRange) {
  const { dateFrom, dateTo } = h.filterPanel.state;
  const from = range?.from ?? "";
  const to = range?.to ?? "";
  if (from !== (dateFrom ?? "")) h.filterPanel.setDateFrom(from);
  if (to !== (dateTo ?? "")) h.filterPanel.setDateTo(to);
}

/** Đẩy query do bảng V2 phát ra vào store V1; chỉ ghi giá trị thực sự đổi để tránh vòng lặp */
function pushQueryToStore(h: InvoiceListHook, query: V2TableQuery) {
  if (query.pageSize !== h.pageSize) h.setPageSize(query.pageSize);
  if (query.page !== h.page) h.setPage(query.page);
  pushSort(h, query.sorts[0]);

  unionKeys(query.columnFilters, h.tableState.columnFilters).forEach((key) => {
    const next = query.columnFilters[key] ?? [];
    if (!sameValue(next, h.tableState.columnFilters[key] ?? [])) {
      h.tableState.setColumnFilter(key, next);
    }
  });

  unionKeys(query.columnSearch, h.tableState.columnSearch).forEach((key) => {
    const next = query.columnSearch[key] ?? "";
    if (next !== (h.tableState.columnSearch[key] ?? "")) {
      h.tableState.setColumnSearch(key, next);
    }
  });

  pushDate(h, query.dateRanges.invoiceDate);

  const search = query.search ?? "";
  if (search !== (h.filterPanel.state.search ?? "")) {
    h.filterPanel.setSearchInput(search);
  }
}

/**
 * Cầu nối giữa `V2StandardTable` (giữ state query nội bộ, chỉ đọc `initialQuery` lúc mount)
 * và `useErpInvoicesList` (nguồn sự thật của API). Khi V1 reset bộ lọc, tăng `tableKey`
 * để remount bảng V2 với query mới.
 */
export function useInvoiceV2Bridge(listHook: InvoiceListHook) {
  const latest = React.useRef(listHook);
  latest.current = listHook;
  const [tableKey, setTableKey] = React.useState(0);

  const onQueryChange = React.useCallback((query: V2TableQuery) => {
    pushQueryToStore(latest.current, query);
  }, []);

  const clearAll = React.useCallback(() => {
    latest.current.filterPanel.resetAll();
    latest.current.setPage(1);
    setTableKey((k) => k + 1);
  }, []);

  return {
    tableKey,
    initialQuery: buildInvoiceQuery(listHook),
    onQueryChange,
    clearAll,
  };
}
