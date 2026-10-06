import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";
import type { AgingDonutItem } from "../../molecules/partner-aging-donut-chart";
import type { MonthlyDebtChartDataset } from "../../molecules/partner-monthly-debt-chart";
import type { CumulativeTrendDataset } from "../../molecules/partner-cumulative-trend-chart";
import type { RecoveryRateDataset } from "../../molecules/partner-recovery-rate-chart";

import type { MonthlyDebtTableRow } from "../../molecules/partner-monthly-debt-table";

export type {
  AgingDonutItem,
  MonthlyDebtChartDataset,
  MonthlyDebtTableRow,
  CumulativeTrendDataset,
  RecoveryRateDataset,
};

export interface DebtTotals {
  totalRevenue: number;
  totalPaid: number;
  totalBalance: number;
  maxAging: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  agingOver90: number;
  recoveryRate: number;
}

export interface PartnerDebtAnalyticsSectionProps {
  invoices: PartnerInvoiceDetailItem[];
  isLoading?: boolean;
  isCustomer: boolean;
  className?: string;
}

export interface PartnerDebtAnalyticsData {
  totals: DebtTotals;
  monthlyBarLabels: string[];
  monthlyBarDatasets: MonthlyDebtChartDataset[];
  monthlyTableRows: MonthlyDebtTableRow[];
  agingDonutItems: AgingDonutItem[];
  cumulativeTrendLabels: string[];
  cumulativeTrendDatasets: CumulativeTrendDataset[];
  recoveryRateLabels: string[];
  recoveryRateDatasets: RecoveryRateDataset[];
}
