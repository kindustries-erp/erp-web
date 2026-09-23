import React from "react";
import {
  Calendar,
  AlertTriangle,
  AlertOctagon,
  Clock,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { CHART_COLORS } from "./constants";
import type {
  TimeHorizonKey,
  HorizonMeta,
  TimeHorizonDailyForecastItem,
  ForecastScheduleRow,
  MonthlyBreakdownRow,
} from "./types";

/**
 * Get visual metadata, badges, and recommendations for a given TimeHorizonKey
 */
export function getHorizonMeta(
  horizon: TimeHorizonKey | null,
  t: (key: string, fallback?: any) => string,
): HorizonMeta {
  switch (horizon) {
    case "nextWeekDue":
      return {
        title: t("debts:dashboard.freshDebt7", "Mới phát sinh (≤ 7 ngày)"),
        badge: t("debts:dashboard.freshBadge", "Mới"),
        badgeVariant: "outline",
        icon: React.createElement(Calendar, {
          className: "w-4 h-4 text-emerald-600",
        }),
        recommendation: t(
          "debts:horizonDrawer.recNextWeek",
          "Các khoản nợ mới phát sinh trong 7 ngày gần nhất, đang trong hạn luân chuyển chứng từ và chuẩn bị đối chiếu công nợ ban đầu.",
        ),
      };
    case "nextMonthDue":
      return {
        title: t(
          "debts:dashboard.standardDebt30",
          "Trong hạn chuẩn (≤ 30 ngày)",
        ),
        badge: t("debts:dashboard.standardBadge", "Chuẩn"),
        badgeVariant: "default",
        icon: React.createElement(Calendar, {
          className: "w-4 h-4 text-primary",
        }),
        recommendation: t(
          "debts:horizonDrawer.recNextMonth",
          "Các khoản nợ trong hạn tiêu chuẩn thông thường (0-30 ngày). Cần theo dõi sát hạn thanh toán và chuẩn bị nguồn tiền cân đối dòng tiền chi trả.",
        ),
      };
    case "overdue30To90":
      return {
        title: t("debts:dashboard.overdue30To90", "Quá hạn 31-90 ngày"),
        badge: t("debts:dashboard.urgentBadge", "Đôn đốc"),
        badgeVariant: "outline",
        icon: React.createElement(AlertTriangle, {
          className: "w-4 h-4 text-orange-600",
        }),
        recommendation: t(
          "debts:horizonDrawer.recOverdue30To90",
          "Các khoản nợ quá hạn từ 31 đến 90 ngày cần được đôn đốc quyết liệt. Gửi công văn đối soát và nhắc nợ đối với các khách hàng trọng yếu.",
        ),
      };
    case "criticalOverdue90Plus":
      return {
        title: t("debts:dashboard.criticalOverdue90Plus", "Quá hạn >90 ngày"),
        badge: t("debts:dashboard.warningBadge", "Cảnh báo"),
        badgeVariant: "destructive",
        icon: React.createElement(AlertOctagon, {
          className: "w-4 h-4 text-rose-600",
        }),
        recommendation: t(
          "debts:horizonDrawer.recCriticalOverdue90Plus",
          "Cảnh báo rủi ro cao đối với các khoản nợ quá hạn >90 ngày. Cần kích hoạt quy trình thu hồi nợ nghiêm ngặt và xem xét trích lập dự phòng nợ phải thu khó đòi.",
        ),
      };
    case "forecastNext7Days":
      return {
        title: t(
          "debts:dashboard.forecastNext7Days",
          "Dự báo Tuần tới (7 ngày)",
        ),
        badge: t("debts:dashboard.forecastT7Badge", "T+7 (Lag)"),
        badgeVariant: "outline",
        icon: React.createElement(Calendar, {
          className: "w-4 h-4 text-emerald-600",
        }),
        recommendation: t(
          "debts:horizonDrawer.recForecastNext7Days",
          "Dự phóng dòng tiền thực tế sẽ phát sinh trong 7 ngày tới dựa trên độ trễ thanh toán trung bình (DSO/DPO) lịch sử của từng đối tác.",
        ),
      };
    case "forecastNext30Days":
      return {
        title: t(
          "debts:dashboard.forecastNext30Days",
          "Kế hoạch Tháng tới (30 ngày)",
        ),
        badge: t("debts:dashboard.forecastT30Badge", "T+30 (Lag)"),
        badgeVariant: "default",
        icon: React.createElement(Calendar, {
          className: "w-4 h-4 text-primary",
        }),
        recommendation: t(
          "debts:horizonDrawer.recForecastNext30Days",
          "Kế hoạch dòng tiền luân chuyển trong vòng 30 ngày tới. Cân đối các khoản thu từ khách hàng có độ trễ ngắn để chuẩn bị nguồn thanh toán cho nhà cung cấp.",
        ),
      };
    case "expectedCashflow":
      return {
        title: t(
          "debts:dashboard.expectedCashflow",
          "Dòng tiền Kỳ vọng (IFRS 9)",
        ),
        badge: t("debts:dashboard.forecastExpectedBadge", "Kỳ vọng"),
        badgeVariant: "outline",
        icon: React.createElement(TrendingUp, {
          className: "w-4 h-4 text-indigo-600",
        }),
        recommendation: t(
          "debts:horizonDrawer.recExpectedCashflow",
          "Giá trị dòng tiền kỳ vọng thực thu/thực chi sau khi áp dụng ma trận xác suất thu hồi nợ IFRS 9 dựa trên mức độ trễ hạn của từng khoản nợ.",
        ),
      };
    case "defaultRiskProvision":
      return {
        title: t("debts:dashboard.defaultRiskProvision", "Dự phòng Rủi ro Nợ"),
        badge: t("debts:dashboard.forecastRiskBadge", "Rủi ro"),
        badgeVariant: "destructive",
        icon: React.createElement(ShieldAlert, {
          className: "w-4 h-4 text-rose-600",
        }),
        recommendation: t(
          "debts:horizonDrawer.recDefaultRiskProvision",
          "Giá trị nợ cần trích lập dự phòng rủi ro khó đòi theo IFRS 9 đối với các khoản nợ quá hạn kéo dài hoặc đối tác có lịch sử thanh toán chậm bất thường.",
        ),
      };
    default:
      return {
        title: t("debts:title", "Công nợ"),
        badge: "Chi tiết",
        badgeVariant: "default",
        icon: React.createElement(Clock, {
          className: "w-4 h-4 text-primary",
        }),
        recommendation: "",
      };
  }
}

/**
 * Format daily forecast data for BarChart
 */
export function formatDailyForecastBarData(
  raw: TimeHorizonDailyForecastItem[] = [],
  isReceivable: boolean,
  t: (key: string, fallback?: any) => string,
) {
  const sorted = [...raw].sort((a, b) => {
    if (a.dateKey === "OVERDUE") return -1;
    if (b.dateKey === "OVERDUE") return 1;
    return a.dateKey.localeCompare(b.dateKey);
  });

  const labels = sorted.map((d) => {
    if (d.dateKey === "OVERDUE") {
      return t("debts:horizonDrawer.forecastOverdueBucket", "Quá hạn");
    }
    const parts = d.dateKey.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.dateKey;
  });

  const outData = sorted.map((d) => (isReceivable ? d.outAmount : d.inAmount));
  const inData = sorted.map((d) => (isReceivable ? d.inAmount : d.outAmount));

  return {
    labels,
    datasets: [
      {
        label: isReceivable
          ? t("debts:horizonDrawer.forecastDailyReceivable", "Dự thu")
          : t("debts:horizonDrawer.forecastDailyPayable", "Dự chi"),
        data: outData,
        color: isReceivable ? CHART_COLORS.emerald : CHART_COLORS.amber,
      },
      {
        label: isReceivable
          ? t("debts:horizonDrawer.forecastDailyPayable", "Dự chi")
          : t("debts:horizonDrawer.forecastDailyReceivable", "Dự thu"),
        data: inData,
        color: isReceivable ? CHART_COLORS.amber : CHART_COLORS.emerald,
      },
    ],
  };
}

/**
 * Format cumulative forecast data for LineChart
 */
export function formatCumulativeForecastData(
  raw: TimeHorizonDailyForecastItem[] = [],
  isReceivable: boolean,
  t: (key: string, fallback?: any) => string,
) {
  const sorted = [...raw].sort((a, b) => {
    if (a.dateKey === "OVERDUE") return -1;
    if (b.dateKey === "OVERDUE") return 1;
    return a.dateKey.localeCompare(b.dateKey);
  });

  const labels = sorted.map((d) => {
    if (d.dateKey === "OVERDUE") {
      return t("debts:horizonDrawer.forecastOverdueBucket", "Quá hạn");
    }
    const parts = d.dateKey.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.dateKey;
  });

  const cumOutData: number[] = [];
  const cumInData: number[] = [];
  const netData: number[] = [];

  let accOut = 0;
  let accIn = 0;

  for (const d of sorted) {
    accOut += isReceivable ? d.outAmount : d.inAmount;
    accIn += isReceivable ? d.inAmount : d.outAmount;
    cumOutData.push(accOut);
    cumInData.push(accIn);
    netData.push(accOut - accIn);
  }

  return {
    labels,
    datasets: [
      {
        label: isReceivable
          ? t(
              "debts:horizonDrawer.forecastCumulativeReceivable",
              "Dự thu tích lũy",
            )
          : t(
              "debts:horizonDrawer.forecastCumulativePayable",
              "Dự chi tích lũy",
            ),
        data: cumOutData,
        borderColor: isReceivable ? CHART_COLORS.emerald : CHART_COLORS.amber,
        borderWidth: 2,
        fill: false,
      },
      {
        label: isReceivable
          ? t(
              "debts:horizonDrawer.forecastCumulativePayable",
              "Dự chi tích lũy",
            )
          : t(
              "debts:horizonDrawer.forecastCumulativeReceivable",
              "Dự thu tích lũy",
            ),
        data: cumInData,
        borderColor: isReceivable ? CHART_COLORS.amber : CHART_COLORS.emerald,
        borderWidth: 2,
        fill: false,
      },
      {
        label: t("debts:horizonDrawer.forecastCumulativeNet", "Vị thế ròng"),
        data: netData,
        borderColor: CHART_COLORS.lineNet,
        borderWidth: 2.5,
        fill: false,
      },
    ],
  };
}

/**
 * Calculate forecast schedule rows for DataTable
 */
export function calculateForecastScheduleRows(
  raw: TimeHorizonDailyForecastItem[] = [],
  isReceivable: boolean,
  overdueRowLabel: string,
): ForecastScheduleRow[] {
  const sorted = [...raw].sort((a, b) => {
    if (a.dateKey === "OVERDUE") return -1;
    if (b.dateKey === "OVERDUE") return 1;
    return a.dateKey.localeCompare(b.dateKey);
  });

  return sorted.map((d) => {
    const recv = isReceivable ? d.outAmount : d.inAmount;
    const pay = isReceivable ? d.inAmount : d.outAmount;
    const parts = d.dateKey.split("-");
    const displayDate =
      d.dateKey === "OVERDUE"
        ? overdueRowLabel
        : parts.length === 3
          ? `${parts[2]}/${parts[1]}/${parts[0]}`
          : d.dateKey;

    return {
      dateKey: d.dateKey,
      displayDate,
      receivable: recv,
      payable: pay,
      net: recv - pay,
      invoiceCount: (d.outCount || 0) + (d.inCount || 0),
    };
  });
}

/**
 * Calculate Monthly Breakdown Rows
 */
export function calculateMonthlyBreakdownStats(
  monthlyStats: any[] = [],
  isReceivable: boolean,
): MonthlyBreakdownRow[] {
  return monthlyStats.map((item) => {
    const totalAmount = isReceivable
      ? item.receivableTotalAmount || item.outTotal || item.totalOutAmount || 0
      : item.payableTotalAmount || item.inTotal || item.totalInAmount || 0;

    const paidAmount = isReceivable
      ? item.receivedAmount || item.outPaid || 0
      : item.paidAmount || item.inPaid || 0;

    const balanceAmount = isReceivable
      ? item.receivableBalance ||
        item.outBalance ||
        Math.max(0, totalAmount - paidAmount)
      : item.payableBalance ||
        item.inBalance ||
        Math.max(0, totalAmount - paidAmount);

    const rate =
      totalAmount > 0
        ? Number(((paidAmount / totalAmount) * 100).toFixed(1))
        : 0;

    const parts = item.month?.split("-") || [];
    const monthLabel =
      parts.length === 2 ? `Thg ${parts[1]}/${parts[0]}` : item.month;

    return {
      month: item.month,
      monthLabel,
      invoiceCount: item.invoiceCount || 0,
      totalAmount,
      paidAmount,
      balanceAmount,
      rate,
    };
  });
}

/**
 * Calculate Branch Breakdown Bar Chart Data
 */
export function calculateBranchBarData(
  branchBreakdown: any[] = [],
  isReceivable: boolean,
  t: (key: string, fallback?: any) => string,
) {
  if (!branchBreakdown || branchBreakdown.length === 0) return null;

  const labels = branchBreakdown.map((b) =>
    b.branchId === "UNASSIGNED"
      ? t("debts:horizonDrawer.unassignedBranch", "Chưa phân chi nhánh")
      : b.branchName || b.branchCode || b.branchId,
  );
  const data = branchBreakdown.map((b) =>
    isReceivable ? b.outAmount || 0 : b.inAmount || 0,
  );

  return {
    labels,
    datasets: [
      {
        label: isReceivable
          ? t("debts:horizonDrawer.tabReceivablesShort", "Phải thu")
          : t("debts:horizonDrawer.tabPayablesShort", "Phải trả"),
        data,
        color: isReceivable ? CHART_COLORS.emerald : CHART_COLORS.amber,
      },
    ],
  };
}

/**
 * Calculate Top Partners Bar Chart Data
 */
export function calculateTopPartnersBarData(
  partners: any[] = [],
  isReceivable: boolean,
  t: (key: string, fallback?: any) => string,
) {
  if (!partners || partners.length === 0) return null;

  const labels = partners.map((p) => {
    const name = p.partnerName || p.taxCode || "";
    return name.length > 20 ? name.slice(0, 18) + "..." : name;
  });
  const data = partners.map((p) =>
    p.contributingAmount !== undefined
      ? p.contributingAmount
      : p.balanceAmount || 0,
  );

  return {
    labels,
    datasets: [
      {
        label: isReceivable
          ? t("debts:horizonDrawer.tabReceivablesShort", "Phải thu")
          : t("debts:horizonDrawer.tabPayablesShort", "Phải trả"),
        data,
        color: isReceivable ? CHART_COLORS.blue : CHART_COLORS.amber,
      },
    ],
  };
}

/**
 * Calculate IFRS-9 Exposure Comparison Bar Data (Tổng Nợ vs Tiền kỳ vọng vs Dự phòng rủi ro)
 */
export function calculateIfrs9ComparisonData(
  agingBreakdown: any,
  isReceivable: boolean,
  horizon: TimeHorizonKey | null,
  t: (key: string, fallback?: any) => string,
) {
  if (!agingBreakdown) return null;
  const isRiskHorizon = horizon === "defaultRiskProvision";

  const labels = ["≤ 30 ngày", "31 - 60 ngày", "61 - 90 ngày", "> 90 ngày"];
  const outAging = [
    agingBreakdown.outAging0_30 || 0,
    agingBreakdown.outAging31_60 || 0,
    agingBreakdown.outAging61_90 || 0,
    agingBreakdown.outAgingOver90 || 0,
  ];
  const inAging = [
    agingBreakdown.inAging0_30 || 0,
    agingBreakdown.inAging31_60 || 0,
    agingBreakdown.inAging61_90 || 0,
    agingBreakdown.inAgingOver90 || 0,
  ];
  const balanceData = isReceivable ? outAging : inAging;

  const expectedWeights = isReceivable
    ? [0.85, 0.6, 0.3, 0.1]
    : [0.95, 0.85, 0.7, 0.5];
  const riskWeights = isReceivable
    ? [0.15, 0.4, 0.7, 0.9]
    : [0.05, 0.15, 0.3, 0.5];

  const expectedData = balanceData.map((b, i) =>
    Math.round(b * expectedWeights[i]),
  );
  const riskData = balanceData.map((b, i) => Math.round(b * riskWeights[i]));

  return {
    labels,
    datasets: isRiskHorizon
      ? [
          {
            label: t("debts:horizonDrawer.totalBalanceLabel", "Tổng dư nợ gốc"),
            data: balanceData,
            color: CHART_COLORS.slate,
          },
          {
            label: t(
              "debts:horizonDrawer.riskProvisionLabel",
              "Dự phòng rủi ro (IFRS 9)",
            ),
            data: riskData,
            color: CHART_COLORS.rose,
          },
        ]
      : [
          {
            label: t("debts:horizonDrawer.totalBalanceLabel", "Tổng dư nợ gốc"),
            data: balanceData,
            color: CHART_COLORS.slate,
          },
          {
            label: t(
              "debts:horizonDrawer.expectedCashflowLabel",
              "Dòng tiền kỳ vọng (IFRS 9)",
            ),
            data: expectedData,
            color: CHART_COLORS.emerald,
          },
        ],
  };
}

/**
 * Calculate Ticket Size Donut Chart Items
 */
export function calculateTicketSizeDonutItems(
  ticketSizeBuckets: any,
  isReceivable: boolean,
  t: (key: string, fallback?: any) => string,
) {
  if (!ticketSizeBuckets) return [];

  const under10m = isReceivable
    ? ticketSizeBuckets.outUnder10mAmount || 0
    : ticketSizeBuckets.inUnder10mAmount || 0;
  const underCount = isReceivable
    ? ticketSizeBuckets.outUnder10mCount || 0
    : ticketSizeBuckets.inUnder10mCount || 0;

  const from10to50m = isReceivable
    ? ticketSizeBuckets.out10mTo50mAmount || 0
    : ticketSizeBuckets.in10mTo50mAmount || 0;
  const f10Count = isReceivable
    ? ticketSizeBuckets.out10mTo50mCount || 0
    : ticketSizeBuckets.in10mTo50mCount || 0;

  const from50to100m = isReceivable
    ? ticketSizeBuckets.out50mTo100mAmount || 0
    : ticketSizeBuckets.in50mTo100mAmount || 0;
  const f50Count = isReceivable
    ? ticketSizeBuckets.out50mTo100mCount || 0
    : ticketSizeBuckets.in50mTo100mCount || 0;

  const over100m = isReceivable
    ? ticketSizeBuckets.outOver100mAmount || 0
    : ticketSizeBuckets.inOver100mAmount || 0;
  const overCount = isReceivable
    ? ticketSizeBuckets.outOver100mCount || 0
    : ticketSizeBuckets.inOver100mCount || 0;

  return [
    {
      id: "under10m",
      label: `${t("debts:horizonDrawer.ticketSizeUnder10m", "< 10 triệu")} (${underCount} HĐ)`,
      value: under10m,
      color: CHART_COLORS.emerald,
    },
    {
      id: "10mTo50m",
      label: `${t("debts:horizonDrawer.ticketSize10mTo50m", "10 - 50 triệu")} (${f10Count} HĐ)`,
      value: from10to50m,
      color: CHART_COLORS.blue,
    },
    {
      id: "50mTo100m",
      label: `${t("debts:horizonDrawer.ticketSize50mTo100m", "50 - 100 triệu")} (${f50Count} HĐ)`,
      value: from50to100m,
      color: CHART_COLORS.amber,
    },
    {
      id: "over100m",
      label: `${t("debts:horizonDrawer.ticketSizeOver100m", "> 100 triệu")} (${overCount} HĐ)`,
      value: over100m,
      color: CHART_COLORS.rose,
    },
  ].filter((x) => x.value > 0);
}

/**
 * Calculate Aging Donut Chart Items
 */
export function calculateAgingDonutItems(
  agingBreakdown: any,
  isReceivable: boolean,
  t: (key: string, fallback?: any) => string,
) {
  if (!agingBreakdown) return [];
  const a0_30 = isReceivable
    ? agingBreakdown.outAging0_30 || 0
    : agingBreakdown.inAging0_30 || 0;
  const a31_60 = isReceivable
    ? agingBreakdown.outAging31_60 || 0
    : agingBreakdown.inAging31_60 || 0;
  const a61_90 = isReceivable
    ? agingBreakdown.outAging61_90 || 0
    : agingBreakdown.inAging61_90 || 0;
  const aOver90 = isReceivable
    ? agingBreakdown.outAgingOver90 || 0
    : agingBreakdown.inAgingOver90 || 0;
  const totalBal = a0_30 + a31_60 + a61_90 + aOver90;

  return [
    {
      id: "aging0_30",
      label: t("debts:drawer.aging0_30", "0 - 30 ngày (Trong hạn)"),
      value: a0_30,
      color: CHART_COLORS.emerald,
    },
    {
      id: "aging31_60",
      label: t("debts:drawer.aging31_60", "31 - 60 ngày (Cần theo dõi)"),
      value: a31_60,
      color: CHART_COLORS.amber,
    },
    {
      id: "aging61_90",
      label: t("debts:drawer.aging61_90", "61 - 90 ngày (Quá hạn)"),
      value: a61_90,
      color: CHART_COLORS.amber,
    },
    {
      id: "agingOver90",
      label: t("debts:drawer.agingOver90", "> 90 ngày (Quá hạn nghiêm trọng)"),
      value: aOver90,
      color: CHART_COLORS.rose,
    },
  ].filter((item) => item.value > 0 || totalBal === 0);
}
