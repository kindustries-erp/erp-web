import type { ReactNode, MouseEvent, Dispatch, SetStateAction } from "react";
import type {
  VisibilityState,
  Updater,
  Row,
  Column,
} from "@tanstack/react-table";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export enum TableSortState {
  ASC = "asc",
  DESC = "desc",
  NONE = "none",
}

export enum TableColumnAlign {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

export enum ColumnValueType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  STATUS = "status",
  SELECT = "select",
}

export enum TextFilterOperator {
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
}

export enum NumberFilterOperator {
  EQUALS = "eq",
  NOT_EQUALS = "neq",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  BETWEEN = "between",
}

export enum DateFilterOperator {
  BETWEEN = "between",
  EQUALS = "eq",
  BEFORE = "before",
  AFTER = "after",
}

export enum FilterChipCategory {
  TEXT = "text",
  MULTI_SELECT = "multi_select",
  NUMERIC = "numeric",
  DATE = "date",
  SORT = "sort",
  CUSTOM = "custom",
}

export type TableSortStateType = "asc" | "desc" | "none" | TableSortState;
export type TableColumnAlignType =
  | "left"
  | "center"
  | "right"
  | TableColumnAlign;

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode | ((props: any) => ReactNode);
  cell?: (item: T, index: number, meta: any) => ReactNode;
  dataIndex?: keyof T | string;
  valueType?:
    | ColumnValueType
    | "text"
    | "number"
    | "date"
    | "status"
    | "select";
  dateFormat?: string;
  className?: string;
  headerClassName?: string;
  skeletonClassName?: string;
  sortable?: boolean;
  sortKey?: string;
  hideable?: boolean;
  label?: ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableResizing?: boolean;
  currencySymbol?: string;
  decimals?: number;
  filterOptions?: { label: string; value: string }[];
}

export interface ActionsColumnConfig<T> {
  cell: (item: T, index: number, meta?: any) => ReactNode;
  header?: ReactNode | ((props: any) => ReactNode);
  className?: string;
  headerClassName?: string;
  size?: number;
  minSize?: number;
  maxSize?: number;
}

export interface DataTableRowMeta {
  className?: string;
  headerClassName?: string;
  skeletonClassName?: string;
  sortable?: boolean;
  sortKey?: string;
  hideable?: boolean;
  label?: ReactNode;
}

export interface DataTableProps<T> {
  items: T[];
  columns: DataTableColumn<T>[];
  getRowKey?: (item: T) => string;
  tableMeta?: any;
  loading?: boolean;
  isPending?: boolean;
  error?: string | null;
  emptyLabel: string;
  filters?: ReactNode;
  minWidth?: number;
  loadingRows?: number;
  elevated?: boolean;
  containerClassName?: string;
  actionsColumn?: ActionsColumnConfig<T>;
  rowHoverActions?: (
    item: T,
    index: number,
    meta?: any,
  ) => ActionDropdownItem[];
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  paginationClassName?: string;
  total?: number;
  totalPages?: number;
  onPage?: (page: number) => void;
  onPageSize?: (pageSize: number) => void;
  onRowClick?: (item: T) => void;
  getRowClassName?: (item: T, index: number) => string | undefined;
  enableRowContextMenu?: boolean;
  onRowContextMenu?: (item: T, index: number, event: MouseEvent) => void;
  renderSubRow?: (item: T) => ReactNode;
  expandedRowKeys?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sortArray?: string[];
  onSort?: (key: string) => void;
  enableColumnVisibility?: boolean;
  defaultColumnVisibility?: VisibilityState;
  tableId?: string;
  enableColumnResizing?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (updater: Updater<Record<string, boolean>>) => void;
  variant?: "default" | "spreadsheet";
  summaryRow?: Record<string, ReactNode>;
  defaultColumnOrder?: string[];
  sidePanel?: ReactNode;
  enableFullscreen?: boolean;
  tableTitle?: ReactNode;
  tableDesc?: ReactNode;
  tableIcon?: ReactNode;
  fullscreenClassName?: string;
  fullscreenHeaderExtra?: ReactNode;
  fullscreenTabs?: ReactNode;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface SortableItemProps<T> {
  id: string;
  column: Column<T, unknown>;
}

export interface DataTableRowMemoProps<T> {
  row: Row<T>;
  rowKey: string;
  isExpanded?: boolean;
  isContextMenuActive?: boolean;
  rowIndex: number;
  isSelected: boolean;
  getRowClassName?: (record: T, index: number) => string | undefined;
  onRowClick?: (record: T) => void;
  onRowContextMenu?: (record: T, index: number, event: MouseEvent) => void;
  enableRowContextMenu?: boolean;
  rowHoverActions?: (
    record: T,
    index: number,
    meta?: any,
  ) => ActionDropdownItem[] | undefined;
  setContextMenu: Dispatch<
    SetStateAction<{
      x: number;
      y: number;
      items: ActionDropdownItem[];
      rowKey: string;
    } | null>
  >;
  variant?: "default" | "compact" | "cards" | "spreadsheet";
  enableRowSelection?: boolean;
  enableColumnResizing?: boolean;
  renderSubRow?: (record: T) => ReactNode;
  visibleColumnsKey?: string;
}
