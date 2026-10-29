export interface CashTrendPointDto {
  label: string;
  cashIn: number;
  cashOut: number;
}

/** `GET /bank-transactions-core/dashboard-stats` theo đối tác đối ứng */
export interface PartnerDashboardStatsDto {
  totalCashIn?: number;
  totalCashOut?: number;
  netCashFlow?: number;
  cashTrend?: CashTrendPointDto[];
}

/** Một lựa chọn lọc cột: chuỗi thuần hoặc `{ value, label }` */
export type ColumnOptionDto = string | { value: string; label: string };

export interface ColumnOptionsResponseDto {
  items: ColumnOptionDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BranchOptionDto {
  value: string;
  label: string;
}
