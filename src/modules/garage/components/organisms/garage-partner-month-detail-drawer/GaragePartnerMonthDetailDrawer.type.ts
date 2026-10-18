import type { ReactNode } from "react";

export interface GaragePartnerMonthDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  month: string; // "2026-10" hoặc "10/2026"
  customerCode?: string | null;
  customerName?: string | null;
  taxCode?: string | null;
  branchId?: string;
  initialDebtType?: "receivables" | "payables";
  initialCases?: any[];
  onOpenCaseDetail?: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal?: (caseItem: any) => void;
  onOpenInvoiceLinkingModal?: (caseItem: any) => void;
}

export interface PayerCategoryMetrics {
  billed: number;
  paid: number;
  remaining: number;
  rate: number;
  caseCount: number;
  withInvoiceAmount: number;
  noInvoiceAmount: number;
  vatWithoutInvoiceAmount: number;
}

export interface PartnerMonthMetrics {
  totalBilled: number;
  totalPaid: number;
  totalRemaining: number;
  rate: number;
  caseCount: number;
  revenue: number;
  vatAmount: number;
  customer: PayerCategoryMetrics;
  insurance: PayerCategoryMetrics;
  vatWarning: {
    hasWarning: boolean;
    totalVatWithoutInvoice: number;
    casesCount: number;
  };
}

export interface PartnerClassificationRow {
  key: string;
  name: string;
  subLabel?: string;
  icon?: ReactNode;
  badgeClass?: string;
  caseCount: number;
  billed: number;
  paid: number;
  remaining: number;
  remainingWithInvoice: number;
  remainingNoInvoice: number;
  rate: number;
  shareRate: number;
}
