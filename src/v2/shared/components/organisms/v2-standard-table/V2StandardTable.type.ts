import type { V2SubtotalVariant } from "@/v2/shared/components/molecules/v2-subtotal-summary-cell";
import type { ReactNode } from "react";
import type { V2DropdownGroup } from "@/v2/shared/components/molecules/v2-dropdown";
import type { V2TabItemData } from "@/v2/shared/components/molecules/v2-tab-bar";
import type {
  V2ViewModeComboboxProps,
  V2ViewModeItem,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";
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

export interface V2TableFilterPanelConfig {
  /** Controlled; bỏ trống thì bảng tự giữ trạng thái mở/đóng */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Bộ lọc tùy biến theo trang (kỳ, tag...) đặt trên danh sách cột */
  extraContent?: ReactNode;
}

export interface V2TableToolbarConfig {
  /** Pill tabs lọc nhanh (Tất cả / Mới / ...) */
  pillTabs?: {
    items: V2TabItemData[];
    activeKey: string;
    onChange: (key: string) => void;
  };
  viewModes?: {
    items: V2ViewModeItem[];
    activeKey: string;
    onSelect: (key: string) => void;
    onCreate?: V2ViewModeComboboxProps["onCreate"];
    onEdit?: V2ViewModeComboboxProps["onEdit"];
    onDelete?: V2ViewModeComboboxProps["onDelete"];
  };
  /** Menu của chip `(N)` khi có dòng được chọn */
  bulkActions?: V2DropdownGroup[];
  /** Có handler thì hiện nút Lọc (badge = số cột đang lọc) */
  /** Bật panel lọc theo cột bên phải; nút Lọc tự mở/đóng panel */
  filterPanel?: V2TableFilterPanelConfig;
  onFilterToggle?: () => void;
  onRefresh?: () => void;
  /** Ô tìm kiếm toàn cục trên mọi cột, kết quả nằm ở `query.search` */
  search?: { placeholder?: string };
  /** Mặc định true; bỏ qua trên mobile */
  enableFullscreen?: boolean;
  create?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    actions?: V2DropdownGroup[];
  };
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
  /** Cụm nút toolbar; có slot header của template thì tự hiển thị ở đó */
  toolbar?: V2TableToolbarConfig;
  className?: string;
  containerClassName?: string;
}
