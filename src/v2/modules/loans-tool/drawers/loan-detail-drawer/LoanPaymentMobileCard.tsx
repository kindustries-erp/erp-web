import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components";
import { formatVndCurrency, type LoanPaymentRecord } from "@/v2/core/loans";

interface LoanPaymentMobileCardProps {
  payment: LoanPaymentRecord;
  onEdit?: (p: LoanPaymentRecord) => void;
  onDelete?: (p: LoanPaymentRecord) => void;
}

export const LoanPaymentMobileCard: React.FC<LoanPaymentMobileCardProps> = ({
  payment: p,
  onEdit,
  onDelete,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="rounded-xl border border-border p-3 bg-card space-y-2 text-sm">
      <div className="flex justify-between items-center font-medium">
        <V2Text as="span">
          {t("v2.loans.table.period", "Kỳ")} {p.periodNumber} • {p.paymentDate}
        </V2Text>
        <V2Text as="span" className="text-primary font-semibold font-mono">
          {formatVndCurrency(p.totalPaid)}
        </V2Text>
      </div>
      <div className="text-xs text-muted-foreground flex justify-between font-mono">
        <V2Text as="span" variant="caption">
          {t("v2.loans.table.principalPaid", "Gốc đã trả")}:{" "}
          {formatVndCurrency(p.principalPaid)}
        </V2Text>
        <V2Text as="span" variant="caption">
          {t("v2.loans.table.interestPaid", "Lãi đã trả")}:{" "}
          {formatVndCurrency(p.interestPaid)}
        </V2Text>
      </div>
      {p.paymentRef && (
        <V2Text
          variant="caption"
          className="text-muted-foreground pt-1 border-t border-border/50 block"
        >
          {t("v2.loans.table.ref", "Mã GD")}: {p.paymentRef}
        </V2Text>
      )}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 pt-1 border-t border-border/50">
          {onEdit && (
            <V2Button variant="outline" size="xs" onClick={() => onEdit(p)}>
              {t("v2.common.edit", "Sửa")}
            </V2Button>
          )}
          {onDelete && (
            <V2Button
              variant="ghost"
              size="xs"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(p)}
            >
              {t("v2.common.delete", "Xóa")}
            </V2Button>
          )}
        </div>
      )}
    </div>
  );
};
LoanPaymentMobileCard.displayName = "LoanPaymentMobileCard";
