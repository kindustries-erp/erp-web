import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import type { PaymentContentComboboxProps } from "./PaymentContentCombobox.type";

export const PAYMENT_CONTENT_OPTIONS = [
  { label: "1. KH thanh toán", value: "1. KH thanh toán" },
  { label: "2. Tất toán", value: "2. Tất toán" },
  { label: "3. BH thanh toán", value: "3. BH thanh toán" },
  { label: "4. HHBH", value: "4. HHBH" },
  { label: "5. Ứng trước", value: "5. Ứng trước" },
  { label: "6. Cấn trừ", value: "6. Cấn trừ" },
  { label: "7. Phụ tùng / vật tư", value: "7. Phụ tùng / vật tư" },
  { label: "8. Vật tư tiêu hao", value: "8. Vật tư tiêu hao" },
  { label: "9. Chi phí vận hành", value: "9. Chi phí vận hành" },
  { label: "10. Hoa hồng / nhân công", value: "10. Hoa hồng / nhân công" },
  { label: "11. Hoàn ứng", value: "11. Hoàn ứng" },
  { label: "12. Khác", value: "12. Khác" },
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
