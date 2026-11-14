import React from "react";
import { CornerDownRight, CreditCard, Check } from "lucide-react";
import { V2Text, V2Button, V2Tooltip } from "@/v2/shared/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import type { PortfolioMonthlyPeriod } from "../../../domain/types/loan.types";

export interface PortfolioBreakdownRowProps {
  items: NonNullable<PortfolioMonthlyPeriod["breakdown"]>;
  onRecordPayment?: (
    loanId: string,
    loanName: string,
    periodNumber?: number,
    dueDate?: string,
    principalDue?: number,
    interestDue?: number,
  ) => void;
}

export const PortfolioBreakdownRow: React.FC<PortfolioBreakdownRowProps> = ({
  items,
  onRecordPayment,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-2xs">
      <Table className="border-collapse text-xs">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted text-[11px] font-semibold uppercase tracking-wide text-muted-fg hover:bg-muted">
            <TableHead className="h-auto px-3 py-1.5 text-left">
              {t("v2.loans.table.loanName", "Khoản vay")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-left">
              {t("v2.loans.table.dueDate", "Ngày TT")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-right">
              {t("v2.loans.table.principalDue", "Gốc phải trả")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-right">
              {t("v2.loans.table.interestDue", "Lãi phải trả")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-right">
              {t("v2.loans.table.totalDue", "Tổng phải trả")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-right">
              {t("v2.loans.table.actualPaid", "Đã thanh toán")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-right">
              {t("v2.loans.table.remainingDue", "Còn lại")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-right">
              {t("v2.loans.table.endingBalance", "Dư nợ còn lại")}
            </TableHead>
            {onRecordPayment && (
              <TableHead className="h-auto px-3 py-1.5 text-center">
                {t("v2.loans.table.action", "Thao tác")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-b [&_tr]:border-[color:var(--border-light)] [&_tr:last-child]:border-b-0">
          {items.map((item) => {
            const schedP = item.scheduledPrincipal ?? item.principalDue;
            const schedI = item.scheduledInterest ?? item.interestDue;
            const schedTotal = item.scheduledTotal ?? item.totalPayment;
            const paid = item.actualTotalPaid ?? 0;
            const rem =
              item.remainingTotal ??
              (item.isPaid ? 0 : Math.max(0, schedTotal - paid));
            const isItemPaid = Boolean(item.isPaid || rem <= 0);

            return (
              <TableRow
                key={item.loanId}
                className="transition-colors hover:bg-surface-hover"
              >
                <TableCell className="px-3 py-2 font-medium text-foreground">
                  <V2Text
                    as="span"
                    className="inline-flex items-center gap-1.5"
                  >
                    <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <V2Text as="span">{item.loanName}</V2Text>
                  </V2Text>
                </TableCell>
                <TableCell className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                  {item.dueDate}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatVndCurrency(schedP)}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {formatVndCurrency(schedI)}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-foreground">
                  {formatVndCurrency(schedTotal)}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono tabular-nums">
                  {paid > 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                      {formatVndCurrency(paid)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono tabular-nums">
                  {isItemPaid ? (
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {t("v2.loans.table.statusPaid", "Đã tất toán")}
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground">
                      {formatVndCurrency(rem)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                  {formatVndCurrency(item.endingBalance)}
                </TableCell>
                {onRecordPayment && (
                  <TableCell className="px-3 py-2 text-center">
                    <V2Tooltip
                      content={
                        isItemPaid
                          ? t(
                              "v2.loans.table.alreadyPaidTooltip",
                              "Kỳ này đã hoàn tất thanh toán",
                            )
                          : undefined
                      }
                      disabled={!isItemPaid}
                      side="top"
                    >
                      <span className="inline-block">
                        <V2Button
                          variant="ghost"
                          size="sm"
                          disabled={isItemPaid}
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            onRecordPayment(
                              item.loanId,
                              item.loanName,
                              undefined,
                              item.dueDate,
                              schedP,
                              schedI,
                            )
                          }
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          {t("v2.loans.table.actionPay", "Thanh toán")}
                        </V2Button>
                      </span>
                    </V2Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
PortfolioBreakdownRow.displayName = "PortfolioBreakdownRow";
