import type {
  CustomerDebtTotals,
  VehicleDebtStat,
  AgingDonutItem,
  MonthlyTrendItem,
} from "../types";

export function calculateCustomerDebtTotals(cases: any[]): CustomerDebtTotals {
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalBalance = 0;
  let maxAging = 0;
  let aging0_30 = 0;
  let aging31_60 = 0;
  let aging61_90 = 0;
  let agingOver90 = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let inProgressAmount = 0;

  const uniqueVehicles = new Set<string>();

  cases.forEach((c: any) => {
    const isCompleted =
      c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec);
    const rev = Number(c.tienCoThue) || 0;
    const paid = Number(c.tienDaThanhToan) || 0;
    const bal = Number(c.tienConPhaiThanhToan) || 0;
    const aging = Number(c.agingDays) || 0;

    if (c.bienSoXe) uniqueVehicles.add(c.bienSoXe);

    if (isCompleted) {
      completedCount += 1;
      totalRevenue += rev;
      totalPaid += paid;
      totalBalance += bal;

      if (bal > 0 && aging > maxAging) maxAging = aging;

      if (bal > 0) {
        if (aging <= 30) aging0_30 += bal;
        else if (aging <= 60) aging31_60 += bal;
        else if (aging <= 90) aging61_90 += bal;
        else agingOver90 += bal;
      }
    } else {
      inProgressCount += 1;
      inProgressAmount += rev;
    }
  });

  const recoveryRate =
    totalRevenue > 0
      ? Math.min(100, Math.round((totalPaid / totalRevenue) * 100))
      : totalBalance === 0
        ? 100
        : 0;

  return {
    totalRevenue,
    totalPaid,
    totalBalance,
    maxAging,
    aging0_30,
    aging31_60,
    aging61_90,
    agingOver90,
    vehicleCount: uniqueVehicles.size,
    recoveryRate,
    completedCount,
    inProgressCount,
    inProgressAmount,
  };
}

export function calculateVehicleDebtStats(cases: any[]): VehicleDebtStat[] {
  const map: Record<string, VehicleDebtStat> = {};

  cases.forEach((c: any) => {
    const isCompleted =
      c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec);
    const plate = c.bienSoXe || "Khác / Chưa rõ";
    const caseDate = c.ngayHoanThanhCongViec || c.ngayPhatSinh || c.createdAt;

    if (!map[plate]) {
      map[plate] = {
        licensePlate: plate,
        latestDate: caseDate,
        caseCount: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalBalance: 0,
        maxAgingDays: 0,
      };
    } else if (
      caseDate &&
      (!map[plate].latestDate || caseDate > map[plate].latestDate!)
    ) {
      map[plate].latestDate = caseDate;
    }

    map[plate].caseCount += 1;

    if (isCompleted) {
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const aging = Number(c.agingDays) || 0;

      map[plate].totalRevenue += rev;
      map[plate].totalPaid += paid;
      map[plate].totalBalance += bal;
      if (bal > 0 && aging > map[plate].maxAgingDays) {
        map[plate].maxAgingDays = aging;
      }
    }
  });

  return Object.values(map).sort((a, b) => b.totalBalance - a.totalBalance);
}

export function calculateAgingDonutItems(
  totals: CustomerDebtTotals,
): AgingDonutItem[] {
  return [
    { label: "0-30 ngày", value: totals.aging0_30, color: "#10b981" },
    { label: "31-60 ngày", value: totals.aging31_60, color: "#f59e0b" },
    { label: "61-90 ngày", value: totals.aging61_90, color: "#f97316" },
    { label: ">90 ngày", value: totals.agingOver90, color: "#f43f5e" },
  ].filter((item) => item.value > 0);
}

export function calculateMonthlyTrendItems(cases: any[]): MonthlyTrendItem[] {
  const monthMap: Record<string, MonthlyTrendItem> = {};

  cases.forEach((c: any) => {
    const isCompleted =
      c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec);
    if (!isCompleted) return;

    const dateStr = c.ngayHoanThanhCongViec || c.ngayPhatSinh || c.createdAt;
    if (!dateStr) return;

    const month = String(dateStr).slice(0, 7); // YYYY-MM
    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        revenue: 0,
        paid: 0,
        balance: 0,
        count: 0,
      };
    }

    const rev = Number(c.tienCoThue) || 0;
    const paid = Number(c.tienDaThanhToan) || 0;
    const bal = Number(c.tienConPhaiThanhToan) || 0;

    monthMap[month].revenue += rev;
    monthMap[month].paid += paid;
    monthMap[month].balance += bal;
    monthMap[month].count += 1;
  });

  return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
}
