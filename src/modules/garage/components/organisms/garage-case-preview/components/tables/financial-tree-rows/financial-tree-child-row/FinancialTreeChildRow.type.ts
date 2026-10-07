import type { FinancialTreeItem } from "../FinancialTree.type";

export interface FinancialTreeChildRowProps {
  item: FinancialTreeItem;
  canRemove?: boolean;
  onRemove?: (item: FinancialTreeItem) => void;
  className?: string;
}
