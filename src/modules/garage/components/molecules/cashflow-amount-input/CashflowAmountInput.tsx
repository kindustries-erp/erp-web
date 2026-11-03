import React, { useId } from "react";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { readVietnameseCurrency } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { cn } from "@/v2/shared/utils/cn";
import type { CashflowAmountInputProps } from "./CashflowAmountInput.type";

export const CashflowAmountInput: React.FC<CashflowAmountInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "0",
  className,
  hideWords = false,
}) => {
  const t = useT();
  const inputId = useId();
  const numValue = Number(value) || 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <V2NumberInput
        id={inputId}
        value={numValue > 0 ? numValue : null}
        onValueChange={(val) => onChange(val || 0)}
        disabled={disabled}
        placeholder={placeholder}
        decimals={0}
        className={cn("h-8 text-sm font-mono text-right rounded-md", className)}
      />
      {!hideWords && numValue > 0 && (
        <V2Text
          color="muted"
          variant="body-sm"
          className="italic leading-tight pt-0.5"
        >
          {t("garage:cashflowDrawer.amountInWords", "Bằng chữ:")}{" "}
          <span>{readVietnameseCurrency(numValue)}</span>
        </V2Text>
      )}
    </div>
  );
};
