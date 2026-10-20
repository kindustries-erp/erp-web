import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import { PaymentMethodComboboxProps } from "./PaymentMethodCombobox.type";

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Tiền mặt", value: "Tiền mặt" },
  { label: "Chuyển khoản", value: "Chuyển khoản" },
  { label: "Thẻ tín dụng", value: "Thẻ tín dụng" },
  { label: "Khác", value: "Khác" },
];

export const PaymentMethodCombobox: React.FC<PaymentMethodComboboxProps> = ({
  value,
  onChange,
  placeholder = "Chọn phương thức...",
  className,
}) => {
  return (
    <div className={className}>
      <Combobox
        value={value || ""}
        onChange={(val) => {
          if (onChange) onChange(val);
        }}
        options={PAYMENT_METHOD_OPTIONS}
        placeholder={placeholder}
      />
    </div>
  );
};
