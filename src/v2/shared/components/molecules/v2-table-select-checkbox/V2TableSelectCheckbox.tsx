import * as React from "react";
import { Checkbox } from "@/v2/shared/ui";
import type { V2TableSelectCheckboxProps } from "./V2TableSelectCheckbox.type";

/** Ô chọn dòng/chọn tất cả của bảng: dùng chung cho desktop (header, cell) và mobile (card) */
export const V2TableSelectCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  V2TableSelectCheckboxProps
>(({ checked, onCheckedChange, ...props }, ref) => (
  <Checkbox
    ref={ref}
    checked={checked}
    onCheckedChange={(value) => onCheckedChange(Boolean(value))}
    {...props}
  />
));
V2TableSelectCheckbox.displayName = "V2TableSelectCheckbox";
