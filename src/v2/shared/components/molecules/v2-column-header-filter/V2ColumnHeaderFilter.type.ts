import type {
  ColumnValueType,
  TableColumnAlign,
  TableSortState,
  V2DateRange,
  V2FilterOption,
  V2OperatorFilter,
} from "@/v2/shared/types/v2-table";

export type V2FilterOptionsStatus = "idle" | "loading" | "error" | "ready";

/** Dữ liệu danh sách lựa chọn do organism truy vấn và truyền xuống (molecule không gọi API) */
export interface V2FilterOptionsState {
  options: V2FilterOption[];
  status: V2FilterOptionsStatus;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export const V2_IDLE_OPTIONS_STATE: V2FilterOptionsState = {
  options: [],
  status: "idle",
  hasNextPage: false,
  isFetchingNextPage: false,
  onLoadMore: () => undefined,
};

export interface V2ColumnHeaderFilterProps {
  columnKey: string;
  label: string;
  valueType: ColumnValueType;
  sort: TableSortState;
  onSortChange: (direction: TableSortState) => void;
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  search: string;
  onSearchChange: (text: string) => void;
  operator?: V2OperatorFilter;
  onOperatorChange: (filter: V2OperatorFilter | null) => void;
  dateRange?: V2DateRange;
  onDateRangeChange: (range: V2DateRange | null) => void;
  /** Xóa toàn bộ bộ lọc của riêng cột này */
  onClear: () => void;
  optionsState: V2FilterOptionsState;
  /** Báo cho organism biết popup đang mở/đóng để chỉ truy vấn options của cột đang mở */
  onOpenChange?: (open: boolean) => void;
  /** Từ khóa (đã debounce) dùng để thu hẹp danh sách options */
  onOptionsSearchChange?: (search: string) => void;
  formatOptionLabel?: (value: string) => string;
  align?: TableColumnAlign;
  className?: string;
}

export interface V2ColumnHeaderFilterPanelProps extends V2ColumnHeaderFilterProps {
  isActive: boolean;
  onClose: () => void;
}
