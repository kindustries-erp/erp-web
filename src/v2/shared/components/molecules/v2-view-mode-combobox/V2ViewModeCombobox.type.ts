export interface V2ViewModeItem {
  key: string;
  label: string;
  /** Preset hệ thống: không sửa/xóa */
  isSystem?: boolean;
}

export interface V2ViewModeComboboxProps {
  items: V2ViewModeItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  onCreate?: () => void;
  onEdit?: (key: string) => void;
  onDelete?: (key: string) => void;
  className?: string;
}
