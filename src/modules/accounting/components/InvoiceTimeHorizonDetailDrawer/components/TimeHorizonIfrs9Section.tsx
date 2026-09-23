import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { RotateCcw, Building2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { money } from "@/shared/utils/format";
import type { MonthlyBreakdownRow } from "../types";

export interface TimeHorizonIfrs9SectionProps {
  isLoading: boolean;
  ifrs9ComparisonData: { labels: string[]; datasets: any[] } | null;
  ticketSizeDonutItems: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
  }>;
  topPartnersBarData: { labels: string[]; datasets: any[] } | null;
  branchBarData: { labels: string[]; datasets: any[] } | null;
  monthlyRows: MonthlyBreakdownRow[];
  totalMonthlyRowsCount: number;
  monthlyColumns: DataTableColumn<MonthlyBreakdownRow>[];
  monthlySummaryRow: Record<string, React.ReactNode>;
  monthlyActiveFilterCount: number;
  onResetMonthlyFilters: () => void;
  t: (key: string, fallback?: any) => string;
}

export function TimeHorizonIfrs9Section({
  isLoading,
  ifrs9ComparisonData,
  ticketSizeDonutItems,
  topPartnersBarData,
  branchBarData,
  monthlyRows,
  totalMonthlyRowsCount,
  monthlyColumns,
  monthlySummaryRow,
  monthlyActiveFilterCount,
  onResetMonthlyFilters,
  t,
}: TimeHorizonIfrs9SectionProps) {
  return (
    <div className="space-y-3 pt-1">
      {/* HÀNG 1: GRID 3:1 — MA TRẬN BÓC TÁCH IFRS 9 (3/4) + CƠ CẤU QUY MÔ HÓA ĐƠN PARETO (1/4) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
        {/* CỘT 1 (3/4): MA TRẬN BÓC TÁCH IFRS 9 THEO NHÓM TUỔI NỢ */}
        <div className="xl:col-span-3">
          <DrawerSection
            title={t(
              "debts:horizonDrawer.riskExposureTitle",
              "Ma trận Bóc tách Rủi ro Khó đòi & Trích lập IFRS 9",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="relative h-[250px] w-full pt-1">
              {isLoading ? (
                <ChartSkeleton />
              ) : ifrs9ComparisonData ? (
                <BarChart
                  labels={ifrs9ComparisonData.labels}
                  stacked={false}
                  showLegend={true}
                  yCallback={(v) => money(Number(v))}
                  datasets={ifrs9ComparisonData.datasets}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                  <ShieldAlert className="w-8 h-8 opacity-30" />
                  <span>
                    {t("common:noData", "Chưa có dữ liệu bóc tách IFRS 9")}
                  </span>
                </div>
              )}
            </div>
          </DrawerSection>
        </div>

        {/* CỘT 2 (1/4): PHÂN TẦNG QUY MÔ HÓA ĐƠN PARETO 80/20 */}
        <div className="xl:col-span-1">
          <DrawerSection
            title={t(
              "debts:horizonDrawer.ticketSizeTitle",
              "Cơ cấu Quy mô Hóa đơn (Pareto 80/20)",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col justify-center gap-2 h-[250px] w-full pt-1">
              {isLoading ? (
                <ChartSkeleton />
              ) : ticketSizeDonutItems.length > 0 ? (
                <>
                  <div className="relative h-[135px]">
                    <DonutChart
                      items={ticketSizeDonutItems}
                      cutout="65%"
                      valueFormatter={(v) => money(Number(v))}
                    />
                  </div>
                  <div className="text-[11px]">
                    <DonutLegend
                      items={ticketSizeDonutItems}
                      valueFormatter={(v) => money(Number(v))}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
                  <div className="text-xs text-muted-foreground">
                    {t("common:noData", "Không có dữ liệu quy mô")}
                  </div>
                </div>
              )}
            </div>
          </DrawerSection>
        </div>
      </div>

      {/* HÀNG 2: GRID 1:1 — ĐỐI TÁC CHI PHỐI & PHÂN BỔ CHI NHÁNH */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* CỘT 1: ĐỐI TÁC CHI PHỐI RỦI RO / KỲ VỌNG */}
        <DrawerSection
          title={t(
            "debts:horizonDrawer.topPartnersConcentrationTitle",
            "Đối tác Chi phối & Tập trung Nợ (Top 5)",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="relative h-[250px] w-full pt-1">
            {isLoading ? (
              <ChartSkeleton />
            ) : topPartnersBarData ? (
              <BarChart
                labels={topPartnersBarData.labels}
                datasets={topPartnersBarData.datasets}
                showLegend={false}
                yCallback={(v) => money(Number(v))}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                <Building2 className="w-8 h-8 opacity-30" />
                <span>{t("common:noData", "Chưa có dữ liệu đối tác")}</span>
              </div>
            )}
          </div>
        </DrawerSection>

        {/* CỘT 2: PHÂN BỔ CÔNG NỢ THEO CHI NHÁNH */}
        <DrawerSection
          title={t(
            "debts:horizonDrawer.branchDistributionTitle",
            "Phân bổ Công nợ theo Chi nhánh",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="relative h-[250px] w-full pt-1">
            {isLoading ? (
              <ChartSkeleton />
            ) : branchBarData ? (
              <BarChart
                labels={branchBarData.labels}
                datasets={branchBarData.datasets}
                showLegend={false}
                yCallback={(v) => money(Number(v))}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                <Building2 className="w-8 h-8 opacity-30" />
                <span>{t("common:noData", "Chưa có dữ liệu chi nhánh")}</span>
              </div>
            )}
          </div>
        </DrawerSection>
      </div>

      {/* HÀNG 3: BẢNG KÊ TỔNG HỢP PHÁT SINH & DƯ NỢ THEO THÁNG */}
      <DrawerSection
        title={
          <div className="flex items-center justify-between w-full pr-2">
            <span>
              {t(
                "debts:horizonDrawer.monthlyMatrixTitle",
                "Bảng kê tổng hợp phát sinh & dư nợ theo tháng",
              )}{" "}
              ({monthlyRows.length} / {totalMonthlyRowsCount})
            </span>
            {monthlyActiveFilterCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetMonthlyFilters();
                }}
                className="h-5 px-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded border border-destructive/20 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>
                  {t("common:clearFilters", "Xóa bộ lọc")} (
                  {monthlyActiveFilterCount})
                </span>
              </button>
            )}
          </div>
        }
        collapsible
        defaultCollapsed={false}
        bodyClassName="p-0"
      >
        <DataTable<MonthlyBreakdownRow>
          tableId="time-horizon-monthly-breakdown-table"
          items={monthlyRows}
          columns={monthlyColumns}
          variant="spreadsheet"
          enableColumnResizing={true}
          getRowKey={(r) => r.month}
          summaryRow={monthlySummaryRow}
          containerClassName="max-h-[380px] overflow-y-auto scrollbar-thin"
          emptyLabel={t(
            "debts:horizonDrawer.emptyMonthlyData",
            "Không có dữ liệu tháng nào khớp với bộ lọc",
          )}
        />
      </DrawerSection>
    </div>
  );
}
