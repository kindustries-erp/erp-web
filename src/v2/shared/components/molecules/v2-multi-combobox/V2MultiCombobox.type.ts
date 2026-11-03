import type { V2ComboboxOption } from "../v2-combobox/V2Combobox.type";

export interface V2MultiComboboxProps {
  options: V2ComboboxOption[];
  /** Mảng rỗng là chưa chọn mục nào */
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  /** Có ô lọc trong danh sách (mặc định true) */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Hiện nút bỏ hết lựa chọn khi đã chọn */
  clearable?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}
