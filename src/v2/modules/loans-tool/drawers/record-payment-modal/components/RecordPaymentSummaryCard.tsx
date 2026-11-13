import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { formatVndCurrency } from "@/v2/core/loans";

interface RecordPaymentSummaryCardProps {
  remainingPrincipal?: number;
  scheduledDue?: number;
  periodNumber: number;
}

export const RecordPaymentSummaryCard: React.FC<
  RecordPaymentSummaryCardProps
> = ({ remainingPrincipal, scheduledDue, periodNumber }) => {
  const { t } = useV2Translation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
      <div>
        <V2Text variant="caption" color="muted" className="block">
          {t("v2.loans.modal.remainingPrincipal", "Dư nợ còn lại")}
        </V2Text>
        <V2Text variant="body" weight="semibold" className="text-foreground">
          {formatVndCurrency(remainingPrincipal ?? 0)}
        </V2Text>
      </div>
      <div>
        <V2Text variant="caption" color="muted" className="block">
          {t("v2.loans.modal.scheduledDue", "Dự kiến kỳ này")} (Kỳ{" "}
          {periodNumber})
        </V2Text>
        <V2Text variant="body" weight="semibold" className="text-primary">
          {formatVndCurrency(scheduledDue ?? 0)}
        </V2Text>
      </div>
    </div>
  );
};

RecordPaymentSummaryCard.displayName = "RecordPaymentSummaryCard";
