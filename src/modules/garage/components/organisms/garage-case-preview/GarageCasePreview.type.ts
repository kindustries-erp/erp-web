export type QuotePreviewMode = "DOCUMENT" | "TABLE";

export type QuoteLineItemType = "PT" | "DV";

export interface QuoteLineItem {
  id: string;
  itemType: QuoteLineItemType;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  amount: number;
  taxRate: number;
  unitCost: number;
  totalCost: number;
  technicianName?: string;
  isInsurance?: boolean;
  insuranceApprovedAmount?: number;
  outsourceCost?: number;
  costAllocationType?: string;
}

export interface CaseCostBreakdown {
  warehousePartsCost?: number;
  externalCost?: number;
  commissionCost?: number;
  discountCost?: number;
  otherCost?: number;
  totalCost?: number;
  allocatedPartsCost?: number;
  unallocatedCost?: number;
  inventoryPartCost?: number;
  outsourceCost?: number;
}

export type QuoteFinancialPayer = "KH" | "BH" | "GARAGE" | "NONE";

export interface QuoteFinancialItem {
  id: string;
  order: number;
  group: "REVENUE" | "DEDUCTION" | "PAYMENT" | "COMMISSION" | "PROFIT";
  labelKey: string;
  defaultLabel: string;
  rate?: number;
  amount: number;
  payer: QuoteFinancialPayer;
  note?: string;
  tone?: "primary" | "success" | "danger" | "warning" | "default" | "muted";
}

export interface QuoteProfitSummaryData {
  revenue: number;
  totalCost: number;
  partCost: number;
  grossProfit: number;
  profitMargin: number;
  hasProfitData: boolean;
  costBreakdown?: CaseCostBreakdown;
  // Các chỉ số chuẩn hóa theo phiếu in thực tế
  totalAmount?: number;
  discountAmount?: number;
  discountRate?: number;
  subtotalAfterDiscount?: number;
  deductibleAmount?: number;
  sanctionAmount?: number;
  afterSanctionAmount?: number;
  customerPay?: number;
  insurancePay?: number;
  vatAmount?: number;
  totalPayable?: number;
  commissionGeneral?: number;
  commissionGdv?: number;
  gdvName?: string | null;
  commissionMg?: number;
  brokerName?: string | null;
  partsCostInside?: number;
  partsCostOutside?: number;
  outsourceLaborCost?: number;
  estimatedProfitPreTax?: number;
  estimatedProfitAfterTax?: number;
  isInsurance?: boolean;
}

export interface GarageCasePreviewProps {
  caseData: any;
  grossProfit?: any;
  defaultMode?: QuotePreviewMode;
  className?: string;
}
