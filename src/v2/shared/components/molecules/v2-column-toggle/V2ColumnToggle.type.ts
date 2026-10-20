export interface V2ColumnToggleItem {
  key: string;
  label: string;
  visible: boolean;
  /** false: cột bắt buộc hiển thị, không cho ẩn */
  canHide?: boolean;
}

export interface V2ColumnToggleProps {
  /** Danh sách cột theo đúng thứ tự hiện tại */
  columns: V2ColumnToggleItem[];
  onToggle: (columnKey: string) => void;
  /** Trả về toàn bộ key theo thứ tự mới sau khi kéo thả */
  onReorder: (orderedKeys: string[]) => void;
  onReset: () => void;
  /** Bật nút Khôi phục khi layout khác mặc định */
  isCustomized?: boolean;
  className?: string;
}
