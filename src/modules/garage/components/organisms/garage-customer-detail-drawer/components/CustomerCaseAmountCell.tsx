import React from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

interface CustomerCaseAmountCellProps {
  amount: number;
  variant?: "default" | "paid" | "balance";
  className?: string;
}

export const CustomerCaseAmountCell: React.FC<CustomerCaseAmountCellProps> = ({
  amount,
  variant = "default",
  className,
}) => {
  const num = Number(amount) || 0;

  let colorStyle = "font-semibold text-foreground";
  if (variant === "paid") {
    colorStyle = "text-emerald-600 dark:text-emerald-400 font-medium";
  } else if (variant === "balance") {
    colorStyle =
      num > 0
        ? "text-amber-600 dark:text-amber-400 font-bold"
        : "text-muted-foreground font-normal";
  }

  return (
    <span
      className={cn(
        "font-mono text-xs block text-right tabular-nums",
        colorStyle,
        className,
      )}
    >
      {money(num)}
    </span>
  );
};
