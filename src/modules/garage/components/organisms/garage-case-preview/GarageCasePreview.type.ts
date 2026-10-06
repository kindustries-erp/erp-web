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
  costAllocationType?: string;
}

export interface CaseCostBreakdown {
  warehousePartsCost?: number;
  externalCost?: number;
  commissionCost?: number;
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
}

export interface GarageCasePreviewProps {
  caseData: any;
  grossProfit?: any;
  defaultMode?: QuotePreviewMode;
  className?: string;
}
