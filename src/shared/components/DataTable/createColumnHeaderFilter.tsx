import React from "react";
import {
  TableColumnHeaderFilter,
  type TableColumnHeaderFilterProps,
} from "./TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "./DateRangeColumnSlot";
import {
  TableSortState,
  TableColumnAlign,
  ColumnValueType,
  TextFilterOperator,
  NumberFilterOperator,
  type DataTableColumn,
} from "./types";

export interface ColumnFilterDescriptor {
  key: string;
  title: React.ReactNode;
  titleText: string;
  type: ColumnValueType;
  align?: TableColumnAlign | "left" | "center" | "right";
  currencySymbol?: string;
  decimals?: number;
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
  filterOptions?: { label: string; value: string }[];
  queryKeyPrefix?: string;
  formatOptionLabel?: (label: string) => string;
  hideFilter?: boolean;
  hideSort?: boolean;
  showBlankOption?: boolean;
  enableSelectAllMatching?: boolean;
  dateRangeSlot?:
    | React.ReactNode
    | ((props: { close: () => void }) => React.ReactNode);
  selectedFilters?: string[];
  searchValue?: string;
  sortState?: TableSortState | "asc" | "desc" | "none";
  onFilterChange?: (vals: string[]) => void;
  onSearchChange?: (val: string) => void;
  onSortChange?: (state: TableSortState | "asc" | "desc" | "none") => void;
  onDateRangeChange?: (from?: string, to?: string) => void;
  allFilters?: Record<string, string[]>;
}

export interface TableListHookLike {
  sorts: string[];
  setSort: (
    key: string,
    state: "asc" | "desc" | "none" | TableSortState,
  ) => void;
  columnFilters: Record<string, string[]>;
  setColumnFilter: (key: string, vals: string[]) => void;
  columnSearch: Record<string, string>;
  setColumnSearch: (key: string, val: string) => void;
  columnOperators?: Record<
    string,
    TextFilterOperator | NumberFilterOperator | string
  >;
  setColumnOperator?: (
    key: string,
    op: TextFilterOperator | NumberFilterOperator | string,
  ) => void;
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
  defaultAlign?: TableColumnAlign | "left" | "center" | "right";
}

export interface ColumnHeaderOptions {
  align?: TableColumnAlign | "left" | "center" | "right";
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
  valueType?: ColumnValueType;
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

