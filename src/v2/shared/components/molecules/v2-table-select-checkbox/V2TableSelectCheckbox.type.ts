import type * as React from "react";
import type { Checkbox } from "@/v2/shared/ui";

export interface V2TableSelectCheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Checkbox>,
  "checked" | "onCheckedChange"
> {
  /** true / false, hoặc "indeterminate" khi chỉ chọn một phần trang */
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  /** Nhãn truy cập bắt buộc (i18n do bên gọi truyền vào) */
  "aria-label": string;
}
