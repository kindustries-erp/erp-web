import React, { useId } from "react";
import { Input } from "@/shared/components/ui/input";
import { readVietnameseCurrency } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import type { CashflowAmountInputProps } from "./CashflowAmountInput.type";

export const CashflowAmountInput: React.FC<CashflowAmountInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "0",
  className = "w-full h-8 text-sm",
}) => {
  const t = useT();
  const inputId = useId();

  const numValue = Number(value) || 0;
  const displayValue = numValue > 0 ? numValue.toLocaleString("vi-VN") : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, "");
    const parsed = rawDigits ? Number(rawDigits) : 0;
    onChange(parsed);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <Input
        id={inputId}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${className} text-right font-mono`}
      />
      {numValue > 0 && (
        <p className="text-xs text-muted-foreground italic leading-tight pt-0.5">
          {t("garage:cashflowDrawer.amountInWords", "Bằng chữ:")}{" "}
          <span>{readVietnameseCurrency(numValue)}</span>
        </p>
      )}
    </div>
  );
};
