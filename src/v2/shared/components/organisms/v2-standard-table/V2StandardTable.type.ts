import type { V2SubtotalVariant } from "@/v2/shared/components/molecules/v2-subtotal-summary-cell";
import type { ReactNode } from "react";
import type {
  ColumnValueType,
  TableColumnAlign,
  V2FetchOptions,
  V2FilterOption,
  V2RowActionGroup,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  V2TableToolbarConfig,
  V2ViewPresetStorage,
} from "./toolbar/V2StandardTable.toolbar.type";

export type {
  V2TableFilterPanelConfig,
  V2TableToolbarConfig,
  V2ViewPreset,
  V2ViewPresetState,
  V2ViewPresetStorage,
} from "./toolbar/V2StandardTable.toolbar.type";

/** Danh sách chế độ bảng (runtime), dùng làm nguồn sự thật cho `V2TableMode` và options của Storybook */
export const V2_TABLE_MODES = ["server", "client"] as const;
export type V2TableMode = (typeof V2_TABLE_MODES)[number];
export type V2MobileSlot = "title" | "subtitle" | "meta" | "hidden";

export interface V2ColumnFilterSpec {
  valueType: ColumnValueType;
  showBlankOption?: boolean;
  formatOptionLabel?: (value: string) => string;
  filterOptions?: V2FilterOption[];
}

/** Ô tổng (subtotal + lũy kế + tổng toàn bộ) của một cột, hiện ở hàng tổng cuối bảng (desktop) */
export interface V2ColumnSummary<T> {
  /** Loại số liệu hiển thị trong ô tổng */
  variant: V2SubtotalVariant;
  /** Lấy số để cộng; mặc định đọc theo `key` của cột (hỗ trợ "a.b") */
  accessor?: (row: T) => unknown;
  /** Chế độ `server`: tổng toàn bộ do consumer truyền (từ API); `client` tự tính */
  total?: number;
  /** Tiêu đề chỉ số trong popover, ví dụ "SL nhập kho" */
  metricTitle?: string;
  /** Đơn vị sau số, ví dụ "kg" */
  unit?: string;
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
  summary?: V2ColumnSummary<T>;
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
  /** Lưu chế độ xem tùy chỉnh và filter group đang chọn; mặc định localStorage theo `tableId` */
  viewPresetStorage?: V2ViewPresetStorage;
  toolbarExtra?: ReactNode;
  /** Cụm nút toolbar; có slot header của template thì tự hiển thị ở đó */
  toolbar?: V2TableToolbarConfig;
  className?: string;
  containerClassName?: string;
}
