export interface V2TimePickerProps {
  /** `HH:mm` (24 giờ); chuỗi rỗng là chưa chọn. */
  value: string;
  onValueChange: (value: string) => void;
  /** Bước phút trong danh sách (mặc định 5); phút đang chọn lệch bước vẫn được giữ trong danh sách. */
  minuteStep?: number;
  /** Giờ muộn nhất được chọn (`HH:mm`), ví dụ không cho chọn giờ tương lai trong ngày hôm nay. */
  maxTime?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}

export interface V2TimeParts {
  hour: number;
  minute: number;
}
