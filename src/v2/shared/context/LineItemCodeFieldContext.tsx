import * as React from "react";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";

/** Thông tin hàng được chọn từ gợi ý; chỉ `itemCode` luôn có. */
export interface LineItemCodePick {
  itemCode: string;
  itemName?: string;
  unit?: string;
}

export interface LineItemCodeFieldProps {
  value: string;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  /** Gọi khi người dùng gõ mã (chỉ `itemCode`) hoặc chọn hàng từ gợi ý (kèm tên và đơn vị). */
  onPick: (pick: LineItemCodePick) => void;
}

const LineItemCodeFieldContext =
  React.createContext<React.ComponentType<LineItemCodeFieldProps> | null>(null);

/** Module thay ô mã hàng mặc định (vd gợi ý từ danh mục garage) cho mọi bảng dòng bên trong. */
export const LineItemCodeFieldProvider = LineItemCodeFieldContext.Provider;

/** Ô mã hàng của bảng dòng chứng từ: dùng ô do module cung cấp, mặc định là ô nhập tay. */
export function LineItemCodeInput(props: LineItemCodeFieldProps) {
  const Custom = React.useContext(LineItemCodeFieldContext);
  if (Custom) return <Custom {...props} />;
  return (
    <V2Input
      sizeVariant="xs"
      aria-label={props.ariaLabel}
      className={props.className}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onPick({ itemCode: e.target.value })}
    />
  );
}
