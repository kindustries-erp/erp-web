export type DebtRiskLevel = "safe" | "low" | "medium" | "high";

export interface DebtRiskIndicatorProps {
  level: DebtRiskLevel;
  size?: "sm" | "md";
  className?: string;
}
