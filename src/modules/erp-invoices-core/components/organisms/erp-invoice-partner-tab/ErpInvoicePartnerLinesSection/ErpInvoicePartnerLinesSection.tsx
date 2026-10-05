import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Boxes, RotateCcw } from "lucide-react";
import { StandardTable } from "@/shared/components/StandardTable";
import { Button } from "@/shared/components/ui/Button";
import { DrawerSection } from "@/shared/components/DrawerModal";
import type { ErpInvoicePartnerLinesSectionProps } from "./ErpInvoicePartnerLinesSection.type";
import { useErpInvoicePartnerLinesSection } from "./ErpInvoicePartnerLinesSection.hook";
import { buildItemColumns } from "./ErpInvoicePartnerLinesSection.columns";

export const ErpInvoicePartnerLinesSection = React.memo(
  function ErpInvoicePartnerLinesSection(
    props: ErpInvoicePartnerLinesSectionProps,
  ) {
    const { t } = useTranslation("erpInvoices");
    const {
      itemLines,
      itemLinesTotal,
      itemLinesTotalPages,
      isLoadingItems,
      itemPage,
      setItemPage,
      itemPageSize,
      setItemPageSize,
      itemHeaderFilter,
      itemSummaryRow,
      itemRowActions,
      itemActiveFilterCount,
      clearItemAllFilters,
    } = useErpInvoicePartnerLinesSection(props);

    const columns = useMemo(
      () =>
        buildItemColumns({
          itemHeaderFilter,
          t,
          onPreviewInvoice: props.onPreviewInvoice,
        }),
      [itemHeaderFilter, t, props.onPreviewInvoice],
    );

    return (
      <DrawerSection
        title={
          <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Boxes className="w-4 h-4 text-muted-foreground" />
            <span>
              {t("tabGoodsItemsTitle", "Danh sách chi tiết hàng hóa & dịch vụ")}
            </span>
            {itemLinesTotal > 0 && (
              <span className="text-xs font-normal text-muted-foreground lowercase">
                ({itemLinesTotal} {t("recordsItems", "dòng HHDV")})
              </span>
            )}
          </div>
        }
        titleExtra={
          itemActiveFilterCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearItemAllFilters}
              className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {t("clearFilters", "Đặt lại")} ({itemActiveFilterCount})
            </Button>
          ) : undefined
        }
        collapsible={true}
        defaultCollapsed={false}
        className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
        bodyClassName="p-0"
      >
        <div className="h-[calc(100vh-395px)] min-h-[260px] max-h-[calc(100vh-395px)] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
          <StandardTable
            items={itemLines}
            columns={columns}
            getRowKey={(r) => r.id}
            loading={isLoadingItems}
            variant="spreadsheet"
            minWidth={1100}
            tableId="erp-invoice-partner-items-table"
            enableColumnResizing={true}
            enableRowHoverActions={true}
            hideLegacyActionColumn={true}
            actions={itemRowActions}
            summaryRow={itemSummaryRow}
            page={itemPage}
            pageSize={itemPageSize}
            total={itemLinesTotal}
            totalPages={itemLinesTotalPages}
            onPage={setItemPage}
            onPageSize={setItemPageSize}
            containerClassName="flex-1 min-h-0"
          />
        </div>
      </DrawerSection>
    );
  },
);
