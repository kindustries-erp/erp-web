export interface CheckpointDrawerState {
  open: boolean;
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
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
  revenueChart?: number[];
  tienCoThueChart?: number[];
  paidChart?: number[];
  profitChart?: number[];
  labels?: string[];
}
