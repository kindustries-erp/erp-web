import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components";
import { V2ComboChart } from "@/v2/shared/components/organisms/v2-chart";
import type { LoanCashflowChartProps } from "./LoanCashflowChart.type";
import { useLoanCashflowChart } from "./LoanCashflowChart.hook";
import { LoanCashflowContextMenu } from "../../molecules/loan-cashflow-context-menu";

function formatCompact(val: number): string {
  if (Math.abs(val) >= 1_000_000_000)
    return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} tr`;
  return val.toLocaleString("vi-VN");
}

export const LoanCashflowChart: React.FC<LoanCashflowChartProps> = ({
  schedule,
  title,
  subtitle,
  className = "",
  height = 320,
  onRecordPayment,
}) => {
  const { t } = useV2Translation();
  const {
    viewResolution,
    setUserResolution,
    hasPaid,
    labels,
    series,
    minColWidth,
    contextMenu,
    handleBarContextMenu,
    handleCloseMenu,
  } = useLoanCashflowChart({ schedule, onRecordPayment });

  if (!schedule || schedule.length === 0) return null;

  return (
    <div
      className={`relative rounded-2xl border border-border bg-card p-5 shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <V2Text as="h3" variant="h3" className="font-semibold text-base">
            {title ||
              t(
                "v2.loans.cashflow.chartTitle",
                "Biểu Đồ Áp Lực Dòng Tiền Trả Nợ Hàng Tháng",
              )}
          </V2Text>
          <V2Text variant="caption" className="text-muted-foreground block">
            {subtitle ||
              (hasPaid
                ? t(
                    "v2.loans.cashflow.chartSubtitlePaid",
                    "Số tiền thực tế đã trả và lịch tính toán lại trên dư nợ còn lại",
                  )
                : t(
                    "v2.loans.cashflow.chartSubtitle",
                    "So sánh gốc, lãi hàng tháng và lộ trình giảm dần dư nợ toàn doanh nghiệp",
                  ))}
          </V2Text>
        </div>

        {schedule.length > 24 && (
          <div className="flex items-center gap-2">
            {viewResolution === "month" && (
              <V2Text
                variant="caption"
                color="muted"
                className="hidden sm:inline text-xs"
              >
                {t(
                  "v2.loans.cashflow.scrollHint",
                  `Kéo ngang hoặc lăn chuột để xem toàn bộ ${schedule.length} kỳ`,
                )}
              </V2Text>
            )}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <V2Button
                type="button"
                size="xs"
                variant={viewResolution === "year" ? "secondary" : "ghost"}
                onClick={() => setUserResolution("year")}
                className="h-7 px-2.5 text-xs font-medium"
              >
                {t("v2.loans.cashflow.viewYearly", "Theo Năm")}
              </V2Button>
              <V2Button
                type="button"
                size="xs"
                variant={viewResolution === "month" ? "secondary" : "ghost"}
                onClick={() => setUserResolution("month")}
                className="h-7 px-2.5 text-xs font-medium"
              >
                {t("v2.loans.cashflow.viewMonthly", "Theo Tháng")}
              </V2Button>
            </div>
          </div>
        )}
      </div>

      <V2ComboChart
        labels={labels}
        series={series}
        stacked={true}
        formatValue={formatCompact}
        secondaryFormatValue={formatCompact}
        height={height}
        minColumnWidth={minColWidth}
        onBarContextMenu={handleBarContextMenu}
        ariaLabel={t(
          "v2.loans.cashflow.chartAriaLabel",
          "Biểu đồ áp lực dòng tiền trả nợ hàng tháng",
        )}
      />

      {onRecordPayment && (
        <LoanCashflowContextMenu
          open={Boolean(contextMenu)}
          period={contextMenu?.period || null}
          position={contextMenu?.position || null}
          onClose={handleCloseMenu}
          onRecordPayment={onRecordPayment}
        />
      )}
    </div>
  );
};
LoanCashflowChart.displayName = "LoanCashflowChart";
