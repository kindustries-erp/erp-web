export type DebtHorizonBadgeVariant =
  | "emerald"
  | "amber"
  | "orange"
  | "rose"
  | "slate"
  | "violet";

export interface DebtHorizonBadgeProps {
  variant?: DebtHorizonBadgeVariant;
  label: string;
  className?: string;
}
