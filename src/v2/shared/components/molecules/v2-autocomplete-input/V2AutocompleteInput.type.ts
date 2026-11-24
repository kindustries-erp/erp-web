import type { V2ComboboxOption } from "../v2-combobox/V2Combobox.type";

/** Ô nhập chữ tự do có gợi ý: gõ để lọc, chọn gợi ý để điền nhanh; không khớp vẫn giữ chữ đã gõ. */
export interface V2AutocompleteInputProps {
  /** Chữ đang hiển thị trong ô. */
  value: string;
  /** Người dùng gõ (giá trị tự do, chưa gắn gợi ý nào). */
  onChange: (text: string) => void;
  /** Danh sách gợi ý; component tự lọc theo chữ đang gõ (bỏ dấu). */
  options: V2ComboboxOption[];
  /** Chọn một gợi ý: ô điền nhãn của gợi ý. */
  onSelect: (option: V2ComboboxOption) => void;
  /** Gọi khi gõ để module tìm trên server và thay `options`. */
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  /** Số gợi ý tối đa hiển thị (mặc định 8). */
  maxSuggestions?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
}
