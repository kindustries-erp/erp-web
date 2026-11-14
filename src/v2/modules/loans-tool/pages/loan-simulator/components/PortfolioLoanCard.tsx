import React from "react";
import { Trash2 } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Badge,
  V2Button,
  V2Combobox,
  V2Icon,
  V2Input,
} from "@/v2/shared/components";
import { Checkbox } from "@/v2/shared/ui";
import {
  findLoanPresetById,
  getLoanPresetOptions,
  PortfolioLoanItem,
} from "@/v2/core/loans";
import { PortfolioLoanCardFields } from "./PortfolioLoanCardFields";

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
  const presetOptions = getLoanPresetOptions(t);

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 ${
        loan.enabled
          ? "border-border bg-card shadow-xs"
          : "border-border/60 bg-muted/20 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Checkbox
            checked={loan.enabled}
            onCheckedChange={() => onToggle(loan.id)}
            aria-label={loan.name}
            className="h-5 w-5 rounded-md shrink-0"
          />
          <V2Badge variant="outline" className="text-xs font-medium shrink-0">
            #{index + 1}
          </V2Badge>
          <div className="w-[160px] sm:w-[220px] md:w-[260px] shrink-0">
            <V2Combobox
              placeholder={t(
                "v2.loans.presets.placeholder",
                "⚡ Chọn gói vay mẫu...",
              )}
              options={presetOptions}
              value=""
              onValueChange={(val) => {
                if (!val) return;
                const preset = findLoanPresetById(val);
                if (preset) {
                  onUpdate(loan.id, {
                    name: preset.name,
                    principalAmount: preset.principalAmount,
                    annualInterestRate: preset.annualInterestRate,
                    tenorMonths: preset.tenorMonths,
                    amortizationMethod: preset.amortizationMethod,
                    lenderName: preset.lenderName,
                  });
                }
              }}
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <V2Input
              sizeVariant="sm"
              value={loan.name}
              onChange={(e) => onUpdate(loan.id, { name: e.target.value })}
              placeholder={t(
                "v2.loans.form.loanNamePlaceholder",
                "Tên khoản vay",
              )}
              className="h-10 sm:h-8 font-semibold text-base sm:text-sm w-full"
            />
          </div>
        </div>
        {totalLoans > 1 && (
          <V2Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(loan.id)}
            className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 sm:h-8 sm:w-8 p-0 text-destructive hover:bg-destructive/10 shrink-0 ml-1"
            aria-label={t("v2.loans.action.deleteLoan", "Xóa khoản vay")}
            title={t("v2.loans.action.deleteLoan", "Xóa khoản vay")}
          >
            <V2Icon icon={Trash2} size={16} />
          </V2Button>
        )}
      </div>

      <PortfolioLoanCardFields loan={loan} onUpdate={onUpdate} />
    </div>
  );
};
PortfolioLoanCard.displayName = "PortfolioLoanCard";
