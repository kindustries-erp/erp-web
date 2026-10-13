import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import type { PaymentContentComboboxProps } from "./PaymentContentCombobox.type";

export const PAYMENT_CONTENT_OPTIONS = [
  { label: "KH thanh toán", value: "KH thanh toán" },
  { label: "Tất toán", value: "Tất toán" },
  { label: "BH thanh toán", value: "BH thanh toán" },
  { label: "HHBH", value: "HHBH" },
  { label: "Ứng trước", value: "Ứng trước" },
  { label: "Cấn trừ", value: "Cấn trừ" },
  { label: "Mua phụ tùng / vật tư", value: "Mua phụ tùng / vật tư" },
  { label: "Chi phí vận hành", value: "Chi phí vận hành" },
  { label: "Hoa hồng / nhân công", value: "Hoa hồng / nhân công" },
  { label: "Hoàn ứng", value: "Hoàn ứng" },
  { label: "Khác", value: "Khác" },
];

export const PaymentContentCombobox: React.FC<PaymentContentComboboxProps> = ({
  value,
  onChange,
  placeholder = "Chọn hoặc nhập nội dung...",
  className,
}) => {
  return (
    <div className={className}>
      <Combobox
        value={value || ""}
        onChange={(val) => {
          if (onChange) onChange(val);
        }}
        options={PAYMENT_CONTENT_OPTIONS}
        placeholder={placeholder}
      />
    </div>
  );
};
