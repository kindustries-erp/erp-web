import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Percent } from "lucide-react";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/utils";
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

/**
 * Thẻ biểu đồ P&L 12 tháng (kết thúc ở kỳ được chọn):
 * Tích hợp công tắc chuyển đổi (Switch) giữa:
 * 1. Báo cáo lợi nhuận (Doanh thu, Chi phí, Lợi nhuận gộp & % Lợi nhuận)
 * 2. Tỷ trọng các chỉ số trên 100% doanh thu (Cơ cấu chi phí phụ tùng, nhân sự, mặt bằng, v.v.)
 */
export function GaragePnlChartsCard({ year, month }: Props) {
  const { t } = useTranslation("garage");
  const { isDark } = useChartTheme();
  // State chuyển đổi chế độ xem biểu đồ: TREND (Báo cáo lợi nhuận) hoặc RATIO (Tỷ trọng 100% doanh thu)
  const [chartMode, setChartMode] = useState<"TREND" | "RATIO">("TREND");

  const { data, isLoading } = useGaragePnlTrend(year, month);
  const points = data ?? [];
  const hasData = points.some((p) => p.revenue > 0 || p.cogs > 0);

  // 1. Dữ liệu biểu đồ Xu hướng Lợi nhuận (Combo Bar + Line)
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

  // 2. Dữ liệu biểu đồ Tỷ trọng trên 100% doanh thu (Stacked Bar)
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

  // Helper render body biểu đồ hoặc skeleton / empty state
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
    <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
      {/* Header Toolbar: Tiêu đề có icon bên trái & Cụm Switch chuyển đổi (Giống Phân Tích Xu Hướng & Cơ Cấu Chuyển Đổi) */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            {chartMode === "TREND" ? (
              <>
                <BarChart3
                  className="w-3.5 h-3.5 text-primary"
                  data-testid="icon-trend"
                />
                {t("pnl.charts.trendTitle", "Báo cáo lợi nhuận")}
              </>
            ) : (
              <>
                <Percent
                  className="w-3.5 h-3.5 text-primary"
                  data-testid="icon-ratio"
                />
                {t(
                  "pnl.charts.ratioTitle",
                  "Tỷ trọng các chỉ số trên 100% doanh thu",
                )}
              </>
            )}
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            • 12 tháng gần nhất (kỳ {month}/{year})
          </span>
        </div>

        {/* View Mode Switch Control */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span
            className={cn(
              "text-xs cursor-pointer select-none transition-colors",
              chartMode === "TREND"
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setChartMode("TREND")}
            data-testid="switch-to-trend"
          >
            {t("pnl.charts.trendTitle", "Báo cáo lợi nhuận")}
          </span>
          <Switch
            checked={chartMode === "RATIO"}
            onCheckedChange={(checked) =>
              setChartMode(checked ? "RATIO" : "TREND")
            }
            aria-label="Chuyển đổi Báo cáo lợi nhuận hoặc Tỷ trọng các chỉ số trên 100% doanh thu"
            data-testid="pnl-chart-mode-switch"
          />
          <span
            className={cn(
              "text-xs cursor-pointer select-none transition-colors",
              chartMode === "RATIO"
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setChartMode("RATIO")}
            data-testid="switch-to-ratio"
          >
            {t(
              "pnl.charts.ratioTitle",
              "Tỷ trọng các chỉ số trên 100% doanh thu",
            )}
          </span>
        </div>
      </div>

      {/* Vùng hiển thị biểu đồ theo chế độ đã chọn */}
      {chartMode === "TREND" ? (
        <section
          className="flex flex-col gap-3"
          data-testid="section-trend-chart"
        >
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
      ) : (
        <section
          className="flex flex-col gap-3"
          data-testid="section-ratio-chart"
        >
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
      )}
    </div>
  );
}
