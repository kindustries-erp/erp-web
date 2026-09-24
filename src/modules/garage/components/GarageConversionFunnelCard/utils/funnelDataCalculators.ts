import type { TFunction } from "i18next";
import type {
  GarageConversionFunnel,
  GarageConversionFunnelClassificationItem,
} from "@/modules/garage/api/garageDashboardApi";
import type { ClassificationTableRow } from "../types";
import { CLASSIFICATION_CONFIG, ORDERED_KEYS } from "./funnelConfig";

export function calculateTimelineDatasets(
  timelineMonths: string[],
  byMonth: Record<string, GarageConversionFunnel>,
  isAmount: boolean,
  t: TFunction,
) {
  const completedData = timelineMonths.map((m) => {
    const item = byMonth[m];
    return isAmount
      ? item?.completed?.amount || 0
      : item?.completed?.count || 0;
  });

  const inProgressData = timelineMonths.map((m) => {
    const item = byMonth[m];
    return isAmount
      ? item?.inProgress?.amount || 0
      : item?.inProgress?.count || 0;
  });

  const cancelledData = timelineMonths.map((m) => {
    const item = byMonth[m];
    return isAmount
      ? item?.cancelled?.amount || 0
      : item?.cancelled?.count || 0;
  });

  const completionRateData = timelineMonths.map((m) => {
    const item = byMonth[m];
    return item?.completed?.rate || 0;
  });

  return [
    {
      type: "bar" as const,
      label: t("dashboard.funnel.chartCompleted", "Hoàn tất (Doanh thu)"),
      data: completedData,
      backgroundColor: "#10b981",
      borderColor: "#10b981",
      stack: "timeline",
      borderRadius: 3,
      barPercentage: 0.5,
      yAxisID: "y",
    },
    {
      type: "bar" as const,
      label: t("dashboard.funnel.chartInProgress", "Đang làm (Dự thu)"),
      data: inProgressData,
      backgroundColor: "#6366f1",
      borderColor: "#6366f1",
      stack: "timeline",
      borderRadius: 3,
      barPercentage: 0.5,
      yAxisID: "y",
    },
    {
      type: "bar" as const,
      label: t("dashboard.funnel.chartCancelled", "Đã hủy"),
      data: cancelledData,
      backgroundColor: "#ef4444",
      borderColor: "#ef4444",
      stack: "timeline",
      borderRadius: 3,
      barPercentage: 0.5,
      yAxisID: "y",
    },
    {
      type: "line" as const,
      label: t("dashboard.funnel.chartCompletionRate", "Tỷ lệ hoàn tất (%)"),
      data: completionRateData,
      borderColor: "#f59e0b",
      backgroundColor: "#f59e0b",
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: "#f59e0b",
      tension: 0.2,
      yAxisID: "y1",
    },
  ];
}

export function calculateClassificationTableRows(
  byClassification: Record<string, GarageConversionFunnelClassificationItem>,
): ClassificationTableRow[] {
  return ORDERED_KEYS.map((key) => {
    const item = byClassification[key] || {
      name: CLASSIFICATION_CONFIG[key]?.defaultName || key,
      totalCount: 0,
      totalAmount: 0,
      inProgressCount: 0,
      inProgressAmount: 0,
      completedCount: 0,
      completedAmount: 0,
      cancelledCount: 0,
      cancelledAmount: 0,
      completionRate: 0,
      cancellationRate: 0,
    };
    const config = CLASSIFICATION_CONFIG[key] || CLASSIFICATION_CONFIG.KHAC;
    return {
      id: key,
      key,
      name: item.name || config.defaultName,
      dot: config.dot,
      icon: config.icon,
      totalCount: item.totalCount,
      totalAmount: item.totalAmount,
      inProgressCount: item.inProgressCount,
      inProgressAmount: item.inProgressAmount,
      completedCount: item.completedCount,
      completedAmount: item.completedAmount,
      cancelledCount: item.cancelledCount,
      cancelledAmount: item.cancelledAmount,
      completionRate: item.completionRate,
      cancellationRate: item.cancellationRate,
    };
  });
}
