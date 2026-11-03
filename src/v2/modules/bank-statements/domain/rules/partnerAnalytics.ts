import type { PartnerDashboardStatsDto } from "../../api/dtos/partnerStats.dto";

export interface PartnerAnalyticsTotals {
  cashIn: number;
  cashOut: number;
  net: number;
}

/**
 * Tổng thu, chi, chênh lệch của biến động đối tượng.
 * Dùng số API trả nếu có; thiếu thì cộng từ chuỗi theo kỳ.
 */
export function analyticsTotalsOf(
  stats: PartnerDashboardStatsDto | undefined,
): PartnerAnalyticsTotals {
  const trend = stats?.cashTrend ?? [];
  const sumIn = trend.reduce((sum, p) => sum + Number(p.cashIn || 0), 0);
  const sumOut = trend.reduce((sum, p) => sum + Number(p.cashOut || 0), 0);
  const cashIn = stats?.totalCashIn ?? sumIn;
  const cashOut = stats?.totalCashOut ?? sumOut;
  return { cashIn, cashOut, net: stats?.netCashFlow ?? cashIn - cashOut };
}
