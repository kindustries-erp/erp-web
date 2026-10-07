import type { FinancialTreeItem } from "../FinancialTree.type";

export interface FinancialTreeParentRowProps {
  item: FinancialTreeItem;
  childCount: number;
  canPerform?: boolean;
  disabledReason?: string;
  hasInsurance?: boolean;
  onCollect?: () => void;
  onCollectKH?: () => void;
  onCollectBH?: () => void;
  onPay?: () => void;
  className?: string;
}