    const hasClientOptions = Boolean(options.filterOptions);
    const isServer =
      !hasClientOptions && Boolean(options.fetchOptions || globalFetchOptions);
    const clientOptions =
      options.filterOptions ||
      (!isServer && items
        ? extractUniqueOptions(items, columnKey, options.formatOptionLabel)
        : undefined);

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
        formatOptionLabel={isServer ? options.formatOptionLabel : undefined}
        enableSelectAllMatching={options.enableSelectAllMatching ?? true}
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
 * Helper to extract plain text string from ReactNode (for searching and labeling)
 */
export function getTitlePlainText(title: React.ReactNode): string {
  if (typeof title === "string") return title;
  if (typeof title === "number") return String(title);
  if (!title) return "";
  if (React.isValidElement(title)) {
    const props = (title as any).props;
    if (typeof props?.children === "string") return props.children;
    if (Array.isArray(props?.children)) {
      return props.children.map(getTitlePlainText).join("");
    }
    if (props?.text) return String(props.text);
  }
  return "";
}

/**
 * Automatically extracts ColumnFilterDescriptor list from DataTableColumn array
 */
export function extractColumnFilterDescriptors<T = any>(
  columns: DataTableColumn<T>[],
): ColumnFilterDescriptor[] {
  if (!columns || columns.length === 0) return [];

  const descriptors: ColumnFilterDescriptor[] = [];

  columns.forEach((col) => {
    // Ignore internal columns like selection, expand, hover actions
    if (
      col.key === "__selection" ||
      col.key === "__expand" ||
      col.key === "__hover_actions" ||
      col.key === "__actions" ||
      col.key === "index"
    ) {
      return;
    }

    let titleNode: React.ReactNode =
      col.label || (typeof col.header === "function" ? col.key : col.header);
    let titleText = getTitlePlainText(titleNode) || col.key;
    let fetchOptions: ColumnFilterDescriptor["fetchOptions"] = undefined;
    let filterOptions: { label: string; value: string }[] | undefined =
      col.filterOptions;
    let dateRangeSlot: ColumnFilterDescriptor["dateRangeSlot"] = undefined;
    let queryKeyPrefix: string | undefined = undefined;
    let formatOptionLabel: ((label: string) => string) | undefined = undefined;
    let hideFilter = false;
    let hideSort = !col.sortable && !col.sortKey;
    let align: TableColumnAlign | "left" | "center" | "right" | undefined =
      undefined;

    let selectedFilters: string[] | undefined = undefined;
    let searchValue: string | undefined = undefined;
    let sortState: TableSortState | "asc" | "desc" | "none" | undefined =
      undefined;
    let onFilterChange: ((vals: string[]) => void) | undefined = undefined;
    let onSearchChange: ((val: string) => void) | undefined = undefined;
    let onSortChange:
      | ((state: TableSortState | "asc" | "desc" | "none") => void)
      | undefined = undefined;
    let onDateRangeChange: ((from?: string, to?: string) => void) | undefined =
      undefined;
    let allFilters: Record<string, string[]> | undefined = undefined;

    // Check if header is a TableColumnHeaderFilter element with props
    if (React.isValidElement(col.header)) {
      const p = (col.header as any).props || {};
      if (p.title) {
        titleNode = p.title;
        titleText = getTitlePlainText(p.title) || titleText;
      }
      if (p.fetchOptions) fetchOptions = p.fetchOptions;
      if (p.filterOptions) filterOptions = p.filterOptions;
      if (p.dateRangeSlot) dateRangeSlot = p.dateRangeSlot;
      if (p.queryKeyPrefix) queryKeyPrefix = p.queryKeyPrefix;
      if (p.formatOptionLabel) formatOptionLabel = p.formatOptionLabel;
      if (p.hideFilter !== undefined) hideFilter = p.hideFilter;
      if (p.hideSort !== undefined) hideSort = p.hideSort;
      if (p.align) align = p.align;

      if (p.selectedFilters) selectedFilters = p.selectedFilters;
      if (p.searchValue) searchValue = p.searchValue;
      if (p.sortState) sortState = p.sortState;
      if (p.onFilterChange) onFilterChange = p.onFilterChange;
      if (p.onSearchChange) onSearchChange = p.onSearchChange;
      if (p.onSortChange) onSortChange = p.onSortChange;
      if (p.onDateRangeChange) onDateRangeChange = p.onDateRangeChange;
      if (p.allFilters) allFilters = p.allFilters;
    }

    // Infer ColumnValueType
    let type: ColumnValueType = ColumnValueType.TEXT;
    const keyLower = col.key.toLowerCase();
    const valTypeStr = String(col.valueType || "").toLowerCase();

    if (
      valTypeStr === "date" ||
      dateRangeSlot ||
      keyLower.includes("date") ||
      keyLower.includes("createdat") ||
      keyLower.includes("updatedat") ||
      keyLower.includes("ngay")
    ) {
      type = ColumnValueType.DATE;
    } else if (
      valTypeStr === "number" ||
      keyLower.includes("amount") ||
      keyLower.includes("price") ||
      keyLower.includes("total") ||
      keyLower.includes("cost") ||
      keyLower.includes("revenue") ||
      keyLower.includes("qty") ||
      keyLower.includes("quantity") ||
      keyLower.includes("balance") ||
      keyLower.includes("tien")
    ) {
      type = ColumnValueType.NUMBER;
    } else if (
      valTypeStr === "status" ||
      valTypeStr === "select" ||
      filterOptions ||
      fetchOptions ||
      keyLower.includes("status") ||
      keyLower.includes("trangthai") ||
      keyLower.includes("type")
    ) {
      type = ColumnValueType.SELECT;
    }

    descriptors.push({
      key: col.key,
      title: titleNode,
      titleText,
      type,
      align:
        align ||
        (col.className?.includes("text-right")
          ? TableColumnAlign.RIGHT
          : col.className?.includes("text-center")
            ? TableColumnAlign.CENTER
            : TableColumnAlign.LEFT),
      currencySymbol: col.currencySymbol,
      decimals: col.decimals,
      fetchOptions,
      filterOptions,
      dateRangeSlot,
      queryKeyPrefix,
      formatOptionLabel,
      hideFilter,
      hideSort,
      showBlankOption: (col.header as any)?.props?.showBlankOption ?? false,
      enableSelectAllMatching:
        (col.header as any)?.props?.enableSelectAllMatching ?? true,
      selectedFilters,
      searchValue,
      sortState,
      onFilterChange,
      onSearchChange,
      onSortChange,
      onDateRangeChange,
      allFilters,
    });
  });

  return descriptors;
}

/**
 * Evaluate single text filter against an operator
 */
export function evaluateTextFilter(
  val: string,
  search: string,
  operator: TextFilterOperator | string = TextFilterOperator.CONTAINS,
): boolean {
  if (operator === TextFilterOperator.IS_EMPTY) {
    return !val || val.trim() === "";
  }
  if (operator === TextFilterOperator.IS_NOT_EMPTY) {
    return Boolean(val && val.trim() !== "");
  }
  if (!search) return true;

  const v = (val || "").toLowerCase();
  const s = (search || "").toLowerCase();

  switch (operator) {
    case TextFilterOperator.CONTAINS:
      return v.includes(s);
    case TextFilterOperator.NOT_CONTAINS:
      return !v.includes(s);
    case TextFilterOperator.STARTS_WITH:
      return v.startsWith(s);
    case TextFilterOperator.ENDS_WITH:
      return v.endsWith(s);
    case TextFilterOperator.EQUALS:
      return v === s;
    case TextFilterOperator.NOT_EQUALS:
      return v !== s;
    default:
      return v.includes(s);
  }
}

/**
 * Evaluate single number filter against an operator
 */
export function evaluateNumberFilter(
  rawVal: any,
  targetVal: string | number,
  operator: NumberFilterOperator | string = NumberFilterOperator.EQUALS,
  targetVal2?: string | number,
): boolean {
  const num =
    typeof rawVal === "number"
      ? rawVal
      : Number(String(rawVal).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(num)) return false;

  if (operator === NumberFilterOperator.BETWEEN) {
    const min = Number(targetVal);
    const max = Number(targetVal2);
    const hasMin =
      !Number.isNaN(min) && targetVal !== "" && targetVal !== undefined;
    const hasMax =
      !Number.isNaN(max) && targetVal2 !== "" && targetVal2 !== undefined;
    if (hasMin && hasMax) return num >= min && num <= max;
    if (hasMin) return num >= min;
    if (hasMax) return num <= max;
    return true;
  }

  const target = Number(targetVal);
  if (Number.isNaN(target) || targetVal === "" || targetVal === undefined)
    return true;

  switch (operator) {
    case NumberFilterOperator.EQUALS:
      return num === target;
    case NumberFilterOperator.NOT_EQUALS:
      return num !== target;
    case NumberFilterOperator.GREATER_THAN:
      return num > target;
    case NumberFilterOperator.GREATER_THAN_OR_EQUAL:
      return num >= target;
    case NumberFilterOperator.LESS_THAN:
      return num < target;
    case NumberFilterOperator.LESS_THAN_OR_EQUAL:
      return num <= target;
    default:
      return num === target;
  }
}

/**
 * Options for client-side items filtering & sorting
 */
export interface FilterClientItemsOptions<T> {
  dateField?: keyof T | string;
  customExtractors?: Record<string, (item: T) => any>;
  columnTypes?: Record<string, ColumnValueType>;
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

