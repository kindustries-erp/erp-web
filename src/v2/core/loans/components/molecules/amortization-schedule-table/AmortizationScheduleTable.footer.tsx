import React from "react";
import { TableCell, TableFooter, TableRow } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import type { LoanSchedulePeriod } from "../../../domain/types/loan.types";

interface AmortizationScheduleFooterProps {
  schedule: LoanSchedulePeriod[];
  showActions: boolean;
}

export const AmortizationScheduleFooter: React.FC<
  AmortizationScheduleFooterProps
> = ({ schedule, showActions }) => {
  const { t } = useV2Translation();

  const totalPrincipal = schedule.reduce((sum, p) => sum + p.principalDue, 0);
  const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
  const totalPayment = schedule.reduce((sum, p) => sum + p.totalPaymentDue, 0);

  const paidPeriods = schedule.filter((p) => p.isPaid);
  const hasPaid = paidPeriods.length > 0;

  const paidP = paidPeriods.reduce((sum, p) => sum + p.principalDue, 0);
  const paidI = paidPeriods.reduce((sum, p) => sum + p.interestDue, 0);
  const paidTotal = paidPeriods.reduce((sum, p) => sum + p.totalPaymentDue, 0);

  const futurePeriods = schedule.filter((p) => !p.isPaid);
  const futureP = futurePeriods.reduce((sum, p) => sum + p.principalDue, 0);
  const futureI = futurePeriods.reduce((sum, p) => sum + p.interestDue, 0);
  const futureTotal = futurePeriods.reduce(
    (sum, p) => sum + p.totalPaymentDue,
    0,
  );

  return (
    <TableFooter className="border-t-2 border-border bg-muted/60 font-bold">
      {hasPaid && (
        <>
          <TableRow className="hover:bg-muted/60 text-xs border-b border-border/50 text-emerald-600 dark:text-emerald-400">
            <TableCell
              colSpan={3}
              className="py-2 px-4 uppercase tracking-wide"
            >
              {t("v2.loans.table.totalPaid", "Đã thanh toán thực tế")} (
              {paidPeriods.length} {t("v2.loans.table.periods", "kỳ")})
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums">
              {formatVndCurrency(paidP)}
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums">
              {formatVndCurrency(paidI)}
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums font-semibold">
              {formatVndCurrency(paidTotal)}
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums text-muted-foreground">
              -
            </TableCell>
            {showActions && <TableCell className="py-2 px-3" />}
          </TableRow>

          <TableRow className="hover:bg-muted/60 text-xs border-b border-border/50 text-primary">
            <TableCell
              colSpan={3}
              className="py-2 px-4 uppercase tracking-wide"
            >
              {t(
                "v2.loans.table.totalRemaining",
                "Nghĩa vụ còn lại (Tính lại)",
              )}{" "}
              ({futurePeriods.length} {t("v2.loans.table.periods", "kỳ")})
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums">
              {formatVndCurrency(futureP)}
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {formatVndCurrency(futureI)}
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums font-semibold">
              {formatVndCurrency(futureTotal)}
            </TableCell>
            <TableCell className="py-2 px-4 text-right font-mono tabular-nums text-muted-foreground">
              0 ₫
            </TableCell>
            {showActions && <TableCell className="py-2 px-3" />}
          </TableRow>
        </>
      )}

      <TableRow className="hover:bg-muted/60">
        <TableCell
          colSpan={3}
          className="py-3 px-4 text-center uppercase tracking-wide text-xs"
        >
          {hasPaid
            ? t("v2.loans.table.totalCycle", "Tổng cộng toàn chu kỳ")
            : t("v2.common.total", "Tổng cộng")}
        </TableCell>
        <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-primary">
          {formatVndCurrency(totalPrincipal)}
        </TableCell>
        <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
          {formatVndCurrency(totalInterest)}
        </TableCell>
        <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-base font-bold">
          {formatVndCurrency(totalPayment)}
        </TableCell>
        <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-muted-foreground">
          0 ₫
        </TableCell>
        {showActions && <TableCell className="py-3 px-3" />}
      </TableRow>
    </TableFooter>
  );
};
AmortizationScheduleFooter.displayName = "AmortizationScheduleFooter";
