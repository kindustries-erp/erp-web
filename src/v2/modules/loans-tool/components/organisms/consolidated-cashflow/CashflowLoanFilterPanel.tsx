import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Button,
  V2TableSelectCheckbox,
  V2Text,
} from "@/v2/shared/components";

export interface CashflowLoanItem {
  id: string;
  name: string;
}

interface CashflowLoanFilterPanelProps {
  loans: CashflowLoanItem[];
  enabledLoanIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const CashflowLoanFilterPanel: React.FC<
  CashflowLoanFilterPanelProps
> = ({ loans, enabledLoanIds, onToggle, onSelectAll, onClearAll }) => {
  const { t } = useV2Translation();

  if (loans.length <= 1) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <V2Text variant="body" className="font-semibold text-sm">
          {t("v2.loans.cashflow.filterByLoans", "Lọc theo khoản vay")} (
          {enabledLoanIds.size}/{loans.length})
        </V2Text>
        <div className="flex items-center gap-2">
          <V2Button variant="ghost" size="xs" onClick={onSelectAll}>
            {t("v2.common.selectAll", "Chọn tất cả")}
          </V2Button>
          <V2Button variant="ghost" size="xs" onClick={onClearAll}>
            {t("v2.common.clearAll", "Bỏ chọn")}
          </V2Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        {loans.map((loan) => {
          const isChecked = enabledLoanIds.has(loan.id);
          return (
            <label
              key={loan.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                isChecked
                  ? "bg-primary/10 border-primary/40 text-foreground font-medium"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <V2TableSelectCheckbox
                aria-label={loan.name}
                checked={isChecked}
                onCheckedChange={() => onToggle(loan.id)}
              />
              <V2Text
                as="span"
                variant="caption"
                className="truncate max-w-[200px]"
              >
                {loan.name}
              </V2Text>
            </label>
          );
        })}
      </div>
    </div>
  );
};
CashflowLoanFilterPanel.displayName = "CashflowLoanFilterPanel";
