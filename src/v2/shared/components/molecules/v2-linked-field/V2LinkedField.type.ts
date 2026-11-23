import type { V2ComboboxOption } from "../v2-combobox/V2Combobox.type";

/** Props của molecule V2LinkedField: dropdown chọn FK + ô giá trị song song sửa được. */
export interface V2LinkedFieldProps {
  /** Danh sách bản ghi nguồn (FK) để chọn; nhãn của option là giá trị điền vào ô song song. */
  options: V2ComboboxOption[];
  /** Id bản ghi FK đang chọn (`null` là chưa chọn). */
  fkValue: string | null;
  /**
   * Giá trị nguồn điền vào ô song song khi chọn option (mặc định: nhãn option).
   * Dùng khi nhãn hiển thị khác giá trị nguồn thật (ví dụ "mã — tên" so với tên).
   */
  getSourceText?: (option: V2ComboboxOption) => string;
  /** Giá trị cục bộ đang hiển thị ở ô song song (có thể đã sửa khác nguồn). */
  localValue: string;
  /** Giá trị nguồn đã lưu (snapshot do server trả); `undefined` khi chưa biết. */
  sourceValue?: string | null;
  /** Server báo field đang bị override (dùng khi chưa có `sourceValue` để so sánh). */
  overridden?: boolean;
  onFkChange: (fkValue: string | null) => void;
  onLocalChange: (localValue: string) => void;
  /** Đọc lại nguồn và lấy giá trị mới nhất (server). Chỉ hiện nút khi có FK và có handler. */
  onRefresh?: () => void | Promise<unknown>;
  fkLabel: string;
  localLabel: string;
  fkPlaceholder?: string;
  localPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  /** Nhãn dự phòng khi `fkValue` chưa có trong `options` đã tải. */
  fallbackLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Trạng thái và hành động dẫn xuất cho V2LinkedField (xem useLinkedField). */
export interface LinkedFieldState {
  /** Giá trị nguồn dùng để so sánh: option vừa chọn (chưa lưu) ưu tiên hơn snapshot đã lưu. */
  sourceText: string | null;
  /** Field đang khác nguồn (hiện nhãn "đã chỉnh"). */
  overridden: boolean;
  canRevert: boolean;
  canRefresh: boolean;
  isRefreshing: boolean;
  select: (fkValue: string | null) => void;
  edit: (text: string) => void;
  revert: () => void;
  refresh: () => void;
}
