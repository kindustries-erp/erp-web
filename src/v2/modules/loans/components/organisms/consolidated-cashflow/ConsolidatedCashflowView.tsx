import React, { useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import {
  V2ComboChart,
  type V2ComboSeries,
} from "@/v2/shared/components/organisms/v2-chart";
import { formatVndCurrency } from "@/v2/core/loans";
import { useCashflowProjectionQuery } from "../../../api";
import { ConsolidatedCashflowTable } from "./ConsolidatedCashflowTable";

function formatCompact(val: number): string {
  if (Math.abs(val) >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(0)} tr`;
  }
  return val.toLocaleString("vi-VN");
}

export const ConsolidatedCashflowView: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { t } = useV2Translation();
  const { data, isLoading } = useCashflowProjectionQuery();

  const projections = data?.monthlyProjections || [];

  const labels = useMemo(() => projections.map((p) => p.month), [projections]);

  const series: V2ComboSeries[] = useMemo(() => {
    return [
      {
        key: "principal",
        label: t("v2.loans.cashflow.chartPrincipal", "Tiền gốc"),
        type: "bar",
        data: projections.map((p) => Math.round(p.principalDue)),
      },
      {
        key: "interest",
        label: t("v2.loans.cashflow.chartInterest", "Tiền lãi"),
        type: "bar",
        data: projections.map((p) => Math.round(p.interestDue)),
      },
      {
        key: "cumulative",
        label: t("v2.loans.cashflow.chartRemaining", "Dư nợ tích lũy"),
        type: "line",
        data: projections.map((p) =>
          Math.round(p.cumulativeRemainingPrincipal),
        ),
        secondaryAxis: true,
      },
    ];
  }, [projections, t]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        {t("v2.common.loading", "Đang tải dữ liệu dòng tiền dự báo...")}
      </div>
    );
  }

  if (projections.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
        <V2Text variant="body">
          {t(
            "v2.loans.cashflow.noData",
            "Không có khoản vay nào đang hoạt động để dự báo dòng tiền.",
          )}
        </V2Text>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <V2Text
            variant="caption"
            className="text-muted-foreground font-medium block mb-1"
          >
            {t(
              "v2.loans.cashflow.totalObligation",
              "Tổng nghĩa vụ thanh toán tương lai",
            )}
          </V2Text>
          <V2Text variant="h2" className="text-xl font-bold text-foreground">
            {formatVndCurrency(data?.totalObligationDue || 0)}
          </V2Text>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <V2Text
            variant="caption"
            className="text-muted-foreground font-medium block mb-1"
          >
            {t(
              "v2.loans.cashflow.totalPrincipal",
              "Tổng nợ gốc còn lại phải trả",
            )}
          </V2Text>
          <V2Text
            variant="h2"
            className="text-xl font-bold text-emerald-600 dark:text-emerald-400"
          >
            {formatVndCurrency(data?.totalPrincipalDue || 0)}
          </V2Text>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <V2Text
            variant="caption"
            className="text-muted-foreground font-medium block mb-1"
          >
            {t(
              "v2.loans.cashflow.totalInterest",
              "Tổng tiền lãi ước tính phải trả",
            )}
          </V2Text>
          <V2Text
            variant="h2"
            className="text-xl font-bold text-amber-600 dark:text-amber-400"
          >
            {formatVndCurrency(data?.totalInterestDue || 0)}
          </V2Text>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-4">
          <V2Text variant="h3" className="font-semibold text-base">
            {t(
              "v2.loans.cashflow.chartTitle",
              "Biểu Đồ Áp Lực Dòng Tiền Trả Nợ Hàng Tháng",
            )}
          </V2Text>
          <V2Text variant="caption" className="text-muted-foreground">
            {t(
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
          height={320}
          ariaLabel="Biểu đồ dòng tiền trả nợ doanh nghiệp"
        />
      </div>

      <ConsolidatedCashflowTable projections={projections} />
    </div>
  );
};
