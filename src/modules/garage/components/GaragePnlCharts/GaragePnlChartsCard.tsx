import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { useChartTheme } from "@/shared/utils/chartTheme";
import { useGaragePnlTrend } from "../../hooks/useGaragePnlTrend";
import {
  buildRatioChartData,
  buildTrendChartData,
  formatPercent,
} from "./buildPnlChartData";
import { PnlChartLegend } from "./PnlChartLegend";

interface Props {
  year: number;
  month: number;
}

/** 2 chart giống sheet "Báo cáo lợi nhuận" của file Excel: 12 tháng kết thúc ở kỳ chọn. */
export function GaragePnlChartsCard({ year, month }: Props) {
  const { t } = useTranslation("garage");
  const { isDark } = useChartTheme();
  const { data, isLoading } = useGaragePnlTrend(year, month);
  const points = data ?? [];
  const hasData = points.some((p) => p.revenue > 0 || p.cogs > 0);

  const trend = buildTrendChartData(
    points,
    {
      revenue: t("pnl.charts.revenue", "Doanh thu"),
      cost: t("pnl.charts.cost", "Chi phí"),
      profit: t("pnl.charts.profit", "Lợi nhuận gộp"),
      margin: t("pnl.charts.margin", "% Lợi nhuận gộp"),
    },
    isDark,
  );
  const ratio = buildRatioChartData(
    points,
    {
      cogs: t("pnl.charts.ratioCogs", "Chi phí phụ tùng / DT"),
      nhanSu: t("pnl.charts.ratioStaff", "Nhân sự / DT"),
      matBang: t("pnl.charts.ratioPremises", "Mặt bằng, điện nước / DT"),
      vatTu: t("pnl.charts.ratioSupplies", "Vật tư tiêu hao / DT"),
      baoTri: t("pnl.charts.ratioMaintenance", "Bảo trì / DT"),
      khauHao: t("pnl.charts.ratioDepreciation", "Khấu hao / DT"),
      khac: t("pnl.charts.ratioOther", "CP vận hành khác / DT"),
    },
    isDark,
  );

  const body = (chart: React.ReactNode) =>
    isLoading ? (
      <ChartSkeleton type="bar" />
    ) : hasData ? (
      chart
    ) : (
      <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
        {t("dashboard.charts.noChartData", "Chưa có dữ liệu biểu đồ")}
      </div>
    );

  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          {t("pnl.charts.trendTitle", "Báo cáo lợi nhuận")}
        </h5>
        <div className="relative h-[320px]">
          {body(
            <BarChart
              labels={trend.labels}
              datasets={trend.datasets}
              dataLabels
              yCallback={(v) => `${Math.round(Number(v) / 1_000_000)}tr`}
              secondaryCallback={(v) => formatPercent(Number(v))}
              secondaryMin={0}
            />,
          )}
        </div>
        <PnlChartLegend
          items={trend.datasets.map((d) => ({
            label: d.label,
            color: d.color,
            isLine: d.type === "line",
          }))}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-5">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {t(
            "pnl.charts.ratioTitle",
            "Tỷ trọng các chỉ số trên 100% doanh thu",
          )}
        </h5>
        <div className="relative h-[320px]">
          {body(
            <BarChart
              labels={ratio.labels}
              datasets={ratio.datasets}
              stacked
              dataLabels
              yCallback={(v) => formatPercent(Number(v))}
            />,
          )}
        </div>
        <PnlChartLegend
          items={ratio.datasets.map((d) => ({
            label: d.label,
            color: d.color,
          }))}
        />
      </section>
    </div>
  );
}
