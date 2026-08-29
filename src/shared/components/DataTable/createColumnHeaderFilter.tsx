import React from "react";
import {
  TableColumnHeaderFilter,
  type TableColumnHeaderFilterProps,
} from "./TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "./DateRangeColumnSlot";

export interface TableListHookLike {
  sorts: string[];
  setSort: (key: string, state: "asc" | "desc" | "none") => void;
  columnFilters: Record<string, string[]>;
  setColumnFilter: (key: string, vals: string[]) => void;
  columnSearch: Record<string, string>;
  setColumnSearch: (key: string, val: string) => void;
  dateFrom?: string;
  dateTo?: string;
  setDateRange?: (from?: string, to?: string) => void;
  [key: string]: any;
}

export interface CreateColumnHeaderFilterConfig<T = any> {
  listHook: TableListHookLike;
  items?: T[];
  queryKeyPrefix?: string;
  fetchOptions?: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    pageSize?: number;
    filtersStr?: string;
  }) => Promise<{
    items: { label: string; value: string }[];
    total: number;
    next: number | null;
  }>;
  defaultAlign?: "left" | "center" | "right";
}

export interface ColumnHeaderOptions {
  align?: "left" | "center" | "right";
  className?: string;
  hideFilter?: boolean;
  hideSort?: boolean;
  hideFooter?: boolean;
  showBlankOption?: boolean;
  formatOptionLabel?: (label: string) => string;
  enableSelectAllMatching?: boolean;
  fetchOptions?: TableColumnHeaderFilterProps["fetchOptions"];
  filterOptions?: { label: string; value: string }[];
  queryKeyPrefix?: string;
}

export interface NumericColumnHeaderOptions extends ColumnHeaderOptions {
  currencySymbol?: string;
  decimals?: number;
  isCurrency?: boolean;
}

export interface ClientColumnHeaderOptions extends ColumnHeaderOptions {
  filterOptions?: { label: string; value: string }[];
}

export interface DateColumnHeaderOptions {
  align?: "left" | "center" | "right";
  className?: string;
  hideSort?: boolean;
  dateFromField?: string;
  dateToField?: string;
}

export interface ColumnFilterBuilder {
  (
    columnKey: string,
    title: React.ReactNode,
    options?: ColumnHeaderOptions,
  ): React.ReactNode;
  server: (
    columnKey: string,
    title: React.ReactNode,
    options?: ColumnHeaderOptions,
  ) => React.ReactNode;
  date: (
    columnKey: string,
    title: React.ReactNode,
    options?: DateColumnHeaderOptions,
  ) => React.ReactNode;
  month: (
    columnKey: string,
    title: React.ReactNode,
    options?: ColumnHeaderOptions,
  ) => React.ReactNode;
  numeric: (
    columnKey: string,
    title: React.ReactNode,
    options?: NumericColumnHeaderOptions,
  ) => React.ReactNode;
  amount: (
    columnKey: string,
    title: React.ReactNode,
    options?: NumericColumnHeaderOptions,
  ) => React.ReactNode;
  qty: (
    columnKey: string,
    title: React.ReactNode,
    options?: NumericColumnHeaderOptions,
  ) => React.ReactNode;
  client: (
    columnKey: string,
    title: React.ReactNode,
    options?: ClientColumnHeaderOptions,
  ) => React.ReactNode;
  simple: (
    columnKey: string,
    title: React.ReactNode,
    options?: { align?: "left" | "center" | "right"; className?: string },
  ) => React.ReactNode;
}

/**
 * Format a number/string label to a localized string with thousands separators
 */
export function formatNumericLabel(
  label: string,
  currencySymbol = "",
  decimals?: number,
): string {
  if (label === "(blank)" || label === "__BLANK__" || !label) return label;
  const num = Number(label);
  if (Number.isNaN(num)) return label;

  const formatted =
    typeof decimals === "number"
      ? num.toLocaleString("vi-VN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : num.toLocaleString("vi-VN");

  return currencySymbol ? `${formatted} ${currencySymbol}` : formatted;
}

/**
 * Format YYYY-MM label to "Tháng MM/YYYY"
 */
export function formatMonthLabel(label: string): string {
  if (!label) return label;
  const parts = label.split("-");
  if (parts.length === 2) {
    return `Tháng ${parts[1]}/${parts[0]}`;
  }
  return label;
}

/**
 * Extract distinct values from client items array
 */
export function extractUniqueOptions(
  items: any[] | undefined,
  columnKey: string,
  formatOptionLabel?: (label: string) => string,
): { label: string; value: string }[] {
  if (!items || items.length === 0) return [];
  const set = new Set<string>();

  items.forEach((item) => {
    const val = item?.[columnKey];
    if (val !== undefined && val !== null && val !== "") {
      set.add(String(val));
    }
  });

  const arr = Array.from(set);
  arr.sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b, "vi-VN");
  });

  return arr.map((val) => ({
    value: val,
    label: formatOptionLabel ? formatOptionLabel(val) : val,
  }));
}

