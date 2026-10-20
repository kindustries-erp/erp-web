import React from "react";
import { Receipt, DownloadCloud } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import type { ErpInvoiceItemRow } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { ErpInvoiceItemsSectionProps } from "./ErpInvoiceItemsSection.type";
import { useErpInvoiceItemsSectionLogic } from "./ErpInvoiceItemsSection.hook";

export const ErpInvoiceItemsSection = React.memo(
  function ErpInvoiceItemsSection(props: ErpInvoiceItemsSectionProps) {
    const {
      direction,
      isDrawer = false,
      tabs,
      activeTab,
      onTabChange,
      onOpenSync,
    } = props;
    const logic = useErpInvoiceItemsSectionLogic(props);
    const {
      t,
      tableId,
      listHook,
      columns,
      summaryRow,
      rowActions,
      createActions,
    } = logic;

    const customActionsNode = (
      <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
        {/* PillTabs subcategory filter */}
        <PillTabs
          className="w-full sm:w-auto shrink-0"
          size="sm"
          items={[
            { value: "ALL", label: t("tabs.allLines", "Tất cả dòng") },
            { value: "NORMAL", label: t("tabs.normalLines", "Hàng hóa") },
            { value: "DISCOUNT", label: t("tabs.discountLines", "Chiết khấu") },
          ]}
          value={listHook.subcategoryFilter}
          onValueChange={(val: string) => listHook.setSubcategoryFilter(val)}
        />
      </div>
    );

    return (
      <SpreadsheetPageTemplate<ErpInvoiceItemRow>
        hideHeader={isDrawer}
        title={
          direction === "IN"
            ? t("inboundLines", "Bảng kê HHDV mua vào")
            : t("outboundLines", "Bảng kê HHDV bán ra")
        }
        desc={
          direction === "IN"
            ? t(
                "inboundLinesDesc",
                "Theo dõi và đối soát từng dòng diễn giải, mặt hàng, số lượng và thuế suất của hóa đơn đầu vào",
              )
            : t(
                "outboundLinesDesc",
                "Theo dõi và đối soát từng dòng diễn giải, mặt hàng, số lượng và thuế suất của hóa đơn đầu ra",
              )
        }
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
        summaryRow={summaryRow}
      />
    );
  },
);
