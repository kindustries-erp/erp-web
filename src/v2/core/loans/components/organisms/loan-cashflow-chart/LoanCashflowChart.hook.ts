import { useState, useMemo, useCallback } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { V2_CHART_SERIES } from "@/v2/shared/utils/v2ChartPalette";
import type { V2ComboSeries } from "@/v2/shared/components/organisms/v2-chart/V2Chart.type";
import type {
  LoanCashflowChartProps,
  LoanChartItem,
} from "./LoanCashflowChart.type";
import {
  aggregateScheduleByYear,
  buildLoanCashflowSeries,
} from "./LoanCashflowChart.series";

export interface UseLoanCashflowChartResult {
  viewResolution: "year" | "month";
  setUserResolution: (res: "year" | "month") => void;
  hasPaid: boolean;
  labels: string[];
  series: V2ComboSeries[];
  minColWidth?: number;
  contextMenu: {
    period: LoanChartItem;
    position: { x: number; y: number };
  } | null;
  handleBarContextMenu: (
    periodIndex: number,
    datasetIndex: number,
    event: React.MouseEvent,
  ) => void;
  handleCloseMenu: () => void;
}

export function useLoanCashflowChart(
  props: Pick<LoanCashflowChartProps, "schedule" | "onRecordPayment">,
): UseLoanCashflowChartResult {
  const { schedule, onRecordPayment } = props;
  const { t } = useV2Translation();
  const chartTheme = useV2ChartTheme();

  const [contextMenu, setContextMenu] = useState<{
    period: LoanChartItem;
    position: { x: number; y: number };
  } | null>(null);

  const isLongTerm = schedule.length > 36;
  const [userResolution, setUserResolution] = useState<"year" | "month" | null>(
    null,
  );
  const viewResolution = userResolution ?? (isLongTerm ? "year" : "month");

  const activeSchedule = useMemo(() => {
    if (viewResolution === "year" && schedule.length > 24) {
      return aggregateScheduleByYear(schedule);
    }
    return schedule;
  }, [viewResolution, schedule]);

  const hasPaid = useMemo(
    () => activeSchedule.some((p) => p.isPaid),
    [activeSchedule],
  );

  const labels = useMemo(() => {
    return activeSchedule.map((p, idx) => {
      if (p.isPaid && p.periodNumber) return `Kỳ ${p.periodNumber} ✓`;
      if (p.monthKey) return p.monthKey;
      if (p.month) return p.month;
      if (p.periodNumber) return `Kỳ ${p.periodNumber}`;
      return `T${idx + 1}`;
    });
  }, [activeSchedule]);

  const series: V2ComboSeries[] = useMemo(
    () =>
      buildLoanCashflowSeries({
        schedule: activeSchedule,
        palette: V2_CHART_SERIES[chartTheme.mode],
        balanceColor: chartTheme.textPrimary,
        labels: {
          paid: t("v2.loans.cashflow.chartPaid", "Đã trả"),
          unpaid: t("v2.loans.cashflow.chartUnpaid", "Còn phải trả"),
          remaining: t("v2.loans.cashflow.chartRemaining", "Dư nợ còn lại"),
          principal: t("v2.loans.cashflow.chartPrincipal", "Tiền gốc"),
          interest: t("v2.loans.cashflow.chartInterest", "Tiền lãi"),
        },
      }),
    [activeSchedule, t, chartTheme.mode, chartTheme.textPrimary],
  );

  const handleBarContextMenu = useCallback(
    (periodIndex: number, _datasetIndex: number, event: React.MouseEvent) => {
      if (!onRecordPayment) return;
      const targetPeriod = activeSchedule[periodIndex];
      if (!targetPeriod) return;
      setContextMenu({
        period: targetPeriod,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [activeSchedule, onRecordPayment],
  );

  const handleCloseMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const minColWidth =
    viewResolution === "month" && schedule.length > 24 ? 36 : undefined;

  return {
    viewResolution,
    setUserResolution,
    hasPaid,
    labels,
    series,
    minColWidth,
    contextMenu,
    handleBarContextMenu,
    handleCloseMenu,
  };
}
