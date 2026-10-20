export interface MonthlyDebtTableRow {
  id: string;
  monthKey: string;
  monthLabel: string;
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  rate: number;
}

export interface PartnerMonthlyDebtTableProps {
  rows: MonthlyDebtTableRow[];
  isCustomer?: boolean;
  isLoading?: boolean;
  className?: string;
}
