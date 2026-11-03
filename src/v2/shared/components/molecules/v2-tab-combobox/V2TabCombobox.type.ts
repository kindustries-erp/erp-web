import type * as React from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2TabComboboxItem {
  /** Giá trị định danh của tab (hỗ trợ value, key, id) */
  value?: string;
  key?: string;
  id?: string;
  /** Nhãn hiển thị của tab */
  label: React.ReactNode;
  /** Icon hiển thị kèm tab */
  icon?: React.ReactNode;
  /** Số đếm badge hiển thị cạnh tab */
  badgeCount?: number;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
}

export interface V2TabComboboxProps extends Omit<
  V2BaseProps<HTMLDivElement>,
  "onSelect"
> {
  /** Danh sách các tab item */
  items: V2TabComboboxItem[];
  /** Giá trị tab hiện đang được chọn */
  activeKey?: string;
  /** Callback khi người dùng chọn tab mới */
  onSelect?: (key: string) => void;
  /** Tiêu đề tiền tố (ví dụ: "Chế độ xem" hoặc "Tab") */
  labelPrefix?: string;
  /** Chiều rộng menu popover (mặc định: auto hoặc w-56) */
  menuWidth?: string;
  /** Căn lề popover (mặc định: "start") */
  align?: "start" | "center" | "end";
}
