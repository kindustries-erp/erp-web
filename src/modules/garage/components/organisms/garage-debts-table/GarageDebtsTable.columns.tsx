import React, { useMemo } from "react";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
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
  branches?: any[];
  t: (key: string, fallback: string) => string;
  onOpenCustomerDetail: (customer: { code: string; name: string }) => void;
}

export function useGarageDebtsColumns({
  listHook,
  selectedBranchId,
  branches,
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
      {
        key: "latestDate",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.latestDate", "Ngày gần nhất")}
            sortState={getSortState("latestDate")}
            onSortChange={(s) => listHook.setSort("latestDate", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(listHook.dateFrom || listHook.dateTo)}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.dateFrom || ""}
                dateTo={listHook.dateTo || ""}
                onChange={(from, to) => listHook.setDateRange(from, to)}
                onClose={close}
              />
            )}
          />
        ),
        size: 140,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableDateCell
            date={row.latestDate || ""}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "branchName",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.branchName", "Chi nhánh")}
            {...createFilterProps("branchName", "garage-branch-options")}
            formatOptionLabel={(val: string) => {
              const b = branches?.find((br: any) => br.externalId === val);
              return b?.name || val;
            }}
            showBlankOption={true}
            align="center"
          />
        ),
        size: 180,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const b = branches?.find(
            (br: any) => br.externalId === row.branchExternalId,
          );
          return (
            <span className="truncate text-muted-foreground text-xs font-medium">
              {b?.name || row.branchExternalId || "—"}
            </span>
          );
        },
      },
    ],
    [listHook, selectedBranchId, branches, t, onOpenCustomerDetail],
  );
}
