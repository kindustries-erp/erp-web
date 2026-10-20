import type { GarageCashflowTopTransactionItem } from "../../../api/garageCashflowApi";

export interface CashflowTopRowProps {
  item: GarageCashflowTopTransactionItem;
  type: "RECEIPT" | "PAYMENT";
  index: number;
  onClickItem?: (item: GarageCashflowTopTransactionItem) => void;
  onClickCase?: (caseCode: string) => void;
}
