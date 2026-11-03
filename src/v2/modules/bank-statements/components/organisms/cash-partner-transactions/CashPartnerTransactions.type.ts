export interface CashPartnerTransactionsProps {
  correspondentAccount?: string;
  correspondentName?: string;
  /** Mở giao dịch khác từ dòng của bảng kê */
  onSelectTransaction?: (id: string) => void;
}
