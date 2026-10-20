interface V2DatePickerBaseProps {
  placeholder?: string;
  /** Ngày nhỏ nhất được chọn, dạng `yyyy-MM-dd` */
  minDate?: string;
  /** Ngày lớn nhất được chọn, dạng `yyyy-MM-dd` */
  maxDate?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export interface V2DatePickerProps extends V2DatePickerBaseProps {
  /** `yyyy-MM-dd`, `null` là chưa chọn */
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export interface V2DateRangeValue {
  from?: string;
  to?: string;
}

/** Mốc thời gian chọn nhanh, ví dụ "Tháng này" */
export interface V2DateRangePreset {
  key: string;
  label: string;
  range: () => V2DateRangeValue;
}

export interface V2DateRangePickerProps extends V2DatePickerBaseProps {
  value: V2DateRangeValue;
  onValueChange: (value: V2DateRangeValue) => void;
  /** Danh sách chọn nhanh hiện bên trái lịch (xem `buildV2DatePresets`) */
  presets?: V2DateRangePreset[];
}
