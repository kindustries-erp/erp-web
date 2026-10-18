import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import type { PaymentContentComboboxProps } from "./PaymentContentCombobox.type";

export const PAYMENT_CONTENT_OPTIONS = [
  { label: "1. KH thanh toán", value: "1. KH thanh toán" },
  { label: "2. Tất toán", value: "2. Tất toán" },
  { label: "3. BH thanh toán", value: "3. BH thanh toán" },
  { label: "4. HHBH", value: "4. HHBH" },
  { label: "5. HH Bán hàng", value: "5. HH Bán hàng" },
  { label: "6. HH Thưởng", value: "6. HH Thưởng" },
  { label: "7. Ứng trước", value: "7. Ứng trước" },
  { label: "8. Cấn trừ", value: "8. Cấn trừ" },
  { label: "9. Phụ tùng / vật tư", value: "9. Phụ tùng / vật tư" },
  { label: "10. Vật tư tiêu hao", value: "10. Vật tư tiêu hao" },
  { label: "11. Chi phí vận hành", value: "11. Chi phí vận hành" },
  { label: "12. Hoàn ứng", value: "12. Hoàn ứng" },
  { label: "13. Khác", value: "13. Khác" },
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
