import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  DrawerField,
  DrawerSection,
  V2Badge,
  V2Combobox,
  V2DatePicker,
  V2NumberInput,
} from "@/v2/shared/components";
import {
  AmortizationMethod,
  formatVndHelper,
  getAmortizationMethodOptions,
} from "@/v2/core/loans";
import type { LoanFormValues } from "./LoanFormDrawer.type";

interface LoanFormTermsSectionProps {
  values: LoanFormValues;
  errors: Partial<Record<keyof LoanFormValues, string>>;
  handleChange: <K extends keyof LoanFormValues>(
    key: K,
    val: LoanFormValues[K],
  ) => void;
  inputSize: "md" | "lg";
}

export const LoanFormTermsSection: React.FC<LoanFormTermsSectionProps> = ({
  values,
  errors,
  handleChange,
  inputSize,
}) => {
  const { t } = useV2Translation();
  const methodOptions = getAmortizationMethodOptions(t);

  return (
    <DrawerSection
      title={t("v2.loans.drawer.termsSection", "Thông số vay & Lãi suất")}
    >
      <div className="space-y-3.5">
        <DrawerField
          label={t("v2.loans.form.startDate", "Ngày giải ngân")}
          required
          error={errors.startDate}
        >
          <V2DatePicker
            value={values.startDate || null}
            onValueChange={(val) => handleChange("startDate", val || "")}
            placeholder={t("v2.loans.form.selectDate", "Chọn ngày giải ngân")}
            clearable={false}
            className="w-full"
          />
        </DrawerField>

        <DrawerField
          label={t("v2.loans.form.principalAmount", "Số tiền vay (VNĐ)")}
          required
          error={errors.principalAmount}
          helperText={
            values.principalAmount > 0 ? (
              <V2Badge
                variant="outline"
                className="font-mono text-[11px] font-normal text-muted-foreground"
              >
                {formatVndHelper(values.principalAmount)}
              </V2Badge>
            ) : undefined
          }
        >
          <V2NumberInput
            sizeVariant={inputSize}
            min={0}
            value={values.principalAmount || null}
            onValueChange={(val) => handleChange("principalAmount", val ?? 0)}
            className="w-full"
          />
        </DrawerField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <DrawerField
            label={t("v2.loans.form.annualInterestRate", "Lãi suất (% / năm)")}
            required
            error={errors.annualInterestRate}
          >
            <V2NumberInput
              sizeVariant={inputSize}
              decimals={2}
              min={0}
              max={100}
              value={values.annualInterestRate ?? null}
              onValueChange={(val) =>
                handleChange("annualInterestRate", val ?? 0)
              }
              className="w-full"
            />
          </DrawerField>

          <DrawerField
            label={t("v2.loans.form.tenorMonths", "Thời hạn (tháng)")}
            required
            error={errors.tenorMonths}
          >
            <V2NumberInput
              sizeVariant={inputSize}
              min={1}
              max={360}
              value={values.tenorMonths || null}
              onValueChange={(val) => handleChange("tenorMonths", val ?? 1)}
              className="w-full"
            />
          </DrawerField>
        </div>

        <DrawerField
          label={t("v2.loans.form.amortizationMethod", "Phương thức trả nợ")}
        >
          <V2Combobox
            options={methodOptions}
            value={values.amortizationMethod}
            onValueChange={(val) =>
              val &&
              handleChange("amortizationMethod", val as AmortizationMethod)
            }
            searchable={false}
            clearable={false}
            className="w-full"
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
};
