export type CashflowBadgeVariant =
  | "emerald"
  | "orange"
  | "amber"
  | "rose"
  | "slate";

export interface CashflowKpiBadgeProps {
  variant?: CashflowBadgeVariant;
  label: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}
