import React from "react";
import { Wallet, Truck, Table as TableIcon } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { DataTable } from "@/shared/components/DataTable";
import { GarageMonthDetailDrawer } from "../GarageMonthDetailDrawer";
import type { GaragePaymentProgressCardProps } from "./types";
import { useGaragePaymentProgressLogic } from "./useGaragePaymentProgressLogic";
import { PaymentProgressBar } from "./components/PaymentProgressBar";

export function GaragePaymentProgressCard(
  props: GaragePaymentProgressCardProps,
) {
  const {
    t,
    activeTab,
    setActiveTab,
    isReceipt,
    selectedMonth,
    monthDrawerOpen,
    closeMonthDetail,
    currentRate,
    currentTotal,
    currentPaid,
    tableId,
    listHook,
    processedItems,
    columns,
    summaryRow,
    getRowActions,
    loading,
  } = useGaragePaymentProgressLogic(props);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              {isReceipt ? (
                <Wallet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Truck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              )}
              {t("progress.cardTitle", "Tiến độ Dòng tiền & Công nợ Dịch vụ")}
            </h4>
          </div>

          {/* Tab Switcher matching Overview Page */}
          <PillTabs<"RECEIPT" | "PAYMENT">
            value={activeTab}
            onValueChange={setActiveTab}
            size="sm"
            items={[
              {
                value: "RECEIPT",
                label: t("progress.tabs.receivable", "Phải Thu"),
                icon: Wallet,
              },
              {
                value: "PAYMENT",
                label: t("progress.tabs.payable", "Phải Trả"),
                icon: Truck,
              },
            ]}
            className="w-auto"
          />
        </div>

        <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
          {/* Progress Bar & Rate Header */}
          <PaymentProgressBar
            isReceipt={isReceipt}
            currentRate={currentRate}
            currentPaid={currentPaid}
            currentTotal={currentTotal}
            loading={loading}
          />

          {/* Section: Standardized DataTable Breakdown by Month */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-primary" />
                  {t(
                    "progress.tableSectionTitle",
                    isReceipt
                      ? "Chi tiết Phải thu & Đã thu theo từng tháng"
                      : "Chi tiết Phải trả & Đã trả theo từng tháng",
                  )}
                </span>
                {listHook.activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={listHook.resetFilters}
                    className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full"
                  >
                    <span>
                      {t("progress.clearFilter", "Xóa bộ lọc")} (
                      {listHook.activeFilterCount})
                    </span>
                  </button>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "progress.tableSectionDesc",
                  "So sánh chi tiết từng tháng (Phải thu = Doanh thu + VAT, Đã thu thực tế và Dư nợ)",
                )}
              </span>
            </div>

            <DataTable
              items={processedItems}
              getRowKey={(item) => item.label}
              variant="spreadsheet"
              emptyLabel={t(
                "progress.empty",
                "Chưa có dữ liệu giao dịch trong kỳ",
              )}
              loading={loading}
              columns={columns}
              summaryRow={summaryRow}
              enableColumnResizing={true}
              tableId={tableId}
              rowHoverActions={getRowActions}
            />
          </div>

          {/* Footnote Note */}
          <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 italic bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
            <span>*</span>
            <span>
              {isReceipt
                ? t(
                    "progress.receiptFootnote",
                    "Tổng tiền dịch vụ hiển thị theo đúng số tiền thực tế khách hàng phải thanh toán (Doanh thu thuần + Thuế GTGT VAT). Dữ liệu được tính từ mốc đối soát dòng tiền tháng 07/2026 trở đi.",
                  )
                : t(
                    "progress.paymentFootnote",
                    "Tổng chi phí hiển thị theo giá vốn phụ tùng & chi phí gia công thực tế phát sinh. Dữ liệu được tính từ mốc đối soát dòng tiền tháng 07/2026 trở đi.",
                  )}
            </span>
          </div>
        </div>
      </div>

      {/* Month detail drawer */}
      <GarageMonthDetailDrawer
        open={monthDrawerOpen}
        item={selectedMonth}
        activeTab={activeTab}
        onClose={closeMonthDetail}
      />
    </>
  );
}
