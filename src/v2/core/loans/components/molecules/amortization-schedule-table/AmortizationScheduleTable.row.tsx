import React from "react";
import { Check, CreditCard } from "lucide-react";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { TableCell, TableRow } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import type { LoanSchedulePeriod } from "../../../domain/types/loan.types";

interface AmortizationScheduleRowProps {
  row: LoanSchedulePeriod;
  index: number;
  showActions: boolean;
  isPaid: boolean;
  onRecordPeriod?: (period: LoanSchedulePeriod) => void;
}

export const AmortizationScheduleRow: React.FC<
  AmortizationScheduleRowProps
> = ({ row, index, showActions, isPaid, onRecordPeriod }) => {
  const { t } = useV2Translation();

  return (
    <TableRow
      className={`hover:bg-muted/30 transition-colors ${
        index % 2 === 1 ? "bg-muted/10" : ""
      }`}
    >
      <TableCell className="py-2.5 px-4 text-center">
        <V2Text variant="body" className="font-medium">
          {row.periodNumber}
        </V2Text>
      </TableCell>
      <TableCell className="py-2.5 px-4">
        <V2Text
          variant="caption"
          className="text-muted-foreground font-mono block"
        >
          {row.dueDate}
        </V2Text>
        {isPaid && row.actualPaymentDate && (
          <V2Text
            as="span"
            variant="caption"
            className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5"
          >
            {t("v2.loans.table.paidOn", "Trả")}: {row.actualPaymentDate}
          </V2Text>
        )}
      </TableCell>
      <TableCell className="py-2.5 px-4 text-right font-mono tabular-nums">
        {formatVndCurrency(row.beginningBalance)}
      </TableCell>
      <TableCell className="py-2.5 px-4 text-right font-mono tabular-nums font-medium text-primary">
        {formatVndCurrency(row.principalDue)}
      </TableCell>
      <TableCell className="py-2.5 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
        {formatVndCurrency(row.interestDue)}
      </TableCell>
      <TableCell className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold">
        {formatVndCurrency(row.totalPaymentDue)}
      </TableCell>
      <TableCell className="py-2.5 px-4 text-right font-mono tabular-nums text-muted-foreground">
        {formatVndCurrency(row.endingBalance)}
      </TableCell>
      {showActions && (
        <TableCell className="py-2.5 px-3 text-center">
          {isPaid ? (
            <V2Badge
              variant="outline"
              className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[11px]"
            >
              <Check className="h-3 w-3" />
              {t("v2.loans.status.paid", "Đã trả")}
            </V2Badge>
          ) : (
            onRecordPeriod && (
              <V2Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => onRecordPeriod(row)}
                className="h-7 gap-1 px-2 text-xs"
              >
                <CreditCard className="h-3 w-3" />
                {t("v2.loans.action.pay", "Trả kỳ")}
              </V2Button>
            )
          )}
        </TableCell>
      )}
    </TableRow>
  );
};
