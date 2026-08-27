import React from "react";
import { Receipt, FileSpreadsheet } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Button } from "@/shared/components/ui/Button";
import { PillTabs } from "@/shared/components/PillTabs";
import type { ErpInvoiceItemRow } from "../../api/erpInvoicesCoreApi";
import type { ErpInvoiceItemsSectionProps } from "./types";
import { useErpInvoiceItemsSectionLogic } from "./useErpInvoiceItemsSectionLogic";

export function ErpInvoiceItemsSection(props: ErpInvoiceItemsSectionProps) {
  const { direction, isDrawer = false, tabs, activeTab, onTabChange } = props;
  const logic = useErpInvoiceItemsSectionLogic(props);
  const {
    t,
    tableId,
    listHook,
    columns,
    rowActions,
    isExporting,
    handleExportExcel,
  } = logic;

  const customActionsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      {/* PillTabs subcategory filter */}
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-3 text-xs rounded-full"
        items={[
          { value: "ALL", label: t("tabs.allLines", "Tất cả dòng") },
          { value: "NORMAL", label: t("tabs.normalLines", "Hàng hóa") },
          { value: "DISCOUNT", label: t("tabs.discountLines", "Chiết khấu") },
        ]}
        value={listHook.subcategoryFilter}
        onValueChange={(val: string) => listHook.setSubcategoryFilter(val)}
        hideBorder
      />

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs gap-1.5 shrink-0"
        onClick={handleExportExcel}
        disabled={isExporting}
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{isExporting ? "Đang xuất..." : "Xuất Excel"}</span>
      </Button>
    </div>
  );

  return (
    <SpreadsheetPageTemplate<ErpInvoiceItemRow>
      hideHeader={isDrawer}
      title={
        direction === "IN"
          ? t("inbound", "Hóa đơn mua vào")
          : t("outbound", "Hóa đơn bán ra")
      }
      desc={t("invoiceDesc", "Quản lý danh sách hóa đơn điện tử")}
      icon={<Receipt className="h-5 w-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId={tableId}
      items={listHook.data}
      columns={columns}
      getRowKey={(row) => row.id}
      loading={listHook.isLoading}
      emptyLabel={t("emptyData", "Chưa có dữ liệu dòng hàng")}
      page={listHook.page}
      pageSize={listHook.pageSize}
      total={listHook.total}
      totalPages={listHook.totalPages}
      onPage={(p) => listHook.setPage(p)}
      onPageSize={(s) => {
        listHook.setPageSize(s);
        listHook.setPage(1);
      }}
      onRefresh={() => listHook.refetch()}
      activeFilterCount={listHook.activeFilterCount}
      onClearAllFilters={listHook.clearAllFilters}
      rowActions={rowActions}
      customActionsNode={customActionsNode}
      summaryRow={{
        quantity: (
          <div className="text-right font-bold tabular-nums text-xs">
            {listHook.summary.totalQuantity.toLocaleString("vi-VN")}
          </div>
        ),
        preVatAmount: (
          <div className="text-right font-bold tabular-nums text-xs">
            {listHook.summary.totalPreVatAmount.toLocaleString("vi-VN")} đ
          </div>
        ),
        vatAmount: (
          <div className="text-right font-bold tabular-nums text-xs">
            {listHook.summary.totalVatAmount.toLocaleString("vi-VN")} đ
          </div>
        ),
        discountAmount: (
          <div className="text-right font-bold tabular-nums text-xs">
            {listHook.summary.totalDiscountAmount.toLocaleString("vi-VN")} đ
          </div>
        ),
        totalAmount: (
          <div className="text-right font-bold text-primary tabular-nums text-xs">
            {listHook.summary.totalAmount.toLocaleString("vi-VN")} đ
          </div>
        ),
      }}
    />
  );
}
