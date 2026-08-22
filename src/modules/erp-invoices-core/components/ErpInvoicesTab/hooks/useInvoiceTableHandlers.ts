import { useCallback } from "react";
import { format, isValid } from "date-fns";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";

export interface UseInvoiceTableHandlersOptions {
  direction: "IN" | "OUT";
  branches: Array<{ value: string; label: string }>;
  listHook: ReturnType<typeof useErpInvoicesList>;
}

const TAX_TAB_TO_STATUS: Record<string, string[]> = {
  all: [],
  new: ["1"],
  replacement: ["2", "4"],
  adjustment: ["3", "5"],
};

export function useInvoiceTableHandlers({
  direction,
  branches,
  listHook,
}: UseInvoiceTableHandlersOptions) {
  const getSortState = useCallback(
    (key: string) => {
      if (listHook.tableState.sorts.includes(key)) return "asc";
      if (listHook.tableState.sorts.includes(`-${key}`)) return "desc";
      return "none";
    },
    [listHook.tableState.sorts],
  );

  const handleSortChange = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      listHook.tableState.setSort(key, state);
      listHook.setPage(1);
    },
    [listHook],
  );

  const handleSearchChange = useCallback(
    (key: string, val: string) => {
      listHook.tableState.setColumnSearch(key, val);
      listHook.setPage(1);
    },
    [listHook],
  );

  const handleFilterChange = useCallback(
    (key: string, vals: string[]) => {
      listHook.tableState.setColumnFilter(key, vals);
      listHook.setPage(1);
    },
    [listHook],
  );

  const fetchInvoiceOptions = useCallback(
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
      let mergedFilters: Record<string, any> = {};
      if (filtersStr) {
        try {
          mergedFilters = JSON.parse(filtersStr);
        } catch {
          mergedFilters = {};
        }
      }
      const taxStatusList = TAX_TAB_TO_STATUS[listHook.activeTaxTab || "all"];
      if (
        taxStatusList &&
        taxStatusList.length > 0 &&
        !mergedFilters.taxInvoiceStatus
      ) {
        mergedFilters.taxInvoiceStatus = taxStatusList;
      }
      const effectiveFiltersStr =
        Object.keys(mergedFilters).length > 0
          ? JSON.stringify(mergedFilters)
          : undefined;

      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        effectiveFiltersStr,
        direction,
      );
      return {
        items: res.items.map((i: any) => {
          const valStr =
            typeof i === "object" ? String(i.value || i.id || i) : String(i);
          let labelStr =
            typeof i === "object"
              ? String(i.label || i.name || valStr)
              : String(i);
          if (columnKey === "branchId") {
            const branch = branches.find((b) => b.value === valStr);
            if (branch) {
              const parts = branch.label.split(" — ");
              labelStr = parts.length > 1 ? parts[1] : branch.label;
            }
          }
          if (columnKey === "invoiceDate" && valStr) {
            const dateVal = valStr.substring(0, 10);
            try {
              const parsed = new Date(dateVal);
              const label = isValid(parsed)
                ? format(parsed, "dd-MM-yyyy")
                : dateVal;
              return { label, value: dateVal };
            } catch {
              return { label: valStr, value: valStr };
            }
          }
          return { label: labelStr, value: valStr };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [direction, branches, listHook.activeTaxTab],
  );

  const buildExportBaseQuery =
    useCallback((): Partial<ErpInvoiceListParams> => {
      const { search, status, custom } = listHook.filterPanel.state;
      return {
        direction,
        search: search || undefined,
        seller_name: custom?.seller_name || undefined,
        buyer_name: custom?.buyer_name || undefined,
        status: status || undefined,
        tag_id: (custom?.tag_id as string) || undefined,
        sort_by: listHook.sortBy || undefined,
        sort_order: listHook.sortOrder || undefined,
        column_search:
          Object.keys(listHook.tableState.columnSearch).length > 0
            ? JSON.stringify(listHook.tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(listHook.tableState.columnFilters).length > 0
            ? JSON.stringify(listHook.tableState.columnFilters)
            : undefined,
      };
    }, [
      direction,
      listHook.filterPanel.state,
      listHook.sortBy,
      listHook.sortOrder,
      listHook.tableState.columnFilters,
      listHook.tableState.columnSearch,
    ]);

  return {
    getSortState,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
    fetchInvoiceOptions,
    buildExportBaseQuery,
  };
}
