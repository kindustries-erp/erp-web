import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";
import type { TFunction } from "i18next";
import type {
  DebtTotals,
  AgingDonutItem,
  MonthlyDebtChartDataset,
  MonthlyDebtTableRow,
  CumulativeTrendDataset,
  RecoveryRateDataset,
} from "./PartnerDebtAnalyticsSection.type";

export function computeDebtTotals(
  invoices: PartnerInvoiceDetailItem[],
): DebtTotals {
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalBalance = 0;
  let maxAging = 0;
  let aging0_30 = 0;
  let aging31_60 = 0;
  let aging61_90 = 0;
  let agingOver90 = 0;

  invoices.forEach((inv) => {
    const tot = Number(inv.totalAmount) || 0;
    const paid = Number(inv.paidAmount) || 0;
    const bal = Number(inv.balanceAmount) || 0;
    const aging = Number(inv.agingDays) || 0;

    totalRevenue += tot;
    totalPaid += paid;
    totalBalance += bal;
    if (bal > 0 && aging > maxAging) maxAging = aging;

    if (bal > 0) {
      if (aging <= 30) aging0_30 += bal;
      else if (aging <= 60) aging31_60 += bal;
      else if (aging <= 90) aging61_90 += bal;
      else agingOver90 += bal;
    }
  });

  const recoveryRate =
    totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

  return {
    totalRevenue,
    totalPaid,
    totalBalance,
    maxAging,
    aging0_30,
    aging31_60,
    aging61_90,
    agingOver90,
    recoveryRate,
  };
}

