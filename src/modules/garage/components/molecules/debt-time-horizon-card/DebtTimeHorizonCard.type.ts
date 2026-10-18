import type { LucideIcon } from "lucide-react";
import type { DebtHorizonBadgeVariant } from "../../atoms/debt-horizon-badge";

export interface DebtTimeHorizonCardProps {
  title: string;
  badge: string;
  badgeVariant?: DebtHorizonBadgeVariant;
  icon: LucideIcon;
  iconColor?: string;
  hoverBorderColor?: string;
  inLabel: string;
  inAmount: number;
  outLabel: string;
  outAmount: number;
  netLabel: string;
  netAmount: number;
  isNetPositiveGood?: boolean;
  onClick?: () => void;
}
