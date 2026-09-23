import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChartTheme } from "@/shared/utils/chartTheme";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { GarageConversionFunnelCardProps } from "./types";
import {
  CLASSIFICATION_CONFIG,
  formatMonthLabel,
  getStatusColor,
} from "./utils/funnelConfig";
import {
  calculateTimelineDatasets,
  calculateClassificationTableRows,
} from "./utils/funnelDataCalculators";
import type { GarageConversionFunnelClassificationItem } from "../../api/garageDashboardApi";

export function useGarageConversionFunnelLogic(
  props: GarageConversionFunnelCardProps,
) {
  const {
    funnel,
    byMonth = {},
    availableMonths = [],
    projectedToday,
    projectedMonth,
    statusDistribution = [],
    statusDistributionByMonth = {},
    classificationDistribution = [],
    classificationDistributionByMonth = {},
    loading,
  } = props;

  const { t } = useTranslation("garage");
  const { gridColor, tickColor } = useChartTheme();

  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"AMOUNT" | "COUNT">("AMOUNT");

  // Dữ liệu phễu hiển thị dựa trên tháng được chọn (hoặc Toàn bộ 6 tháng)
  const activeFunnel = useMemo(() => {
    if (selectedMonth === "ALL" || !byMonth[selectedMonth]) {
      return funnel;
    }
    return byMonth[selectedMonth];
  }, [selectedMonth, byMonth, funnel]);

  const monthOptions: ComboboxOption[] = useMemo(() => {
    const totalCount = funnel?.totalIntake?.count || 0;
    const opts: ComboboxOption[] = [
      {
        value: "ALL",
        label: `${t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")} (${totalCount} ${t("dashboard.funnel.casesUnit", "tiếp nhận")})`,
      },
    ];
    availableMonths.forEach((m) => {
      const mData = byMonth[m];
      const mCount = mData?.totalIntake?.count || 0;
      opts.push({
        value: m,
        label: `${formatMonthLabel(m)} (${mCount} ${t("dashboard.funnel.casesUnit", "tiếp nhận")})`,
      });
    });
    return opts;
  }, [funnel, availableMonths, byMonth, t]);

  const {
    totalIntake = { count: 0, amount: 0, rate: 100 },
    inProgress = { count: 0, amount: 0, rate: 0 },
    completed = { count: 0, amount: 0, rate: 0 },
    cancelled = { count: 0, amount: 0, rate: 0 },
    byClassification = {} as Record<
      string,
      GarageConversionFunnelClassificationItem
    >,
  } = activeFunnel || {};

  const isAmount = viewMode === "AMOUNT";

  // Timeline Data: strictly sorted chronologically from left to right
  const timelineMonths = useMemo(() => {
    const list =
      availableMonths.length > 0 ? [...availableMonths] : Object.keys(byMonth);
    return list.sort((a, b) => a.localeCompare(b));
  }, [availableMonths, byMonth]);

  const timelineLabels = useMemo(() => {
    return timelineMonths.map((m) => formatMonthLabel(m));
  }, [timelineMonths]);

  const timelineDatasets = useMemo(() => {
    return calculateTimelineDatasets(timelineMonths, byMonth, isAmount, t);
  }, [timelineMonths, byMonth, isAmount, t]);

  // Donut Chart Data: Active Classification
  const activeClassificationData = useMemo(() => {
    if (
      selectedMonth === "ALL" ||
      !classificationDistributionByMonth[selectedMonth]
    ) {
      return classificationDistribution;
    }
    return classificationDistributionByMonth[selectedMonth];
  }, [
    selectedMonth,
    classificationDistributionByMonth,
    classificationDistribution,
  ]);

  const classificationDonutItems = useMemo(() => {
    return activeClassificationData.map((d) => ({
      label: d.classificationName,
      value: isAmount ? d.revenue || 0 : d.count || 0,
      color: CLASSIFICATION_CONFIG[d.classificationKey]?.dot || "#64748b",
    }));
  }, [activeClassificationData, isAmount]);

  const totalClassificationVal = useMemo(() => {
    return classificationDonutItems.reduce((s, d) => s + (d.value || 0), 0);
  }, [classificationDonutItems]);

  // Donut Chart Data: Active Status
  const activeStatusData = useMemo(() => {
    if (selectedMonth === "ALL" || !statusDistributionByMonth[selectedMonth]) {
      return statusDistribution;
    }
    return statusDistributionByMonth[selectedMonth];
  }, [selectedMonth, statusDistributionByMonth, statusDistribution]);

  const statusDonutItems = useMemo(() => {
    return activeStatusData.map((d, index) => ({
      label: d.statusName,
      value: isAmount ? d.revenue || 0 : d.count || 0,
      color: getStatusColor(d.statusName, index),
    }));
  }, [activeStatusData, isAmount]);

  const totalStatusVal = useMemo(() => {
    return statusDonutItems.reduce((s, d) => s + (d.value || 0), 0);
  }, [statusDonutItems]);

  // Standardized DataTable rows according to /standardize-table
  const tableRows = useMemo(() => {
    return calculateClassificationTableRows(byClassification);
  }, [byClassification]);

  return {
    t,
    loading,
    gridColor,
    tickColor,
    selectedMonth,
    setSelectedMonth,
    viewMode,
    setViewMode,
    isAmount,
    activeFunnel,
    monthOptions,
    totalIntake,
    inProgress,
    completed,
    cancelled,
    projectedToday,
    projectedMonth,
    timelineMonths,
    timelineLabels,
    timelineDatasets,
    classificationDonutItems,
    totalClassificationVal,
    statusDonutItems,
    totalStatusVal,
    tableRows,
  };
}
