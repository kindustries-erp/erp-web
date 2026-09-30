export interface PartnerDebtTotals {
  totalRevenue: number;
  totalPaid: number;
  totalBalance: number;
  maxAging: number;
  recoveryRate: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  agingOver90: number;
}

export interface InvoicePartnerDebtRightPanelProps {
  resolvedName: string;
  taxCode: string | null;
  isCustomer: boolean;
  partnerAddress?: string;
  totals: PartnerDebtTotals;
  invoicesCount: number;
}
