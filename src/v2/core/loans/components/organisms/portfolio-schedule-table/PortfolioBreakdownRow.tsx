import React from "react";
import { CornerDownRight } from "lucide-react";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import { PortfolioMonthlyPeriod } from "../../../domain/types/loan.types";

export interface PortfolioBreakdownRowProps {
  items: NonNullable<PortfolioMonthlyPeriod["breakdown"]>;
}

/**
 * Hiển thị từng khoản vay con bên dưới hàng tháng đã mở rộng.
 * Sử dụng nền tương phản, dải nhấn bên trái và số monospace chuẩn V2 Standard Table.
 */
export const PortfolioBreakdownRow: React.FC<PortfolioBreakdownRowProps> = ({
  items,
}) => {
  return (
    <>
      {items.map((item) => (
        <tr
          key={item.loanId}
          className="bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 text-xs transition-colors border-b border-border/50"
        >
          <td className="py-2 px-3 text-center border-l-4 border-l-primary/80 text-primary">
            <CornerDownRight className="h-3.5 w-3.5 inline" />
          </td>
          <td className="py-2 px-4 font-medium text-foreground">
            {item.loanName}
          </td>
          <td className="py-2 px-4 text-muted-foreground font-mono tabular-nums">
            {item.dueDate}
          </td>
          <td className="py-2 px-4 text-right text-muted-foreground font-mono tabular-nums">
            {formatVndCurrency(item.principalDue)}
          </td>
          <td className="py-2 px-4 text-right text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {formatVndCurrency(item.interestDue)}
          </td>
          <td className="py-2 px-4 text-right font-semibold text-foreground font-mono tabular-nums">
            {formatVndCurrency(item.totalPayment)}
          </td>
          <td className="py-2 px-4 text-right text-muted-foreground font-mono tabular-nums">
            {formatVndCurrency(item.endingBalance)}
          </td>
        </tr>
      ))}
    </>
  );
};
PortfolioBreakdownRow.displayName = "PortfolioBreakdownRow";
