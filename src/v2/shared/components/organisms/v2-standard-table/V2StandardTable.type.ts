import type { ReactNode } from "react";
import type {
  ColumnValueType,
  TableColumnAlign,
  V2FetchOptions,
  V2FilterOption,
  V2RowActionGroup,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";

export type V2TableMode = "server" | "client";
export type V2MobileSlot = "title" | "subtitle" | "meta" | "hidden";

export interface V2ColumnFilterSpec {
  valueType: ColumnValueType;
  showBlankOption?: boolean;
  formatOptionLabel?: (value: string) => string;
  filterOptions?: V2FilterOption[];
}

export interface V2Column<T> {
  key: string;
  label: string;
  cell: (row: T, index: number) => ReactNode;
  /** Lấy giá trị để lọc/sắp xếp client-side; mặc định đọc theo `key` (hỗ trợ "a.b") */
  accessor?: (row: T) => unknown;
  filter?: V2ColumnFilterSpec;
  size?: number;
  align?: TableColumnAlign;
  className?: string;
  headerClassName?: string;
  enableResizing?: boolean;
  enableHiding?: boolean;
  mobileSlot?: V2MobileSlot;
}

export interface V2ColumnPreferences {
  visibility: Record<string, boolean>;
  order: string[];
  sizing: Record<string, number>;
}

export interface V2ColumnPreferencesStorage {
  load: (tableId: string) => V2ColumnPreferences | null;
  save: (tableId: string, preferences: V2ColumnPreferences) => void;
  clear: (tableId: string) => void;
}

export interface V2StandardTableProps<T> {
  tableId: string;
  columns: V2Column<T>[];
  items: T[];
  getRowKey: (row: T) => string;
  mode?: V2TableMode;
  total?: number;
  loading?: boolean;
  emptyLabel?: string;
  fetchOptions?: V2FetchOptions;
  initialQuery?: Partial<V2TableQuery>;
  onQueryChange?: (query: V2TableQuery) => void;
  enableRowSelection?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  rowActions?: (row: T) => V2RowActionGroup[];
  getRowClassName?: (row: T, index: number) => string | undefined;
  preferencesStorage?: V2ColumnPreferencesStorage;
  toolbarExtra?: ReactNode;
  className?: string;
  containerClassName?: string;
}
