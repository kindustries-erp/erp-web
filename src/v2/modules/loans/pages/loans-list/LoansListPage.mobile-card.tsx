import React from "react";
import { CreditCard } from "lucide-react";
import { getLoanStatusConfig, LoanItem, LoanStatus } from "@/v2/core/loans";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

interface LoansListPageMobileCardProps {
  loan: LoanItem;
  onOpenDetail: (id: string) => void;
  onRecordPayment: (loan: LoanItem) => void;
}

export const LoansListPageMobileCard: React.FC<
  LoansListPageMobileCardProps
> = ({ loan, onOpenDetail, onRecordPayment }) => {
  const { t } = useV2Translation();
  const statusCfg = getLoanStatusConfig(loan.status, t);
  const remaining = Number(loan.remainingPrincipal ?? loan.principalAmount);
  const canPay = loan.status !== LoanStatus.COMPLETED && remaining > 0;

  return (
    <div
      onClick={() => onOpenDetail(loan.id)}
      className="bg-card p-4 rounded-xl border border-border space-y-2.5 active:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <V2Text
            as="span"
            variant="body-sm"
            weight="semibold"
            className="line-clamp-1 block"
          >
            {loan.title}
          </V2Text>
          <V2Text as="span" variant="caption" color="muted">
            {loan.loanCode} • {loan.lenderName}
          </V2Text>
        </div>
        <V2Badge variant={statusCfg.variant} className="shrink-0">
          {statusCfg.label}
        </V2Badge>
      </div>

      <div className="flex justify-between text-xs pt-1 border-t border-border/50">
        <V2Text as="span" variant="caption" color="muted">
          {t("v2.loans.columns.principal", "Số tiền vay")}:
        </V2Text>
        <V2Text
          as="span"
          variant="caption"
          weight="semibold"
          className="font-mono tabular-nums"
        >
          {Number(loan.principalAmount).toLocaleString("vi-VN")} ₫
        </V2Text>
      </div>

      <div className="flex justify-between text-xs">
        <V2Text as="span" variant="caption" color="muted">
          {t("v2.loans.columns.remaining", "Dư nợ còn lại")}:
        </V2Text>
        <V2Text
          as="span"
          variant="caption"
          weight="semibold"
          className="font-mono tabular-nums text-amber-600 dark:text-amber-400"
        >
          {remaining.toLocaleString("vi-VN")} ₫
        </V2Text>
      </div>

      {canPay && (
        <div className="pt-1 flex justify-end">
          <V2Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onRecordPayment(loan);
            }}
          >
            <CreditCard className="h-3.5 w-3.5" />
            {t("v2.loans.action.recordPayment", "Ghi nhận thanh toán")}
          </V2Button>
        </div>
      )}
    </div>
  );
};
