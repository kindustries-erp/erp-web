import React from "react";
import { Receipt, DownloadCloud } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import type { ErpInvoiceItemRow } from "../../api/erpInvoicesCoreApi";
import type { ErpInvoiceItemsSectionProps } from "./types";
import { useErpInvoiceItemsSectionLogic } from "./useErpInvoiceItemsSectionLogic";

export function ErpInvoiceItemsSection(props: ErpInvoiceItemsSectionProps) {
  const {
    direction,
    isDrawer = false,
    tabs,
    activeTab,
    onTabChange,
    onOpenSync,
  } = props;
  const logic = useErpInvoiceItemsSectionLogic(props);
  const { t, tableId, listHook, columns, rowActions, createActions } = logic;

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
      isPending={props.isPending}
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
      onClearAllFilters={listHook.clearAllFilters}
      listHook={listHook}
      rowActions={rowActions}
      customActionsNode={customActionsNode}
      onCreate={onOpenSync}
      createLabel={t("syncInvoices", "Đồng bộ")}
      createIcon={<DownloadCloud className="w-4 h-4 mr-1 text-indigo-100" />}
      createActions={createActions}
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