/**
 * Factory creating a type-safe, 1-line column header filter builder
 */
export function createColumnHeaderFilter<T = any>(
  config: CreateColumnHeaderFilterConfig<T>,
): ColumnFilterBuilder {
  const {
    listHook,
    items,
    queryKeyPrefix,
    fetchOptions: globalFetchOptions,
    defaultAlign = "center",
  } = config;

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (listHook.sorts?.includes(key)) return "asc";
    if (listHook.sorts?.includes(`-${key}`)) return "desc";
    return "none";
  };

  const baseRender = (
    columnKey: string,
    title: React.ReactNode,
    options: ColumnHeaderOptions = {},
  ): React.ReactNode => {
    const selected = listHook.columnFilters?.[columnKey] || [];
    const search = listHook.columnSearch?.[columnKey] || "";
    const isActive = Boolean(selected.length > 0 || search.trim().length > 0);

    const isServer = Boolean(options.fetchOptions || globalFetchOptions);
    const clientOptions =
      !isServer &&
      (options.filterOptions ||
        (items
          ? extractUniqueOptions(items, columnKey, options.formatOptionLabel)
          : undefined));

    return (
      <TableColumnHeaderFilter
        title={title}
        columnKey={columnKey}
        queryKeyPrefix={options.queryKeyPrefix || queryKeyPrefix}
        allFilters={listHook.columnFilters}
        fetchOptions={
          isServer ? options.fetchOptions || globalFetchOptions : undefined
        }
        filterOptions={clientOptions || undefined}
        sortState={getSortState(columnKey)}
        onSortChange={(state) => listHook.setSort(columnKey, state)}
        searchValue={search}
        onSearchChange={(val) => listHook.setColumnSearch(columnKey, val)}
        selectedFilters={selected}
        onFilterChange={(vals) => listHook.setColumnFilter(columnKey, vals)}
        isActive={isActive}
        align={options.align || defaultAlign}
        className={options.className}
        hideFilter={options.hideFilter}
        hideSort={options.hideSort}
        hideFooter={options.hideFooter}
        showBlankOption={options.showBlankOption}
        formatOptionLabel={options.formatOptionLabel}
        enableSelectAllMatching={options.enableSelectAllMatching}
      />
    );
  };

  const builder: any = (
    columnKey: string,
    title: React.ReactNode,
    options?: ColumnHeaderOptions,
  ) => {
    return baseRender(columnKey, title, options);
  };

  builder.server = (
    columnKey: string,
    title: React.ReactNode,
    options?: ColumnHeaderOptions,
  ) => {
    return baseRender(columnKey, title, options);
  };

  builder.date = (
    columnKey: string,
    title: React.ReactNode,
    options?: DateColumnHeaderOptions,
  ) => {
    const isActive = Boolean(listHook.dateFrom || listHook.dateTo);

    return (
      <TableColumnHeaderFilter
        title={title}
        sortState={getSortState(columnKey)}
        onSortChange={(s) => listHook.setSort(columnKey, s)}
        searchValue=""
        onSearchChange={() => {}}
        selectedFilters={[]}
        onFilterChange={() => {}}
        hideFilter={true}
        hideFooter={true}
        hideSort={options?.hideSort}
        isActive={isActive}
        align={options?.align || defaultAlign}
        className={options?.className}
        dateRangeSlot={({ close }) => (
          <DateRangeColumnSlot
            dateFrom={listHook.dateFrom || ""}
            dateTo={listHook.dateTo || ""}
            onChange={(from, to) => {
              if (listHook.setDateRange) {
                listHook.setDateRange(from, to);
              }
            }}
            onClose={close}
          />
        )}
      />
    );
  };

  builder.month = (
    columnKey: string,
    title: React.ReactNode,
    options?: DateColumnHeaderOptions,
  ) => {
    const isActive = Boolean(listHook.dateFrom || listHook.dateTo);

    return (
      <TableColumnHeaderFilter
        title={title}
        sortState={getSortState(columnKey)}
        onSortChange={(s) => listHook.setSort(columnKey, s)}
        searchValue=""
        onSearchChange={() => {}}
        selectedFilters={[]}
        onFilterChange={() => {}}
        hideFilter={true}
        hideFooter={true}
        hideSort={options?.hideSort}
        isActive={isActive}
        align={options?.align || defaultAlign}
        className={options?.className}
        dateRangeSlot={({ close }) => (
          <DateRangeColumnSlot
            dateFrom={listHook.dateFrom || ""}
            dateTo={listHook.dateTo || ""}
            onChange={(from, to) => {
              if (listHook.setDateRange) {
                listHook.setDateRange(from, to);
              }
            }}
            onClose={close}
          />
        )}
      />
    );
  };

  builder.numeric = (
    columnKey: string,
    title: React.ReactNode,
    options: NumericColumnHeaderOptions = {},
  ) => {
    const { currencySymbol, decimals, isCurrency, formatOptionLabel, ...rest } =
      options;
    const finalCurrency =
      currencySymbol ?? (isCurrency === true ? "đ" : undefined);

    const customFormatter =
      formatOptionLabel ||
      ((label: string) => formatNumericLabel(label, finalCurrency, decimals));

    return baseRender(columnKey, title, {
      ...rest,
      formatOptionLabel: customFormatter,
    });
  };

  builder.amount = (
    columnKey: string,
    title: React.ReactNode,
    options: NumericColumnHeaderOptions = {},
  ) => {
    return builder.numeric(columnKey, title, {
      currencySymbol: "đ",
      ...options,
    });
  };

  builder.qty = (
    columnKey: string,
    title: React.ReactNode,
    options: NumericColumnHeaderOptions = {},
  ) => {
    return builder.numeric(columnKey, title, {
      currencySymbol: undefined,
      ...options,
    });
  };

  builder.client = (
    columnKey: string,
    title: React.ReactNode,
    options: ClientColumnHeaderOptions = {},
  ) => {
    return baseRender(columnKey, title, options);
  };

  builder.simple = (
    columnKey: string,
    title: React.ReactNode,
    options?: { align?: "left" | "center" | "right"; className?: string },
  ) => {
    return (
      <TableColumnHeaderFilter
        title={title}
        sortState={getSortState(columnKey)}
        onSortChange={(state) => listHook.setSort(columnKey, state)}
        searchValue=""
        onSearchChange={() => {}}
        selectedFilters={[]}
        onFilterChange={() => {}}
        hideFilter={true}
        hideFooter={true}
        isActive={false}
        align={options?.align || defaultAlign}
        className={options?.className}
      />
    );
  };

  return builder as ColumnFilterBuilder;
}

