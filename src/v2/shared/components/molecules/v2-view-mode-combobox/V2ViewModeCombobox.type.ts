export interface V2ViewModeItem {
  key: string;
  label: string;
  /** Preset hệ thống: không sửa/xóa */
  isSystem?: boolean;
}

export interface V2FilterGroupItem {
  key: string;
  label: string;
  badgeCount?: number;
  dotColor?: string;
}

/** Nhóm lọc nhanh (Tất cả / Mới / ...) hiển thị trong popover, thay cho pill tabs */
export interface V2FilterGroup {
  /** Tiêu đề nhóm; bỏ trống thì dùng `v2.table.filterGroupTitle` */
  title?: string;
  items: V2FilterGroupItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Key "tất cả": khác key này thì trigger hiện "view • filter". Mặc định "all" */
  allKey?: string;
}

export interface V2ViewModeComboboxProps {
  /** Bỏ trống khi chỉ dùng filter group */
  items?: V2ViewModeItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  onCreate?: () => void;
  onEdit?: (key: string) => void;
  onDelete?: (key: string) => void;
  filterGroup?: V2FilterGroup;
  className?: string;
}
