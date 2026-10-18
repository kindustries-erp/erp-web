import type * as React from "react";

export interface V2SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "role" | "children"
> {
  /** Controlled. Bỏ trống thì công tắc tự giữ trạng thái */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Nhãn hiển thị bên phải công tắc; nếu không có phải truyền `aria-label` */
  label?: React.ReactNode;
}
