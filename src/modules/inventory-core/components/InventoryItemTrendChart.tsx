import { useMemo } from "react";
import { fmtQty } from "@/shared/utils/format";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import type { InventoryTrendPoint } from "../utils/inventoryLedgerTransform";
import { V2ComboChart, type V2ComboSeries } from "@/v2/shared/components";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";

interface InventoryItemTrendChartProps {
  trendData: InventoryTrendPoint[];
  title?: string;
  chartHeight?: number;
  uomName?: string;
}

export function InventoryItemTrendChart({
  trendData,
  title,
  chartHeight = 220,
  uomName,
}: InventoryItemTrendChartProps) {
  const t = useT();
  const theme = useV2ChartTheme();
  const displayTitle =
    title || t("inventory.chart.trendTitle", "Biểu đồ biến động");

  const colorIn = "#ea580c"; // Orange 600 (Nhập kho)
  const colorOut = "#059669"; // Emerald 600 (Xuất kho)
  const lineBalance = theme.mode === "dark" ? "#2dd4bf" : "#0d9488"; // Teal 400 / 600

  const labels = useMemo(() => trendData.map((t) => t.label), [trendData]);
  const inData = useMemo(() => trendData.map((t) => t.inQty), [trendData]);
  const outData = useMemo(() => trendData.map((t) => t.outQty), [trendData]);
  const balanceData = useMemo(
    () => trendData.map((t) => t.balanceQty),
    [trendData],
  );

  const series = useMemo<V2ComboSeries[]>(
    () => [
      {
        key: "in",
        type: "bar",
        data: inData,
        color: colorIn,
        label: t("inventory.chart.inQtyLegend", "Số lượng nhập"),
      },
      {
        key: "out",
        type: "bar",
        data: outData,
        color: colorOut,
        label: t("inventory.chart.outQtyLegend", "Số lượng xuất"),
      },
      {
        key: "balance",
        type: "line",
        data: balanceData,
        color: lineBalance,
        borderColor: lineBalance,
        borderWidth: 2.5,
        tension: 0.3,
        label: t("inventory.chart.balanceLegend", "Tồn kho"),
      },
    ],
    [inData, outData, balanceData, colorIn, colorOut, lineBalance, t],
  );

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
      <V2ComboChart
        labels={labels}
        series={series}
        height={chartHeight}
        formatValue={(v) => fmtQty(Number(v))}
        ariaLabel={displayTitle}
      />
    </DrawerSection>
  );
}
