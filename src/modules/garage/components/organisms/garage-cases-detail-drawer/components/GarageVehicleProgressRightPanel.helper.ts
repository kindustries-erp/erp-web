import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";
import { groupCasesByVehicle } from "@/v2/core/cases-garage";

export interface VehicleProgressStats {
  totalVehicles: number;
  quotationCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  completionRate: number;
  topBrands: { name: string; count: number; percent: number }[];
  totalBilled: number;
  totalPaid: number;
  totalRemaining: number;
  collectionRate: number;
}

export function calculateVehicleProgressStats(
  cases: GarageCaseDetailRow[] = [],
): VehicleProgressStats {
  const vehicleItems = groupCasesByVehicle(cases);
  const totalVehicles = vehicleItems.length;

  let quotationCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let totalBilled = 0;
  let totalPaid = 0;
  let totalRemaining = 0;

  const brandCounts: Record<string, number> = {};

  for (const v of vehicleItems) {
    if (v.laneKey === "QUOTATION" || v.laneKey === "INTAKE") quotationCount++;
    else if (v.laneKey === "IN_PROGRESS") inProgressCount++;
    else if (v.laneKey === "COMPLETED") completedCount++;
    else if (v.laneKey === "CANCELLED") cancelledCount++;

    totalBilled += v.totalBilled;
    totalPaid += v.totalPaid;
    totalRemaining += v.totalRemaining;

    const brand = (v.brandName || "Khác").trim();
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  }

  const topBrands = Object.entries(brandCounts)
    .map(([name, count]) => ({
      name,
      count,
      percent: totalVehicles > 0 ? (count / totalVehicles) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const completionRate =
    totalVehicles > 0 ? (completedCount / totalVehicles) * 100 : 0;
  const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  return {
    totalVehicles,
    quotationCount,
    inProgressCount,
    completedCount,
    cancelledCount,
    completionRate,
    topBrands,
    totalBilled,
    totalPaid,
    totalRemaining,
    collectionRate,
  };
}
