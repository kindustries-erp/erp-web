export interface ActiveVoucherItem {
  id: string;
  bankTransactionId: string;
  refNo: string;
  description: string;
  transDate: string | null;
  amount: number;
  bankName: string;
  partnerName: string;
  sourceType?: "BANK" | "CASH";
  bankAccount?: { bankName?: string; accountNumber?: string } | any;
  accountNumber?: string;
  cashBook?: { name?: string } | any;
  isPending: boolean;
}

export interface SettlementVoucherListProps {
  direction?: "IN" | "OUT";
  editMode: boolean;
  activeVouchers: ActiveVoucherItem[];
  saving?: boolean;
  onOpenBankVoucher: (id: string) => void;
  onUnlinkVoucher: (item: ActiveVoucherItem) => void;
}
