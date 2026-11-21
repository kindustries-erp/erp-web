import type { GarageIntakeStages } from "../../api/garageDashboardApi";

export interface CheckpointDrawerState {
  open: boolean;
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
  initialStatus?: string;
  isFunnel?: boolean;
}

export interface PeriodStatsData {
  totalRevenue?: number;
  totalCost?: number;
  totalProfit?: number;
  totalTienCoThue?: number;
  totalPaid?: number;
  totalReceivable?: number;
  collectionRate?: number;
  totalCount?: number;
  stages?: GarageIntakeStages;
  revenueChart?: number[];
  tienCoThueChart?: number[];
  paidChart?: number[];
  profitChart?: number[];
  labels?: string[];
}
