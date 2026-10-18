import React from "react";
import { cn } from "@/shared/utils";
import type { DebtRiskIndicatorProps } from "./DebtRiskIndicator.type";

const riskDotStyles: Record<string, string> = {
  safe: "bg-emerald-500",
  low: "bg-amber-500",
  medium: "bg-orange-500",
  high: "bg-rose-500",
};

export const DebtRiskIndicator: React.FC<DebtRiskIndicatorProps> = ({
  level,
  size = "sm",
  className,
}) => {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  return (
    <span
      className={cn(
        "rounded-full inline-block shrink-0",
        dotSize,
        riskDotStyles[level] || riskDotStyles.safe,
        className,
      )}
    />
  );
};
