import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Badge,
  V2Combobox,
  V2DatePicker,
  V2Input,
  V2NumberInput,
  V2Text,
  V2Textarea,
} from "@/v2/shared/components";
import {
  AmortizationMethod,
  formatVndHelper,
  getAmortizationMethodOptions,
} from "@/v2/core/loans";
import type { LoanFormValues } from "./LoanFormDrawer.type";

interface LoanFormFieldsProps {
  values: LoanFormValues;
  errors: Partial<Record<keyof LoanFormValues, string>>;
  handleChange: <K extends keyof LoanFormValues>(
    key: K,
    val: LoanFormValues[K],
  ) => void;
  isMobile?: boolean;
}

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? (
    <V2Text variant="caption" className="text-destructive mt-1 block">
      {msg}
    </V2Text>
  ) : null;

export const LoanFormFields: React.FC<LoanFormFieldsProps> = ({
  values,
  errors,
  handleChange,
  isMobile = false,
}) => {
  const { t } = useV2Translation();
  const methodOptions = getAmortizationMethodOptions(t);
  const inputSize = isMobile ? "lg" : "md";

  return (
    <div className="space-y-4 p-4">
      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.title", "Tên khoản vay")} *
          </V2Text>
          <V2Input
            sizeVariant={inputSize}
            value={values.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="VD: Vay vốn kinh doanh VCB"
            error={errors.title}
          />
          <FieldError msg={errors.title} />
        </div>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.lenderName", "Ngân hàng / Đơn vị cho vay")} *
          </V2Text>
          <V2Input
            sizeVariant={inputSize}
            value={values.lenderName}
            onChange={(e) => handleChange("lenderName", e.target.value)}
            placeholder="VD: Vietcombank CN Hà Nội"
            error={errors.lenderName}
          />
          <FieldError msg={errors.lenderName} />
        </div>
      </div>

      <div className={isMobile ? "space-y-4" : "grid grid-cols-3 gap-4"}>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.principalAmount", "Số tiền vay (VNĐ)")} *
          </V2Text>
          <V2NumberInput
            sizeVariant={inputSize}
            min={0}
            value={values.principalAmount || null}
            onValueChange={(val) => handleChange("principalAmount", val ?? 0)}
          />
          {values.principalAmount > 0 && (
            <V2Badge
              variant="outline"
              className="mt-1 font-mono text-[11px] font-normal text-muted-foreground"
            >
              {formatVndHelper(values.principalAmount)}
            </V2Badge>
          )}
          <FieldError msg={errors.principalAmount} />
        </div>
        <div className={isMobile ? "grid grid-cols-2 gap-3" : "contents"}>
          <div>
            <V2Text variant="caption" className="font-medium mb-1.5 block">
              {t("v2.loans.form.annualInterestRate", "Lãi suất (% / năm)")} *
            </V2Text>
            <V2NumberInput
              sizeVariant={inputSize}
              decimals={2}
              min={0}
              max={100}
              value={values.annualInterestRate ?? null}
              onValueChange={(val) =>
                handleChange("annualInterestRate", val ?? 0)
              }
            />
            <FieldError msg={errors.annualInterestRate} />
          </div>
          <div>
            <V2Text variant="caption" className="font-medium mb-1.5 block">
              {t("v2.loans.form.tenorMonths", "Thời hạn (tháng)")} *
            </V2Text>
            <V2NumberInput
              sizeVariant={inputSize}
              min={1}
              max={360}
              value={values.tenorMonths || null}
              onValueChange={(val) => handleChange("tenorMonths", val ?? 1)}
            />
            <FieldError msg={errors.tenorMonths} />
          </div>
        </div>
      </div>

      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.amortizationMethod", "Phương thức trả nợ")}
          </V2Text>
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
        </div>
        <div>
          <V2Text variant="caption" className="font-medium mb-1.5 block">
            {t("v2.loans.form.startDate", "Ngày giải ngân")} *
          </V2Text>
          <V2DatePicker
            value={values.startDate || null}
            onValueChange={(val) => handleChange("startDate", val || "")}
            placeholder={t("v2.loans.form.selectDate", "Chọn ngày giải ngân")}
            clearable={false}
            className="w-full"
          />
          <FieldError msg={errors.startDate} />
        </div>
      </div>

      <div>
        <V2Text variant="caption" className="font-medium mb-1.5 block">
          {t("v2.loans.form.notes", "Ghi chú")}
        </V2Text>
        <V2Textarea
          rows={isMobile ? 2 : 3}
          value={values.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Điều khoản hợp đồng, tài sản đảm bảo..."
        />
      </div>
    </div>
  );
};
