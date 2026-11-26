export interface V2DateTimePickerProps {
  /** `yyyy-MM-ddTHH:mm` theo giờ máy; chuỗi rỗng là chưa chọn. */
  value: string;
  onValueChange: (value: string) => void;
  /** Nút chọn nhanh theo số phút trước hiện tại (0 = "Bây giờ"), ví dụ `[0, 15, 30, 60]`. */
  quickMinutesAgo?: number[];
  /** Không cho chọn ngày sau hôm nay. */
  noFuture?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  /** Nhãn của cả ô (ô ngày và ô giờ thêm hậu tố "ngày"/"giờ"). */
  "aria-label"?: string;
}
