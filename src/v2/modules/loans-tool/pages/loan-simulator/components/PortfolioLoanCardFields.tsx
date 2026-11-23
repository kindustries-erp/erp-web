import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Combobox,
  V2DatePicker,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import { AmortizationMethod, PortfolioLoanItem } from "@/v2/core/loans";
import { getAmortizationMethodOptions } from "@/v2/core/loans/domain/rules/loan-format.rule";

interface PortfolioLoanCardFieldsProps {
  loan: PortfolioLoanItem;
  onUpdate: (id: string, patch: Partial<PortfolioLoanItem>) => void;
}

const CONTROL_CLS = "w-full h-10 sm:h-8 text-base sm:text-sm";

function LoanField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <V2Text
        variant="caption"
        color="muted"
        truncate
        className="mb-1 block"
        title={label}
      >
        {label}
      </V2Text>
      {children}
    </div>
  );
}

export const PortfolioLoanCardFields: React.FC<
  PortfolioLoanCardFieldsProps
> = ({ loan, onUpdate }) => {
  const { t } = useV2Translation();
  const methodOptions = getAmortizationMethodOptions(t);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.35fr_0.95fr_1.05fr_2fr_1.3fr_2fr] gap-2.5">
      <LoanField label={t("v2.loans.form.principal", "Số tiền vay (VND)")}>
        <V2NumberInput
          sizeVariant="sm"
          value={loan.principalAmount}
          onValueChange={(val) =>
            onUpdate(loan.id, { principalAmount: val || 0 })
          }
          min={0}
          className={CONTROL_CLS}
        />
      </LoanField>

      <LoanField label={t("v2.loans.form.rate", "Lãi suất (%/năm)")}>
        <V2NumberInput
          sizeVariant="sm"
          value={loan.annualInterestRate}
          onValueChange={(val) =>
            onUpdate(loan.id, { annualInterestRate: val || 0 })
          }
          min={0}
          max={100}
          decimals={2}
          className={CONTROL_CLS}
        />
      </LoanField>

      <LoanField label={t("v2.loans.form.tenor", "Thời hạn (Số tháng)")}>
        <V2NumberInput
          sizeVariant="sm"
          value={loan.tenorMonths}
          onValueChange={(val) =>
            onUpdate(loan.id, { tenorMonths: Math.max(1, val || 1) })
          }
          min={1}
          max={360}
          className={CONTROL_CLS}
        />
      </LoanField>

      <LoanField label={t("v2.loans.form.method", "Phương thức trả nợ")}>
        <V2Combobox
          value={loan.amortizationMethod}
          options={methodOptions}
          onValueChange={(val) =>
            onUpdate(loan.id, {
              amortizationMethod:
                (val as AmortizationMethod) || AmortizationMethod.AMORTIZED,
            })
          }
          className="w-full"
        />
      </LoanField>

      <LoanField label={t("v2.loans.form.startDate", "Ngày giải ngân")}>
        <V2DatePicker
          value={loan.startDate}
          onValueChange={(val) =>
            onUpdate(loan.id, {
              startDate: val || new Date().toISOString().split("T")[0],
            })
          }
          triggerClassName={CONTROL_CLS}
          className="w-full"
        />
      </LoanField>

      <LoanField
        label={t("v2.loans.form.lenderName", "Ngân hàng / Đơn vị cho vay")}
      >
        <V2Input
          sizeVariant="sm"
          value={loan.lenderName || ""}
          onChange={(e) => onUpdate(loan.id, { lenderName: e.target.value })}
          placeholder={t(
            "v2.loans.form.lenderPlaceholder",
            "Ngân hàng / Đối tác",
          )}
          className={CONTROL_CLS}
        />
      </LoanField>
    </div>
  );
};
PortfolioLoanCardFields.displayName = "PortfolioLoanCardFields";
