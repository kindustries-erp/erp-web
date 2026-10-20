import type * as React from "react";
import { V2CopyButton } from "@/v2/shared/components/atoms";
import { Input } from "@/v2/shared/ui";

export interface V2ReadValueProps {
  value: string;
  /** Hiện nút sao chép khi có giá trị */
  copy?: boolean;
}

/** Hiển thị giá trị chỉ đọc theo kiểu ô nhập (dùng trong drawer ở chế độ xem) */
export const V2ReadValue = ({ value, copy = false }: V2ReadValueProps) => (
  <div className="flex min-h-10 items-center justify-between rounded-lg border border-border/60 bg-surface-muted/50 px-3 py-2 text-sm">
    <span className="min-w-0 truncate">{value || "—"}</span>
    {copy && value && <V2CopyButton value={value} />}
  </div>
);

export interface V2TextFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange"
> {
  /** Chế độ xem: hiện giá trị chỉ đọc thay vì ô nhập */
  viewing: boolean;
  value: string;
  onChange: (value: string) => void;
}

/** Ô nhập ở chế độ sửa, tự chuyển sang `V2ReadValue` ở chế độ xem; mã/MST/SĐT/email có nút sao chép */
export const V2TextField = ({
  viewing,
  value,
  onChange,
  ...props
}: V2TextFieldProps) =>
  viewing ? (
    <V2ReadValue
      value={value}
      copy={props.type === "email" || props.className?.includes("font-mono")}
    />
  ) : (
    <Input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
