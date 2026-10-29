import type * as React from "react";

export enum V2FormFieldType {
  TEXT = "text",
  NUMBER = "number",
  TEXTAREA = "textarea",
  SELECT = "select",
  MULTI_SELECT = "multi-select",
  DATE = "date",
  SWITCH = "switch",
  RADIO = "radio",
  CUSTOM = "custom",
}

export type V2FormFieldTypeInput = V2FormFieldType | `${V2FormFieldType}`;

export enum V2FormFieldViewMode {
  ROW = "row",
  STACK = "stack",
  INLINE = "inline",
  BOX = "box",
}

export type V2FormFieldViewModeInput =
  | V2FormFieldViewMode
  | `${V2FormFieldViewMode}`;

export enum V2FieldOrientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export type V2FieldOrientationInput =
  | V2FieldOrientation
  | `${V2FieldOrientation}`;

export interface V2FieldOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface V2FormFieldProps<V = any> {
  /** Tên định danh trường */
  name?: string;
  /** Loại điều khiển form (mặc định: "text") */
  type?: V2FormFieldTypeInput;
  /** Giá trị hiện tại */
  value: V;
  /** Callback khi giá trị thay đổi */
  onChange?: (value: V) => void;
  /** Callback khi blur khỏi điều khiển */
  onBlur?: () => void;
  /** Chế độ chỉ đọc/xem: tự động chuyển sang DrawerRow hoặc text gọn */
  viewing?: boolean;
  /** Chế độ hiển thị khi viewing: "row" (DrawerRow), "stack" (nhãn trên text dưới), "inline", "box" (mặc định: "row") */
  viewMode?: V2FormFieldViewModeInput;
  /** Hướng bố cục trường: "horizontal" (nhãn ngang) hoặc "vertical" (nhãn dọc) */
  orientation?: V2FieldOrientationInput;
  /** Vô hiệu hóa trường */
  disabled?: boolean;
  /** Chỉ đọc trong chế độ edit */
  readOnly?: boolean;

  // --- Cấu hình DrawerField ---
  /** Nhãn hiển thị */
  label?: string;
  /** Đánh dấu bắt buộc (*) */
  required?: boolean;
  /** Thông báo lỗi hiển thị dưới input */
  error?: string;
  /** Văn bản hướng dẫn hiển thị dưới input */
  helperText?: string;
  /** ClassName bổ sung cho container DrawerField */
  className?: string;
  /** ClassName cho label */
  labelClassName?: string;
  /** ClassName cho text hiển thị giá trị trong view mode */
  valueClassName?: string;
  /** Không bọc DrawerField/DrawerRow, render điều khiển trực tiếp */
  noWrapper?: boolean;

  // --- Cấu hình chi tiết theo type ---
  /** Placeholder cho input / textarea / combobox */
  placeholder?: string;
  /** Danh sách lựa chọn cho select, multi-select, radio */
  options?: V2FieldOption[];
  /** Số chữ số thập phân cho V2NumberInput (mặc định: 0) */
  decimals?: number;
  /** Giá trị nhỏ nhất (số) */
  min?: number;
  /** Giá trị lớn nhất (số) */
  max?: number;
  /** Số dòng cho textarea (mặc định: 3) */
  rows?: number;
  /** Cho phép tìm kiếm trong combobox (mặc định: true) */
  searchable?: boolean;
  /** Cho phép xóa giá trị combobox/date (mặc định: false) */
  clearable?: boolean;
  /** Luôn hiện nút sao chép trong chế độ xem */
  copyable?: boolean;
  /** Tự động viết hoa (mã đối tác, biển số xe) */
  uppercase?: boolean;
  /** Kiểu ô nhập text chuẩn: "text" | "email" | "password" | "tel" */
  inputType?: "text" | "email" | "password" | "tel";
  /** Nhãn tùy biến cho switch ở chế độ xem ({ on: "Bật", off: "Tắt" }) */
  switchLabels?: { on: string; off: string };
  /** Ký tự hiển thị khi giá trị rỗng ở chế độ xem (mặc định: "—") */
  emptyDisplay?: string;

  // --- Slots mở rộng ---
  /** Node hiển thị trước điều khiển */
  prefixSlot?: React.ReactNode;
  /** Node hiển thị sau điều khiển */
  suffixSlot?: React.ReactNode;
  /** Nút thao tác nhanh bên phải (ví dụ: nút sinh mã) */
  actionSlot?: React.ReactNode;

  // --- Custom Render ---
  /** Hàm render tùy biến khi type="custom" */
  render?: (props: V2FormFieldProps<V>) => React.ReactNode;
}
