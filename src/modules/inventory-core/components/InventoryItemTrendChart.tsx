import { useMemo } from "react";
import { BarChart } from "@/shared/components/charts/BarChart";
import { fmtQty } from "@/shared/utils/format";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import type { InventoryTrendPoint } from "../utils/inventoryLedgerTransform";

interface InventoryItemTrendChartProps {
  trendData: InventoryTrendPoint[];
  title?: string;
  chartHeight?: number;
  uomName?: string;
}

function LegendItem({
  color,
  label,
  isLine = false,
}: {
  color: string;
  label: string;
  isLine?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {isLine ? (
        <span
          className="inline-block w-3.5 h-0.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : (
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
    </div>
  );
}

export function InventoryItemTrendChart({
  trendData,
  title,
  chartHeight = 200,
  uomName,
}: InventoryItemTrendChartProps) {
  const t = useT();
  const displayTitle = title || t("inventory.chart.trendTitle", "Biểu đồ biến động");

  const colorIn = "#ea580c"; // Orange 600 (Nhập kho)
  const colorOut = "#059669"; // Emerald 600 (Xuất kho)
  const lineBalance = "#1e293b"; // Slate 800 (Tồn kho)

  const labels = useMemo(() => trendData.map((t) => t.label), [trendData]);
  const inData = useMemo(() => trendData.map((t) => t.inQty), [trendData]);
  const outData = useMemo(() => trendData.map((t) => t.outQty), [trendData]);
  const balanceData = useMemo(
    () => trendData.map((t) => t.balanceQty),
    [trendData],
  );

  const hasData = trendData.length > 0;

  return (
    <DrawerSection
      title={displayTitle}
      titleExtra={
        uomName ? (
          <span className="text-xs text-muted-foreground font-medium">
            {t("inventory.chart.unit", "Đơn vị")}: {uomName}
          </span>
        ) : undefined
      }
    >
      <div className="relative" style={{ height: chartHeight }}>
        {hasData ? (
          <BarChart
            labels={labels}
            yCallback={(v) => fmtQty(Number(v))}
            datasets={[
              {
                type: "line",
                data: balanceData,
                color: "transparent",
                borderColor: lineBalance,
                borderWidth: 2,
                fill: false,
                label: t("inventory.chart.balance", "Tồn kho"),
              },
              {
                type: "bar",
                data: inData,
                color: colorIn,
                label: t("inventory.chart.inQty", "Nhập kho"),
              },
              {
                type: "bar",
                data: outData,
                color: colorOut,
                label: t("inventory.chart.outQty", "Xuất kho"),
              },
            ]}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            {t("inventory.chart.noData", "Chưa có dữ liệu biến động")}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-2.5 justify-center flex-wrap">
        <LegendItem
          color={colorIn}
          label={t("inventory.chart.inQtyLegend", "Số lượng nhập")}
        />
        <LegendItem
          color={colorOut}
          label={t("inventory.chart.outQtyLegend", "Số lượng xuất")}
        />
        <LegendItem
          color={lineBalance}
          label={t("inventory.chart.balanceLegend", "Tồn kho")}
          isLine={true}
        />
      </div>
    </DrawerSection>
  );
}