export function computeMonthlyBarData(
  invoices: PartnerInvoiceDetailItem[],
  isCustomer: boolean,
  t: TFunction,
): { labels: string[]; datasets: MonthlyDebtChartDataset[] } {
  const monthMap: Record<string, { paid: number; balance: number }> = {};

  invoices.forEach((inv) => {
    const dateStr = inv.invoiceDate;
    if (!dateStr) return;
    const monthKey = String(dateStr).slice(0, 7); // "YYYY-MM"
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { paid: 0, balance: 0 };
    }
    monthMap[monthKey].paid += Number(inv.paidAmount) || 0;
    monthMap[monthKey].balance += Number(inv.balanceAmount) || 0;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const labels = sortedMonths.map((m) => {
    const [year, month] = m.split("-");
    return `Th${month}/${year?.slice(2) || ""}`;
  });
  const paidData = sortedMonths.map((m) => monthMap[m].paid);
  const balData = sortedMonths.map((m) => monthMap[m].balance);

  return {
    labels,
    datasets: [
      {
        label: isCustomer
          ? t("debts:drawer.collectedAmount", "Đã thu")
          : t("debts:drawer.paidAmount", "Đã trả"),
        data: paidData,
        color: "#10b981", // emerald-500
      },
      {
        label: t("debts:drawer.balanceAmount", "Còn nợ"),
        data: balData,
        color: "#f97316", // orange-500
      },
    ],
  };
}

export function computeMonthlyDebtTableData(
  invoices: PartnerInvoiceDetailItem[],
): MonthlyDebtTableRow[] {
  const monthMap: Record<
    string,
    { count: number; total: number; paid: number; balance: number }
  > = {};

  invoices.forEach((inv) => {
    const dateStr = inv.invoiceDate;
    if (!dateStr) return;
    const monthKey = String(dateStr).slice(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { count: 0, total: 0, paid: 0, balance: 0 };
    }
    monthMap[monthKey].count += 1;
    monthMap[monthKey].total += Number(inv.totalAmount) || 0;
    monthMap[monthKey].paid += Number(inv.paidAmount) || 0;
    monthMap[monthKey].balance += Number(inv.balanceAmount) || 0;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  return sortedMonths.map((m) => {
    const [year, month] = m.split("-");
    const item = monthMap[m];
    const rate =
      item.total > 0 ? Math.round((item.paid / item.total) * 100) : 0;

    return {
      id: m,
      monthKey: m,
      monthLabel: `Th${month}/${year?.slice(2) || ""}`,
      invoiceCount: item.count,
      totalAmount: item.total,
      paidAmount: item.paid,
      balanceAmount: item.balance,
      rate,
    };
  });
}

export function computeAgingDonutItems(
  totals: DebtTotals,
  t: TFunction,
): AgingDonutItem[] {
  return [
    {
      id: "aging0_30",
      label: t("debts:drawer.aging0_30", "0 - 30 ngày (Trong hạn)"),
      value: totals.aging0_30,
      color: "#10b981", // emerald-500
    },
    {
      id: "aging31_60",
      label: t("debts:drawer.aging31_60", "31 - 60 ngày (Cần theo dõi)"),
      value: totals.aging31_60,
      color: "#f59e0b", // amber-500
    },
    {
      id: "aging61_90",
      label: t("debts:drawer.aging61_90", "61 - 90 ngày (Quá hạn)"),
      value: totals.aging61_90,
      color: "#f97316", // orange-500
    },
    {
      id: "agingOver90",
      label: t("debts:drawer.agingOver90", "> 90 ngày (Quá hạn nghiêm trọng)"),
      value: totals.agingOver90,
      color: "#ef4444", // rose-500
    },
  ].filter((item) => item.value > 0 || totals.totalBalance === 0);
}

export function computeCumulativeTrendData(
  invoices: PartnerInvoiceDetailItem[],
  isCustomer: boolean,
  t: TFunction,
): { labels: string[]; datasets: CumulativeTrendDataset[] } {
  const monthMap: Record<string, { total: number; paid: number }> = {};

  invoices.forEach((inv) => {
    const dateStr = inv.invoiceDate;
    if (!dateStr) return;
    const monthKey = String(dateStr).slice(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { total: 0, paid: 0 };
    }
    monthMap[monthKey].total += Number(inv.totalAmount) || 0;
    monthMap[monthKey].paid += Number(inv.paidAmount) || 0;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const labels = sortedMonths.map((m) => {
    const [year, month] = m.split("-");
    return `Th${month}/${year?.slice(2) || ""}`;
  });

  let runningTotal = 0;
  let runningPaid = 0;
  const cumTotalData: number[] = [];
  const cumPaidData: number[] = [];
  const balanceData: number[] = [];

  sortedMonths.forEach((m) => {
    runningTotal += monthMap[m].total;
    runningPaid += monthMap[m].paid;
    cumTotalData.push(runningTotal);
    cumPaidData.push(runningPaid);
    balanceData.push(Math.max(0, runningTotal - runningPaid));
  });

  return {
    labels,
    datasets: [
      {
        label: t("debts:drawer.cumTotal", "Tổng giá trị HĐ tích lũy"),
        data: cumTotalData,
        color: "#475569", // slate-600 (No Blue Mandate)
        fill: false,
      },
      {
        label: isCustomer
          ? t("debts:drawer.cumPaid", "Tiền đã thu tích lũy")
          : t("debts:drawer.cumPaidSupplier", "Tiền đã trả tích lũy"),
        data: cumPaidData,
        color: "#10b981", // emerald-500
        fill: false,
      },
      {
        label: t("debts:drawer.cumBalance", "Dư nợ còn lại"),
        data: balanceData,
        color: "#ef4444", // rose-500
        fill: false,
        borderDash: [4, 4],
      },
    ],
  };
}

export function computeMonthlyRecoveryRateData(
  invoices: PartnerInvoiceDetailItem[],
  isCustomer: boolean,
  t: TFunction,
): { labels: string[]; datasets: RecoveryRateDataset[] } {
  const monthMap: Record<string, { total: number; paid: number }> = {};

  invoices.forEach((inv) => {
    const dateStr = inv.invoiceDate;
    if (!dateStr) return;
    const monthKey = String(dateStr).slice(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { total: 0, paid: 0 };
    }
    monthMap[monthKey].total += Number(inv.totalAmount) || 0;
    monthMap[monthKey].paid += Number(inv.paidAmount) || 0;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const labels = sortedMonths.map((m) => {
    const [year, month] = m.split("-");
    return `Th${month}/${year?.slice(2) || ""}`;
  });

  const rates = sortedMonths.map((m) => {
    const item = monthMap[m];
    if (item.total <= 0) return 100;
    return Math.min(100, Math.round((item.paid / item.total) * 100));
  });

  return {
    labels,
    datasets: [
      {
        label: isCustomer
          ? t("debts:drawer.recoveryRateBar", "Tỷ lệ thu hồi (%)")
          : t("debts:drawer.paymentRateBar", "Tỷ lệ thanh toán (%)"),
        data: rates,
        color: "#10b981", // emerald-500
      },
    ],
  };
}
