export interface V2ColumnSelectorItem {
  key: string;
  label: string;
}

export interface V2ColumnSelectorGroup {
  key: string;
  label: string;
  columns: V2ColumnSelectorItem[];
}

export interface V2ColumnSelectorProps {
  groups: V2ColumnSelectorGroup[];
  /** Các key đang chọn. Thứ tự trả về theo thứ tự khai báo trong `groups` */
  selectedKeys: string[];
  /** Bộ mặc định, dùng cho nút "Mặc định" */
  defaultKeys: string[];
  onChange: (keys: string[]) => void;
  className?: string;
}
