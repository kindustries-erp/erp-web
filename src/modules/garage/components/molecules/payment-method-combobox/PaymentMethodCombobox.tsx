import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import { GARAGE_PAYMENT_METHODS } from "../../../utils/garageCashflowCatalog";
import { PaymentMethodComboboxProps } from "./PaymentMethodCombobox.type";

export const PAYMENT_METHOD_OPTIONS = GARAGE_PAYMENT_METHODS.map((value) => ({
  label: value,
  value,
}));

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