  // 1. Filter by columnFilters (Categorical / Multi-select)
  if (listHook.columnFilters) {
    Object.entries(listHook.columnFilters).forEach(([colKey, selected]) => {
      if (selected && selected.length > 0) {
        result = result.filter((item) => {
          const rawVal = options?.customExtractors?.[colKey]
            ? options.customExtractors[colKey](item)
            : item[colKey];
          const strVal =
            rawVal !== undefined && rawVal !== null ? String(rawVal) : "";

          if (selected.includes("__BLANK__") && (!strVal || strVal === "")) {
            return true;
          }
          return selected.includes(strVal);
        });
      }
    });
  }

  // 2. Filter by columnSearch & columnOperators
  if (listHook.columnSearch) {
    Object.entries(listHook.columnSearch).forEach(([colKey, search]) => {
      const operator = listHook.columnOperators?.[colKey];
      const colType = options?.columnTypes?.[colKey];

      if (operator && colType === ColumnValueType.NUMBER) {
        // Number comparison operator
        let val1 = search;
        let val2: string | undefined = undefined;
        if (search.includes("..")) {
          const parts = search.split("..");
          val1 = parts[0];
          val2 = parts[1];
        }
        result = result.filter((item) => {
          const rawVal = options?.customExtractors?.[colKey]
            ? options.customExtractors[colKey](item)
            : item[colKey];
          return evaluateNumberFilter(
            rawVal,
            val1,
            operator as NumberFilterOperator,
            val2,
          );
        });
      } else if (operator && (colType === ColumnValueType.TEXT || !colType)) {
        // Text comparison operator
        result = result.filter((item) => {
          const rawVal = options?.customExtractors?.[colKey]
            ? options.customExtractors[colKey](item)
            : item[colKey];
          const strVal =
            rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
          return evaluateTextFilter(
            strVal,
            search,
            operator as TextFilterOperator,
          );
        });
      } else if (search && search.trim().length > 0) {
        // Fallback default: semicolon & quote search
        const keywords = search
          .split(";")
          .map((k) => k.trim())
          .filter(Boolean);
        if (keywords.length === 0) return;

        result = result.filter((item) => {
          const rawVal = options?.customExtractors?.[colKey]
            ? options.customExtractors[colKey](item)
            : item[colKey];
          const strVal =
            rawVal !== undefined && rawVal !== null
              ? String(rawVal).toLowerCase()
              : "";
          return keywords.some((kw) => {
            let isExact = false;
            let cleanKw = kw;
            if (kw.startsWith('"') && kw.endsWith('"') && kw.length >= 2) {
              isExact = true;
              cleanKw = kw.slice(1, -1);
            }
            const kwLower = cleanKw.toLowerCase();
            if (isExact) {
              return strVal === kwLower;
            }
            return strVal.includes(kwLower);
          });
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
