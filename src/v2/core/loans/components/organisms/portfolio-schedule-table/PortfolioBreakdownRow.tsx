import React from "react";
import { CornerDownRight } from "lucide-react";
import { V2Text } from "@/v2/shared/components";
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
}

/**
 * Bảng chi tiết từng khoản vay cấu thành bên trong hàng mở rộng của V2StandardTable.
 */
export const PortfolioBreakdownRow: React.FC<PortfolioBreakdownRowProps> = ({
  items,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-2xs">
      <Table className="border-collapse text-xs">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted text-[11px] font-semibold uppercase tracking-wide text-muted-fg hover:bg-muted">
            <TableHead className="h-auto px-3 py-1.5 text-left">
              {t("v2.loans.table.loanName", "Khoản vay cấu thành")}
            </TableHead>
            <TableHead className="h-auto px-3 py-1.5 text-left">
              {t("v2.loans.table.dueDate", "Ngày thanh toán")}
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
              {t("v2.loans.table.endingBalance", "Dư nợ còn lại")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-b [&_tr]:border-[color:var(--border-light)] [&_tr:last-child]:border-b-0">
          {items.map((item) => (
            <TableRow
              key={item.loanId}
              className="transition-colors hover:bg-surface-hover"
            >
              <TableCell className="px-3 py-2 font-medium text-foreground">
                <V2Text as="span" className="inline-flex items-center gap-1.5">
                  <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <V2Text as="span">{item.loanName}</V2Text>
                </V2Text>
              </TableCell>
              <TableCell className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                {item.dueDate}
              </TableCell>
              <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatVndCurrency(item.principalDue)}
              </TableCell>
              <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {formatVndCurrency(item.interestDue)}
              </TableCell>
              <TableCell className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-foreground">
                {formatVndCurrency(item.totalPayment)}
              </TableCell>
              <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                {formatVndCurrency(item.endingBalance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
PortfolioBreakdownRow.displayName = "PortfolioBreakdownRow";
