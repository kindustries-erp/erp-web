export interface SelectedVoucherItem {
  id: string;
  txn: any;
  amount: number;
}

export interface SelectedBankTransactionsTableProps {
  items: SelectedVoucherItem[];
  netOffAmounts: Record<string, number>;
  maxAmounts: Record<string, number>;
  invoiceDirection?: "IN" | "OUT";
  onAmountChange: (txn: any, val: number) => void;
  onRemove: (id: string) => void;
  onViewDetail: (id: string) => void;
}
