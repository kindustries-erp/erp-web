export interface V2ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Dòng phụ nhỏ bên dưới nhãn (ví dụ mã số thuế) */
  description?: string;
}

export interface V2ComboboxProps {
  options: V2ComboboxOption[];
  /** `null` là chưa chọn */
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  /** Có ô lọc trong danh sách (mặc định true). Đặt false để dùng như select thường */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Gọi mỗi khi người dùng gõ, để module tìm trên server và thay `options` */
  onSearchChange?: (query: string) => void;
  /** Đang tải kết quả tìm kiếm: hiện spinner và thông báo "Đang tìm..." */
  loading?: boolean;
  /** Hiện nút bỏ lựa chọn khi đã chọn */
  clearable?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  /** Callback khi người dùng cuộn tới đáy danh sách (hỗ trợ phân trang / infinite scroll) */
  onScrollBottom?: () => void;
  /** Nhãn hiển thị dự phòng khi `value` chưa có trong mảng `options` ban đầu */
  fallbackLabel?: string;
}
