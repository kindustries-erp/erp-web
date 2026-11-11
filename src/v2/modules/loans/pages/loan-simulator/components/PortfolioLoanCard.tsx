import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Badge,
  V2Button,
  V2Combobox,
  V2DatePicker,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import { AmortizationMethod, PortfolioLoanItem } from "@/v2/core/loans";
import { Trash2 } from "lucide-react";

export interface PortfolioLoanCardProps {
  loan: PortfolioLoanItem;
  index: number;
  totalLoans: number;
  onUpdate: (id: string, patch: Partial<PortfolioLoanItem>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export const PortfolioLoanCard: React.FC<PortfolioLoanCardProps> = ({
  loan,
  index,
  totalLoans,
  onUpdate,
  onRemove,
  onToggle,
}) => {
  const { t } = useV2Translation();

  const methodOptions = [
    {
      value: AmortizationMethod.AMORTIZED,
      label: t("v2.loans.method.amortized", "Niên kim (Gốc + Lãi đều)"),
    },
    {
      value: AmortizationMethod.EQUAL_PRINCIPAL,
      label: t("v2.loans.method.equalPrincipal", "Dư nợ giảm dần (Gốc đều)"),
    },
    {
      value: AmortizationMethod.BULLET,
      label: t(
        "v2.loans.method.bullet",
        "Cuối kỳ (Trả lãi định kỳ, gốc cuối kỳ)",
      ),
    },
    {
      value: AmortizationMethod.FLAT,
      label: t(
        "v2.loans.method.flat",
        "Lãi phẳng (Tính theo dư nợ gốc ban đầu)",
      ),
    },
  ];

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        loan.enabled
          ? "border-border bg-card shadow-xs"
          : "border-border/60 bg-muted/20 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2 flex-1 mr-2">
          <button
            type="button"
            onClick={() => onToggle(loan.id)}
            className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
              loan.enabled
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border bg-background"
            }`}
          >
            {loan.enabled && <span className="text-xs font-bold">✓</span>}
          </button>
          <V2Badge variant="outline" className="text-xs font-medium">
            #{index + 1}
          </V2Badge>
          <V2Input
            value={loan.name}
            onChange={(e) => onUpdate(loan.id, { name: e.target.value })}
            placeholder={t(
              "v2.loans.form.loanNamePlaceholder",
              "Tên khoản vay",
            )}
            className="h-8 font-semibold text-sm max-w-[200px] sm:max-w-[280px]"
          />
        </div>
        {totalLoans > 1 && (
          <V2Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(loan.id)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            title={t("v2.loans.action.deleteLoan", "Xóa khoản này")}
          >
            <Trash2 className="h-4 w-4" />
          </V2Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <V2Text variant="caption" color="muted" className="mb-1 block">
            {t("v2.loans.form.principal", "Số tiền vay (VND)")}
          </V2Text>
          <V2NumberInput
            value={loan.principalAmount}
            onValueChange={(val) =>
              onUpdate(loan.id, { principalAmount: val || 0 })
            }
            min={0}
            className="w-full h-9"
          />
        </div>

        <div>
          <V2Text variant="caption" color="muted" className="mb-1 block">
            {t("v2.loans.form.rate", "Lãi suất (% / năm)")}
          </V2Text>
          <V2NumberInput
            value={loan.annualInterestRate}
            onValueChange={(val) =>
              onUpdate(loan.id, { annualInterestRate: val || 0 })
            }
            min={0}
            max={100}
            decimals={2}
            className="w-full h-9"
          />
        </div>

        <div>
          <V2Text variant="caption" color="muted" className="mb-1 block">
            {t("v2.loans.form.tenor", "Thời hạn (Số tháng)")}
          </V2Text>
          <V2NumberInput
            value={loan.tenorMonths}
            onValueChange={(val) =>
              onUpdate(loan.id, { tenorMonths: Math.max(1, val || 1) })
            }
            min={1}
            max={360}
            className="w-full h-9"
          />
        </div>

        <div>
          <V2Text variant="caption" color="muted" className="mb-1 block">
            {t("v2.loans.form.method", "Phương thức trả nợ")}
          </V2Text>
          <V2Combobox
            value={loan.amortizationMethod}
            options={methodOptions}
            onValueChange={(val) =>
              onUpdate(loan.id, {
                amortizationMethod:
                  (val as AmortizationMethod) || AmortizationMethod.AMORTIZED,
              })
            }
            className="w-full h-9"
          />
        </div>

        <div>
          <V2Text variant="caption" color="muted" className="mb-1 block">
            {t("v2.loans.form.startDate", "Ngày giải ngân")}
          </V2Text>
          <V2DatePicker
            value={loan.startDate}
            onValueChange={(val) =>
              onUpdate(loan.id, {
                startDate: val || new Date().toISOString().split("T")[0],
              })
            }
            className="w-full h-9"
          />
        </div>

        <div>
          <V2Text variant="caption" color="muted" className="mb-1 block">
            {t("v2.loans.form.lenderName", "Tổ chức cho vay")}
          </V2Text>
          <V2Input
            value={loan.lenderName || ""}
            onChange={(e) => onUpdate(loan.id, { lenderName: e.target.value })}
            placeholder={t(
              "v2.loans.form.lenderPlaceholder",
              "Ngân hàng / Đối tác",
            )}
            className="w-full h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
PortfolioLoanCard.displayName = "PortfolioLoanCard";
