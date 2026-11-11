import React, { useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { V2ComboChart } from "@/v2/shared/components/organisms/v2-chart";
import type { V2ComboSeries } from "@/v2/shared/components/organisms/v2-chart/V2Chart.type";
import { LoanCashflowChartProps } from "./LoanCashflowChart.type";

function formatCompact(val: number): string {
  if (Math.abs(val) >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(0)} tr`;
  }
  return val.toLocaleString("vi-VN");
}

export const LoanCashflowChart: React.FC<LoanCashflowChartProps> = ({
  schedule,
  title,
  subtitle,
  className = "",
  height = 320,
}) => {
  const { t } = useV2Translation();

  const labels = useMemo(() => {
    return schedule.map((p, idx) => {
      if (p.monthKey) return p.monthKey;
      if (p.month) return p.month;
      if (p.periodNumber) return `Kỳ ${p.periodNumber}`;
      return `T${idx + 1}`;
    });
  }, [schedule]);

  const series: V2ComboSeries[] = useMemo(() => {
    return [
      {
        key: "principal",
        label: t("v2.loans.cashflow.chartPrincipal", "Tiền gốc"),
        type: "bar",
        data: schedule.map((p) => Math.round(p.principalDue)),
      },
      {
        key: "interest",
        label: t("v2.loans.cashflow.chartInterest", "Tiền lãi"),
        type: "bar",
        data: schedule.map((p) => Math.round(p.interestDue)),
      },
      {
        key: "remaining",
        label: t("v2.loans.cashflow.chartRemaining", "Dư nợ còn lại"),
        type: "line",
        data: schedule.map((p) =>
          Math.round(
            p.endingBalance ??
              p.remainingPrincipal ??
              p.cumulativeRemainingPrincipal ??
              0,
          ),
        ),
        secondaryAxis: true,
      },
    ];
  }, [schedule, t]);

  if (!schedule || schedule.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 shadow-xs ${className}`}
    >
      <div className="mb-4">
        <V2Text as="h3" variant="h3" className="font-semibold text-base">
          {title ||
            t(
              "v2.loans.cashflow.chartTitle",
              "Biểu Đồ Áp Lực Dòng Tiền Trả Nợ Hàng Tháng",
            )}
        </V2Text>
        <V2Text variant="caption" className="text-muted-foreground">
          {subtitle ||
            t(
              "v2.loans.cashflow.chartSubtitle",
              "So sánh gốc, lãi hàng tháng và lộ trình giảm dần dư nợ toàn doanh nghiệp",
            )}
        </V2Text>
      </div>

      <V2ComboChart
        labels={labels}
        series={series}
        stacked={true}
        formatValue={formatCompact}
        secondaryFormatValue={formatCompact}
        height={height}
        ariaLabel={t(
          "v2.loans.cashflow.chartAriaLabel",
          "Biểu đồ áp lực dòng tiền trả nợ hàng tháng",
        )}
      />
    </div>
  );
};
LoanCashflowChart.displayName = "LoanCashflowChart";
