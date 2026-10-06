export interface SettlementProgressCardProps {
  direction?: "IN" | "OUT";
  editMode: boolean;
  invoiceNo?: string;
  totalInvoiceAmount: number;
  totalNetOff: number;
  remainingDebt: number;
  paymentPercent: number;
  isPaidFull: boolean;
}
