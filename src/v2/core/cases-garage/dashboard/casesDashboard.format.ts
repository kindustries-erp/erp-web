import { formatNumber } from "@/v2/shared/utils/v2TableFormat";

export interface CasesDashboardCountUnits {
  vehicles: string;
  cases: string;
}

/** Nhãn "N xe · M lệnh" với đơn vị truyền vào (đã dịch). */
export function formatVehicleCaseCounts(
  vehicles: number,
  cases: number,
  units: CasesDashboardCountUnits,
): string {
  return `${formatNumber(vehicles)} ${units.vehicles} · ${formatNumber(cases)} ${units.cases}`;
}

/** Tỷ lệ phần trăm đã làm tròn (ví dụ 33.3 -> "33.3%"). */
export function formatRatePercent(rate: number): string {
  return `${rate}%`;
}
