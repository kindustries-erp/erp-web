import { useMemo } from "react";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { garageApi } from "@/modules/garage/api/garageApi";
import type {
  CustomerDebtItem,
  useGarageCustomersList,
} from "@/modules/garage/hooks/useGarageCustomersList";
import { createBaseColumns } from "./GarageDebtsTable.baseColumns";
import { createAgingColumns } from "./GarageDebtsTable.agingColumns";

interface UseGarageDebtsColumnsProps {
  listHook: ReturnType<typeof useGarageCustomersList>;
  selectedBranchId?: string | null;
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail: (customer: {
    code: string;
    name: string;
    licensePlate?: string;
  }) => void;
}

export function useGarageDebtsColumns({
  listHook,
  selectedBranchId,
  t,
  onOpenCustomerDetail,
}: UseGarageDebtsColumnsProps): DataTableColumn<CustomerDebtItem>[] {
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
      const res = await garageApi.getCustomersDebtColumnOptions(
        selectedBranchId || undefined,
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((it: any) =>
          typeof it === "object" && it && "value" in it
            ? { label: it.label || it.value, value: it.value }
            : { label: String(it), value: String(it) },
        ),
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

  return useMemo<DataTableColumn<CustomerDebtItem>[]>(
    () => [
      ...createBaseColumns({
        createFilterProps,
        getSortState,
        listHook,
        t,
        onOpenCustomerDetail,
      }),
      ...createAgingColumns({ createFilterProps, t }),
    ],
    [listHook, selectedBranchId, t, onOpenCustomerDetail],
  );
}