/**
 * Options for client-side items filtering & sorting
 */
export interface FilterClientItemsOptions<T> {
  dateField?: keyof T | string;
  customExtractors?: Record<string, (item: T) => any>;
}

/**
 * Universal client-side filter and sorter for tables
 */
export function filterClientItems<T extends Record<string, any>>(
  items: T[],
  listHook: TableListHookLike,
  options?: FilterClientItemsOptions<T>,
): T[] {
  if (!items || items.length === 0) return [];

  let result = [...items];

  // 1. Filter by columnFilters
  if (listHook.columnFilters) {
    Object.entries(listHook.columnFilters).forEach(([colKey, selected]) => {
      if (selected && selected.length > 0) {
        result = result.filter((item) => {
          const rawVal = options?.customExtractors?.[colKey]
            ? options.customExtractors[colKey](item)
            : item[colKey];
          const strVal =
            rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
          return selected.includes(strVal);
        });
      }
    });
  }

  // 2. Filter by columnSearch
  if (listHook.columnSearch) {
    Object.entries(listHook.columnSearch).forEach(([colKey, search]) => {
      if (search && search.trim().length > 0) {
        const query = search.trim().toLowerCase();
        result = result.filter((item) => {
          const rawVal = options?.customExtractors?.[colKey]
            ? options.customExtractors[colKey](item)
            : item[colKey];
          const strVal =
            rawVal !== undefined && rawVal !== null
              ? String(rawVal).toLowerCase()
              : "";
          return strVal.includes(query);
        });
      }
    });
  }

  // 3. Filter by dateRange
  const dateField = (options?.dateField as string) || "label";
  if (listHook.dateFrom || listHook.dateTo) {
    result = result.filter((item) => {
      const itemDate = item[dateField];
      if (!itemDate) return true;

      // Handle YYYY-MM period vs YYYY-MM-DD
      const dateStr = String(itemDate);
      if (listHook.dateFrom) {
        const fromPrefix =
          dateStr.length === 7
            ? listHook.dateFrom.slice(0, 7)
            : listHook.dateFrom;
        if (dateStr < fromPrefix) return false;
      }
      if (listHook.dateTo) {
        const toPrefix =
          dateStr.length === 7 ? listHook.dateTo.slice(0, 7) : listHook.dateTo;
        if (dateStr > toPrefix) return false;
      }
      return true;
    });
  }

  // 4. Sort by sorts
  if (listHook.sorts && listHook.sorts.length > 0) {
    const sort = listHook.sorts[0];
    const isDesc = sort.startsWith("-");
    const field = sort.replace("-", "");

    result.sort((a, b) => {
      const valA = options?.customExtractors?.[field]
        ? options.customExtractors[field](a)
        : a[field];
      const valB = options?.customExtractors?.[field]
        ? options.customExtractors[field](b)
        : b[field];

      if (typeof valA === "string" && typeof valB === "string") {
        return isDesc
          ? valB.localeCompare(valA, "vi-VN")
          : valA.localeCompare(valB, "vi-VN");
      }
      const numA = Number(valA);
      const numB = Number(valB);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return isDesc ? numB - numA : numA - numB;
      }
      return 0;
    });
  }

  return result;
}
