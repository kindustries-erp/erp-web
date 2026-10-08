import { useMemo } from "react";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { garageApi } from "@/modules/garage/api/garageApi";
import type {
  SupplierDebtItem,
  useGarageSuppliersList,
} from "@/modules/garage/hooks/useGarageSuppliersList";
import { createBaseColumns } from "./GaragePayablesTable.baseColumns";
import { createAgingColumns } from "./GaragePayablesTable.agingColumns";

interface UseGaragePayablesColumnsProps {
  listHook: ReturnType<typeof useGarageSuppliersList>;
  selectedBranchId?: string | null;
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail?: (customer: { code: string; name: string }) => void;
  onOpenSupplierDetail?: (supplier: {
    id: string;
    code: string;
    name: string;
  }) => void;
}

export function useGaragePayablesColumns({
  listHook,
  selectedBranchId,
  t,
  onOpenCustomerDetail,
  onOpenSupplierDetail,
}: UseGaragePayablesColumnsProps): DataTableColumn<SupplierDebtItem>[] {
  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (listHook.sorts.includes(key)) return "asc";
    if (listHook.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const createFilterProps = (columnKey: string, queryPrefix: string) => ({
    columnKey,
    queryKeyPrefix: queryPrefix,
    allFilters: listHook.columnFilters,
    fetchOptions: async ({ search, pageParam, filtersStr }: any) => {
      const res = await garageApi.getSuppliersDebtColumnOptions(
        selectedBranchId || "",
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((it: string) => ({ label: it, value: it })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    sortState: getSortState(columnKey),
    onSortChange: (s: any) => listHook.setSort(columnKey, s),
    searchValue: listHook.columnSearch[columnKey] || "",
    onSearchChange: (v: string) => listHook.setColumnSearch(columnKey, v),
    selectedFilters: listHook.columnFilters[columnKey] || [],
    onFilterChange: (v: string[]) => listHook.setColumnFilter(columnKey, v),
    isActive: Boolean(
      listHook.columnFilters[columnKey]?.length ||
      listHook.columnSearch[columnKey],
    ),
    enableSelectAllMatching: true,
  });

  return useMemo<DataTableColumn<SupplierDebtItem>[]>(
    () => [
      ...createBaseColumns({
        createFilterProps,
        getSortState,
        listHook,
        t,
        onOpenCustomerDetail,
        onOpenSupplierDetail,
      }),
      ...createAgingColumns({ createFilterProps, t }),
    ],
    [listHook, selectedBranchId, t, onOpenCustomerDetail, onOpenSupplierDetail],
  );
}
