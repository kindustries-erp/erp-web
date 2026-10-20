import type {
  GarageCashflowTopTransactions,
  GarageCashflowTopTransactionItem,
} from "../../../api/garageCashflowApi";

export interface GarageCashflowTopTxnsTableProps {
  topTransactions?: GarageCashflowTopTransactions;
  loading?: boolean;
  onClickItem?: (item: GarageCashflowTopTransactionItem) => void;
  onClickCase?: (caseCode: string) => void;
}
