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

export interface V2CustomFilterItem {
  key: string;
  label: string;
}

/** Bộ lọc custom: các mục nằm chung nhóm "Bộ lọc có sẵn", chỉ một mục được chọn cùng mục hệ thống */
export interface V2CustomFilterSection {
  items: V2CustomFilterItem[];
  /** Bộ lọc tùy chỉnh đang khớp điều kiện hiện tại (nếu có) */
  activeKey?: string;
  /** Còn trong giới hạn số bộ lọc tùy chỉnh */
  canCreate: boolean;
  onSelect: (key: string) => void;
  /** Bỏ bộ lọc custom đang chọn; gọi trước khi chọn mục có sẵn */
  onClear: () => void;
  onCreate: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

export interface V2ViewModeComboboxProps {
  /** Bỏ trống khi chỉ dùng filter group */
  items?: V2ViewModeItem[];
  /** Bộ lọc tùy chỉnh: hiện trong nhóm Bộ lọc có sẵn; cần `filterGroup` */
  customFilters?: V2CustomFilterSection;
  activeKey?: string;
  onSelect?: (key: string) => void;
  onCreate?: () => void;
  onEdit?: (key: string) => void;
  onDelete?: (key: string) => void;
  filterGroup?: V2FilterGroup;
  className?: string;
}
