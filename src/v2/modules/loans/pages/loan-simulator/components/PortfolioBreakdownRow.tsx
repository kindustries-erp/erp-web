import React from "react";
import { CornerDownRight } from "lucide-react";
import { formatVndCurrency } from "@/v2/core/loans/domain/rules/loan-format.rule";
import { PortfolioMonthlyPeriod } from "@/v2/core/loans";

export interface PortfolioBreakdownRowProps {
  items: NonNullable<PortfolioMonthlyPeriod["breakdown"]>;
}

/**
 * Hiển thị từng khoản vay con bên dưới hàng tháng đã mở rộng,
 * căn thẳng hàng 7 cột khớp hoàn toàn với bảng danh mục chính.
 */
export const PortfolioBreakdownRow: React.FC<PortfolioBreakdownRowProps> = ({
  items,
}) => {
  return (
    <>
      {items.map((item) => (
        <tr
          key={item.loanId}
          className="bg-muted/20 hover:bg-muted/30 text-xs transition-colors"
        >
          <td className="py-2 px-3 text-center text-muted-foreground/60">
            <CornerDownRight className="h-3.5 w-3.5 inline" />
          </td>
          <td className="py-2 px-3 font-medium text-foreground">
            {item.loanName}
          </td>
          <td className="py-2 px-3 text-muted-foreground">{item.dueDate}</td>
          <td className="py-2 px-3 text-right text-muted-foreground">
            {formatVndCurrency(item.principalDue)}
          </td>
          <td className="py-2 px-3 text-right text-amber-600/90">
            {formatVndCurrency(item.interestDue)}
          </td>
          <td className="py-2 px-3 text-right font-semibold text-foreground">
            {formatVndCurrency(item.totalPayment)}
          </td>
          <td className="py-2 px-3 text-right text-muted-foreground">
            {formatVndCurrency(item.endingBalance)}
          </td>
        </tr>
      ))}
    </>
  );
};
PortfolioBreakdownRow.displayName = "PortfolioBreakdownRow";
