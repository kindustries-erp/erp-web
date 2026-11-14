import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { formatVndCurrency } from "@/v2/core/loans";

interface ConsolidatedCashflowKpisProps {
  totalScheduledObligation: number;
  totalActualPaid: number;
  remainingPrincipal: number;
}

export const ConsolidatedCashflowKpis: React.FC<
  ConsolidatedCashflowKpisProps
> = ({ totalScheduledObligation, totalActualPaid, remainingPrincipal }) => {
  const { t } = useV2Translation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <V2Text
          variant="caption"
          className="text-muted-foreground font-medium block mb-1"
        >
          {t(
            "v2.loans.cashflow.totalScheduledObligation",
            "Tổng phải trả (theo lịch HĐ)",
          )}
        </V2Text>
        <V2Text variant="h2" className="text-xl font-bold text-foreground">
          {formatVndCurrency(totalScheduledObligation)}
        </V2Text>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <V2Text
          variant="caption"
          className="text-muted-foreground font-medium block mb-1"
        >
          {t("v2.loans.cashflow.totalActualPaid", "Đã thanh toán thực tế")}
        </V2Text>
        <V2Text
          variant="h2"
          className="text-xl font-bold text-emerald-600 dark:text-emerald-400"
        >
          {formatVndCurrency(totalActualPaid)}
        </V2Text>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <V2Text
          variant="caption"
          className="text-muted-foreground font-medium block mb-1"
        >
          {t("v2.loans.cashflow.remainingPrincipal", "Dư nợ gốc còn lại")}
        </V2Text>
        <V2Text
          variant="h2"
          className="text-xl font-bold text-amber-600 dark:text-amber-400"
        >
          {formatVndCurrency(remainingPrincipal)}
        </V2Text>
      </div>
    </div>
  );
};
ConsolidatedCashflowKpis.displayName = "ConsolidatedCashflowKpis";
