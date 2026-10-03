import React from "react";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { buildGeneralColumns } from "./GarageCasesTable.general-columns";
import { buildFinancialColumns } from "./GarageCasesTable.financial-columns";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildGarageCasesColumns(ctx: ColumnContext) {
  const {
    tableState,
    onSortChange,
    onSearchChange,
    onFilterChange,
    fetchCaseColumnOptions,
  } = ctx;

  const commonOptionProps = {
    queryKeyPrefix: "garage-case-column-options",
    fetchOptions: fetchCaseColumnOptions,
    allFilters: tableState.columnFilters,
    enableSelectAllMatching: true,
  };

  const getSort = (key: string) =>
    tableState.sorts.includes(key)
      ? "asc"
      : tableState.sorts.includes(`-${key}`)
        ? "desc"
        : "none";

  const makeHdr = (
    key: string,
    title: string,
    opts: {
      align?: "left" | "center" | "right";
      hideFilter?: boolean;
      formatOptionLabel?: (val: string) => string;
      showBlankOption?: boolean;
      dateRangeSlot?: (props: { close: () => void }) => React.ReactNode;
      isActive?: boolean;
    } = {},
  ) => (
    <TableColumnHeaderFilter
      title={title}
      columnKey={key}
      sortState={getSort(key)}
      onSortChange={(state) => onSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => onSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => onFilterChange(key, vals)}
      align={opts.align || "center"}
      hideFilter={opts.hideFilter}
      formatOptionLabel={opts.formatOptionLabel}
      showBlankOption={opts.showBlankOption}
      dateRangeSlot={opts.dateRangeSlot}
      isActive={opts.isActive}
      {...(!opts.hideFilter ? commonOptionProps : {})}
    />
  );

  return [
    ...buildGeneralColumns(ctx, makeHdr),
    ...buildFinancialColumns(ctx, makeHdr),
  ];
}
