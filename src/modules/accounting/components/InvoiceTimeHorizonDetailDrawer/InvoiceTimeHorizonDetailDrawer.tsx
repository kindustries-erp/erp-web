import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { useInvoiceTimeHorizonDetailDrawerLogic } from "./useInvoiceTimeHorizonDetailDrawerLogic";
import { TimeHorizonHeaderBanner } from "./components/TimeHorizonHeaderBanner";
import { TimeHorizonInvoicesTab } from "./components/TimeHorizonInvoicesTab";
import { TimeHorizonTopPartnersTab } from "./components/TimeHorizonTopPartnersTab";
import { TimeHorizonAnalyticsTab } from "./components/TimeHorizonAnalyticsTab";
import { TimeHorizonRightPanel } from "./components/TimeHorizonRightPanel";
import { TimeHorizonInvoiceInternalModal } from "./components/TimeHorizonInvoiceInternalModal";
import type { InvoiceTimeHorizonDetailDrawerProps } from "./types";

export function InvoiceTimeHorizonDetailDrawer(
  props: InvoiceTimeHorizonDetailDrawerProps,
) {
  const { open, horizon, onClose, onOpenPartnerDetail } = props;
  const logic = useInvoiceTimeHorizonDetailDrawerLogic(props);
  const {
    t,
    activeSubTab,
    setActiveSubTab,
    direction,
    setDirection,
    tableState,
    page,
    setPage,
    pageSize,
    setPageSize,
    summary,
    items,
    total,
    totalPages,
    isLoading,
    horizonMeta,
    isForecastHorizon,
    isIfrs9Horizon,
    formHook,
    invoiceColumns,
    invoicesSummaryRow,
    topPartners,
  } = logic;

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("debts:horizonDrawer.title", { name: horizonMeta.title, defaultValue: `Chi tiết Mốc thời gian: ${horizonMeta.title}` })}`}
        subtitle={t(
          "debts:horizonDrawer.subtitle",
          "Theo dõi chi tiết hóa đơn phát sinh, tiến độ cấn trừ và cơ cấu nợ theo mốc thời gian",
        )}
        titleExtra={
          <Badge variant={horizonMeta.badgeVariant}>{horizonMeta.badge}</Badge>
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        leftPanel={
          <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
            {/* Header Navigation Banner: PillTabs + DirectionTabs + Reset Filters */}
            <TimeHorizonHeaderBanner
              activeSubTab={activeSubTab}
              onSubTabChange={setActiveSubTab}
              direction={direction}
              onDirectionChange={(dir) => {
                setDirection(dir);
                setPage(1);
              }}
              totalInvoices={total}
              topPartnersCount={topPartners.length}
              activeFilterCount={tableState.activeFilterCount}
              onResetFilters={() => tableState.resetFilters()}
              t={t}
            />

            {/* Sub-Tab 1: Danh sách hóa đơn chi tiết */}
            {activeSubTab === "invoices" && (
              <TimeHorizonInvoicesTab
                items={items}
                columns={invoiceColumns}
                summaryRow={invoicesSummaryRow}
                isLoading={isLoading}
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                activeFilterCount={tableState.activeFilterCount}
                onResetFilters={() => {
                  tableState.resetFilters();
                  setPage(1);
                }}
                t={t}
              />
            )}

            {/* Sub-Tab 2: Top đối tác chi phối dòng tiền */}
            {activeSubTab === "top_partners" && (
              <TimeHorizonTopPartnersTab
                partners={topPartners}
                direction={direction}
                onOpenPartnerDetail={onOpenPartnerDetail}
                isLoading={isLoading}
                t={t}
              />
            )}

            {/* Sub-Tab 3: Biến động & Phân tích chuyên sâu */}
            {activeSubTab === "analytics" && (
              <TimeHorizonAnalyticsTab
                isForecastHorizon={isForecastHorizon}
                isIfrs9Horizon={isIfrs9Horizon}
                forecastProps={{
                  isLoading,
                  dailyForecastBarData: logic.dailyForecastBarData,
                  cumulativeForecastData: logic.cumulativeForecastData,
                  forecastCompositionItems: logic.forecastCompositionItems,
                  scheduleRows: logic.filteredSortedScheduleRows,
                  totalScheduleRowsCount: logic.forecastScheduleRows.length,
                  scheduleColumns: logic.scheduleColumns,
                  scheduleSummaryRow: logic.scheduleSummaryRow,
                  scheduleActiveFilterCount:
                    logic.scheduleTableState.activeFilterCount,
                  onResetScheduleFilters: () =>
                    logic.scheduleTableState.resetFilters(),
                  t,
                }}
                ifrs9Props={{
                  isLoading,
                  ifrs9ComparisonData: logic.ifrs9ComparisonData,
                  ticketSizeDonutItems: logic.ticketSizeDonutItems,
                  topPartnersBarData: logic.topPartnersBarData,
                  branchBarData: logic.branchBarData,
                  monthlyRows: logic.filteredSortedMonthlyRows,
                  totalMonthlyRowsCount: logic.monthlyBreakdownStats.length,
                  monthlyColumns: logic.monthlyColumns,
                  monthlySummaryRow: logic.monthlySummaryRow,
                  monthlyActiveFilterCount:
                    logic.monthlyTableState.activeFilterCount,
                  onResetMonthlyFilters: () =>
                    logic.monthlyTableState.resetFilters(),
                  t,
                }}
                agingProps={{
                  isLoading,
                  topPartnersBarData: logic.topPartnersBarData,
                  ticketSizeDonutItems: logic.ticketSizeDonutItems,
                  branchBarData: logic.branchBarData,
                  agingDonutItems: logic.agingDonutItems,
                  monthlyRows: logic.filteredSortedMonthlyRows,
                  totalMonthlyRowsCount: logic.monthlyBreakdownStats.length,
                  monthlyColumns: logic.monthlyColumns,
                  monthlySummaryRow: logic.monthlySummaryRow,
                  monthlyActiveFilterCount:
                    logic.monthlyTableState.activeFilterCount,
                  onResetMonthlyFilters: () =>
                    logic.monthlyTableState.resetFilters(),
                  t,
                }}
              />
            )}
          </div>
        }
        rightPanel={
          <TimeHorizonRightPanel
            horizon={horizon}
            horizonMeta={horizonMeta}
            summary={summary}
            direction={direction}
            onOpenPartnerDetail={onOpenPartnerDetail}
            t={t}
          />
        }
      />

      {/* Internal Full Detail Invoice Modal/Drawer */}
      <TimeHorizonInvoiceInternalModal formHook={formHook} />
    </>
  );
}
