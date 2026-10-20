import React from "react";
import type {
  TimeHorizonKey,
  TimeHorizonInvoiceItem,
  TimeHorizonDailyForecastItem,
  TimeHorizonDetailSummary,
  TimeHorizonTopPartnerItem,
} from "../../api/invoiceDashboardApi";

export type TimeHorizonSubTab = "invoices" | "top_partners" | "analytics";

export type {
  TimeHorizonKey,
  TimeHorizonInvoiceItem,
  TimeHorizonDailyForecastItem,
  TimeHorizonDetailSummary,
  TimeHorizonTopPartnerItem,
};

export interface ForecastScheduleRow {
  dateKey: string;
  displayDate: string;
  receivable: number;
  payable: number;
  net: number;
  invoiceCount: number;
}

export interface MonthlyBreakdownRow {
  month: string;
  monthLabel: string;
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  rate: number;
}

export interface HorizonMeta {
  title: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  recommendation: string;
}

export interface InvoiceTimeHorizonDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  horizon: TimeHorizonKey | null;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
}
