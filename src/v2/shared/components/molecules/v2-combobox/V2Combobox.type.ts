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
  /** Hiện nút bỏ lựa chọn khi đã chọn */
  clearable?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}
