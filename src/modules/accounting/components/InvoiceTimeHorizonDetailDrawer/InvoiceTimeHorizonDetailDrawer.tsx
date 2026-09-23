import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { useInvoiceTimeHorizonDetailDrawerLogic } from "./useInvoiceTimeHorizonDetailDrawerLogic";
import { TimeHorizonHeaderBanner } from "./components/TimeHorizonHeaderBanner";
import { TimeHorizonInvoicesTab } from "./components/TimeHorizonInvoicesTab";
import { TimeHorizonAnalyticsTab } from "./components/TimeHorizonAnalyticsTab";
import { TimeHorizonRightPanel } from "./components/TimeHorizonRightPanel";
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
    dailyForecastBarData,
    cumulativeForecastData,
    forecastCompositionItems,
    forecastScheduleRows,
    scheduleTableState,
    filteredSortedScheduleRows,
    scheduleColumns,
    scheduleSummaryRow,
    ifrs9ComparisonData,
    topPartnersBarData,
    branchBarData,
    ticketSizeDonutItems,
    agingDonutItems,
    monthlyBreakdownStats,
    monthlyTableState,
    filteredSortedMonthlyRows,
    monthlyColumns,
    monthlySummaryRow,
  } = logic;

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("debts:horizonDrawer.title", {
          name: horizonMeta.title,
          defaultValue: `Chi tiết Mốc thời gian: ${horizonMeta.title}`,
        })}`}
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
              receivableCount={summary?.receivableCount}
              payableCount={summary?.payableCount}
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

            {/* Sub-Tab 2: Biến động & Phân tích chuyên sâu */}
            {activeSubTab === "analytics" && (
              <TimeHorizonAnalyticsTab
                isForecastHorizon={isForecastHorizon}
                isIfrs9Horizon={isIfrs9Horizon}
                forecastProps={{
                  isLoading,
                  dailyForecastBarData,
                  cumulativeForecastData,
                  forecastCompositionItems,
                  scheduleRows: filteredSortedScheduleRows,
                  totalScheduleRowsCount: forecastScheduleRows.length,
                  scheduleColumns,
                  scheduleSummaryRow,
                  scheduleActiveFilterCount:
                    scheduleTableState.activeFilterCount,
                  onResetScheduleFilters: () =>
                    scheduleTableState.resetFilters(),
                  t,
                }}
                ifrs9Props={{
                  isLoading,
                  ifrs9ComparisonData,
                  ticketSizeDonutItems,
                  topPartnersBarData,
                  branchBarData,
                  monthlyRows: filteredSortedMonthlyRows,
                  totalMonthlyRowsCount: monthlyBreakdownStats.length,
                  monthlyColumns,
                  monthlySummaryRow,
                  monthlyActiveFilterCount: monthlyTableState.activeFilterCount,
                  onResetMonthlyFilters: () => monthlyTableState.resetFilters(),
                  t,
                }}
                agingProps={{
                  isLoading,
                  topPartnersBarData,
                  ticketSizeDonutItems,
                  branchBarData,
                  agingDonutItems,
                  monthlyRows: filteredSortedMonthlyRows,
                  totalMonthlyRowsCount: monthlyBreakdownStats.length,
                  monthlyColumns,
                  monthlySummaryRow,
                  monthlyActiveFilterCount: monthlyTableState.activeFilterCount,
                  onResetMonthlyFilters: () => monthlyTableState.resetFilters(),
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
      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        form={formHook.form}
        fieldSet={(key: string, value: any) =>
          formHook.setForm((prev) => ({ ...prev, [key]: value }))
        }
        direction={formHook.form.direction || "IN"}
        postingState={formHook.postingState}
        pendingUnpost={formHook.pendingUnpost}
        onUnpost={() => formHook.setPendingUnpost(true)}
        rightPanel={
          <div className="flex flex-col gap-4">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.form.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <ErpInvoiceInternalMain
            detailInvoice={formHook.detailInvoice}
            invoicePreview={
              formHook.detailInvoice ? (
                <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
              ) : undefined
            }
          />
        </div>
      </ErpInvoiceInternalDrawer>
    </>
  );
}
