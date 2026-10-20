import React, { useMemo } from "react";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { CashflowLegendItem } from "../../molecules/cashflow-legend-item";
import type { GarageCashflowBreakdownPanelsProps } from "./GarageCashflowBreakdownPanels.type";

const BAR_IN_COLOR = "#059669"; // Emerald 600
const BAR_OUT_COLOR = "#ea580c"; // Orange 600

export const GarageCashflowBreakdownPanels: React.FC<
  GarageCashflowBreakdownPanelsProps
> = ({ methodBreakdown, contentBreakdown, loading = false }) => {
  const t = useT();

  const methodChartData = useMemo(() => {
    const inItems = methodBreakdown?.in || [];
    const outItems = methodBreakdown?.out || [];
    const names = Array.from(
      new Set([...inItems.map((i) => i.name), ...outItems.map((i) => i.name)]),
    );
    const inData = names.map(
      (n) => inItems.find((i) => i.name === n)?.amount || 0,
    );
    const outData = names.map(
      (n) => outItems.find((i) => i.name === n)?.amount || 0,
    );
    return { names, inData, outData };
  }, [methodBreakdown]);

  const contentChartData = useMemo(() => {
    const inItems = contentBreakdown?.in || [];
    const outItems = contentBreakdown?.out || [];
    const names = Array.from(
      new Set([...inItems.map((i) => i.name), ...outItems.map((i) => i.name)]),
    );
    const inData = names.map(
      (n) => inItems.find((i) => i.name === n)?.amount || 0,
    );
    const outData = names.map(
      (n) => outItems.find((i) => i.name === n)?.amount || 0,
    );
    return { names, inData, outData };
  }, [contentBreakdown]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <Panel
        title={t(
          "garage.cashflow.breakdown.methodTitle",
          "Phân bổ theo Phương thức thanh toán",
        )}
      >
        <div className="relative h-[220px]">
          {loading ? (
            <ChartSkeleton type="bar" />
          ) : methodChartData.names.length > 0 ? (
            <BarChart
              labels={methodChartData.names}
              yCallback={(v) => money(Number(v))}
              datasets={[
                {
                  data: methodChartData.inData,
                  color: BAR_IN_COLOR,
                  label: t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)"),
                },
                {
                  data: methodChartData.outData,
                  color: BAR_OUT_COLOR,
                  label: t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)"),
                },
              ]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              {t("common.noData", "Chưa có dữ liệu")}
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-2.5">
          <CashflowLegendItem
            color={BAR_IN_COLOR}
            label={t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)")}
          />
          <CashflowLegendItem
            color={BAR_OUT_COLOR}
            label={t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)")}
          />
        </div>
      </Panel>

      <Panel
        title={t(
          "garage.cashflow.breakdown.contentTitle",
          "Phân bổ theo Nội dung thanh toán",
        )}
      >
        <div className="relative h-[220px]">
          {loading ? (
            <ChartSkeleton type="bar" />
          ) : contentChartData.names.length > 0 ? (
            <BarChart
              labels={contentChartData.names}
              yCallback={(v) => money(Number(v))}
              datasets={[
                {
                  data: contentChartData.inData,
                  color: BAR_IN_COLOR,
                  label: t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)"),
                },
                {
                  data: contentChartData.outData,
                  color: BAR_OUT_COLOR,
                  label: t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)"),
                },
              ]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              {t("common.noData", "Chưa có dữ liệu")}
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-2.5">
          <CashflowLegendItem
            color={BAR_IN_COLOR}
            label={t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)")}
          />
          <CashflowLegendItem
            color={BAR_OUT_COLOR}
            label={t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)")}
          />
        </div>
      </Panel>
    </div>
  );
};
