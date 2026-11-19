import type { ReactNode } from "react";
import type { GarageTimeHorizonKey } from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface GaragePartnerMonthDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  month: string; // "2026-10" hoặc "10/2026"; bỏ trống khi xem theo mốc
  /** Khi có, lọc theo mốc tuổi nợ: dùng đúng `initialCases` đã lọc ở breakdown, không lọc theo tháng. */
  horizon?: GarageTimeHorizonKey;
  /** Nhãn kỳ hiển thị trên tiêu đề (ví dụ nhãn mốc); mặc định là "Tháng MM/YYYY" từ `month`. */
  periodLabel?: string;
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
