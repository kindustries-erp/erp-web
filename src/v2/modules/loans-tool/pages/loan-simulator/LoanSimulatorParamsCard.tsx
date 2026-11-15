import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Badge,
  V2Combobox,
  V2DatePicker,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import {
  AmortizationMethod,
  formatVndHelper,
  getAmortizationMethodOptions,
} from "@/v2/core/loans";
import type { LoanSimulatorFormValues } from "./LoanSimulatorPage.type";

interface LoanSimulatorParamsCardProps {
  values: LoanSimulatorFormValues;
  handleChange: <K extends keyof LoanSimulatorFormValues>(
    key: K,
    value: LoanSimulatorFormValues[K],
  ) => void;
  isMobile?: boolean;
  className?: string;
}

export const LoanSimulatorParamsCard: React.FC<
  LoanSimulatorParamsCardProps
> = ({ values, handleChange, isMobile = false, className = "" }) => {
  const { t } = useV2Translation();
  const methodOptions = getAmortizationMethodOptions(t);
  const inputSize = isMobile ? "lg" : "md";

  return (
    <div
      className={`bg-card border border-border ${
        isMobile ? "p-4 rounded-xl space-y-3" : "p-5 rounded-2xl space-y-4"
      } ${className}`}
    >
      <V2Text
        variant={isMobile ? "caption" : "h3"}
        className={isMobile ? "font-semibold block" : "font-semibold text-base"}
      >
        {t("v2.loans.simulator.parameters", "Tham Số Khoản Vay")}
      </V2Text>

      <div>
        <V2Text variant="caption" className="font-medium mb-1.5 block">
          {t("v2.loans.form.principalAmount", "Số tiền vay (VND)")}
        </V2Text>
        <V2NumberInput
          sizeVariant={inputSize}
          min={0}
          aria-label={t("v2.loans.form.principalAmount", "Số tiền vay (VND)")}
          value={values.principalAmount}
          onValueChange={(val) => handleChange("principalAmount", val ?? 0)}
        />
        <div className="mt-1.5 flex justify-end">
          <V2Badge
            variant="outline"
            className="font-mono text-xs font-normal text-muted-foreground"
          >
            {formatVndHelper(values.principalAmount)}
          </V2Badge>
        </div>
      </div>

      <div className={isMobile ? "grid grid-cols-2 gap-3" : "space-y-4"}>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.annualInterestRate", "Lãi suất (%/năm)")}
          </V2Text>
          <V2NumberInput
            sizeVariant={inputSize}
            decimals={2}
            min={0}
            max={100}
            aria-label={t(
              "v2.loans.form.annualInterestRate",
              "Lãi suất (%/năm)",
            )}
            value={values.annualInterestRate}
            onValueChange={(val) =>
              handleChange("annualInterestRate", val ?? 0)
            }
          />
        </div>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.tenorMonths", "Thời hạn vay (tháng)")}
          </V2Text>
          <V2NumberInput
            sizeVariant={inputSize}
            min={1}
            max={360}
            aria-label={t("v2.loans.form.tenorMonths", "Thời hạn vay (tháng)")}
            value={values.tenorMonths}
            onValueChange={(val) => handleChange("tenorMonths", val ?? 1)}
          />
        </div>
      </div>

      <div>
        <V2Text variant="caption" className="font-medium mb-1.5 block">
          {t("v2.loans.form.amortizationMethod", "Phương thức trả nợ")}
        </V2Text>
        <V2Combobox
          options={methodOptions}
          value={values.amortizationMethod}
          onValueChange={(val) =>
            val && handleChange("amortizationMethod", val as AmortizationMethod)
          }
          searchable={false}
          clearable={false}
          className="w-full"
        />
      </div>

      <div>
        <V2Text variant="caption" className="font-medium mb-1.5 block">
          {t("v2.loans.form.startDate", "Ngày bắt đầu tính lãi")}
        </V2Text>
        <V2DatePicker
          value={values.startDate || null}
          onValueChange={(val) => handleChange("startDate", val || "")}
          placeholder={t("v2.loans.form.selectDate", "Chọn ngày bắt đầu")}
          clearable={false}
          className="w-full"
        />
      </div>
    </div>
  );
};
