import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FilterButton } from "@/shared/components/FilterPanel";
import { Button } from "@/shared/components/ui/Button";
import { GarageReconciliationInvoicesTable } from "@/modules/garage/components/organisms/garage-reconciliation-invoices-table";
import type { InvoiceTabContentProps } from "../types";

export function InvoiceTabContent({
  invoiceDirection,
  invoiceItems,
  selectedInvoicesMap,
  invoiceDataTotal,
  invoiceDataTotalPages,
  invoicePage,
  invoicePageSize,
  isLoadingInvoices,
  invoiceDateFrom,
  invoiceDateTo,
  invoiceTableState,
  onToggleInvoice,
  onSelectAllInvoices,
  onViewInvoiceDetail,
  onPreviewInvoicePdf,
  onSetInvoicePage,
  onSetInvoicePageSize,
  onSetInvoiceDateFrom,
  onSetInvoiceDateTo,
  editMode = false,
  viewPreset = "all",
  onSelectAllSuggestions,
  suggestionsCount = 0,
}: InvoiceTabContentProps) {
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);

  const titleText =
    invoiceDirection === "OUT"
      ? t("cases.reconciliation.outInvoicesList", "Danh sách Hóa đơn Đầu ra")
      : t("cases.reconciliation.inInvoicesList", "Danh sách Hóa đơn Đầu vào");

  const activeFiltersCount =
    invoiceTableState.activeFilterCount +
    (invoiceDateFrom || invoiceDateTo ? 1 : 0);

  return (
    <div className="space-y-3 pb-2">
      <DrawerSection
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{titleText}</span>
            {invoiceDataTotal !== undefined && (
              <span className="text-xs font-normal text-muted-foreground lowercase">
                ({invoiceDataTotal} {t("invoices", "hóa đơn")})
              </span>
            )}
          </div>
        }
        titleExtra={
          <div className="flex items-center gap-2">
            {viewPreset === "suggestions" &&
              suggestionsCount >= 2 &&
              editMode &&
              onSelectAllSuggestions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSelectAllSuggestions}
                  className="h-6 text-[11px] px-2 gap-1 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" />
                  <span>
                    {t(
                      "cases.financials.selectAllSuggestions",
                      "Chọn tất cả gợi ý ({{count}})",
                      {
                        count: suggestionsCount,
                      },
                    )}
                  </span>
                </Button>
              )}

            {activeFiltersCount > 0 && (
              <FilterButton
                activeCount={activeFiltersCount}
                onClick={() => {}}
                onClear={() => {
                  invoiceTableState.resetFilters();
                  onSetInvoiceDateFrom("");
                  onSetInvoiceDateTo("");
                  onSetInvoicePage(1);
                }}
              />
            )}
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="mb-0 p-2.5 border border-slate-200/80 dark:border-slate-800"
        bodyClassName="p-0"
      >
        <GarageReconciliationInvoicesTable
          invoiceDirection={invoiceDirection}
          items={invoiceItems}
          selectedMap={selectedInvoicesMap}
          editMode={editMode}
          tableState={invoiceTableState}
          dateFrom={invoiceDateFrom}
          dateTo={invoiceDateTo}
          onDateFromChange={onSetInvoiceDateFrom}
          onDateToChange={onSetInvoiceDateTo}
          onPageChange={onSetInvoicePage}
          onPageSizeChange={onSetInvoicePageSize}
          page={invoicePage}
          pageSize={invoicePageSize}
          total={invoiceDataTotal || 0}
          totalPages={invoiceDataTotalPages || 0}
          loading={isLoadingInvoices}
          onToggleInvoice={onToggleInvoice}
          onSelectAllInvoices={onSelectAllInvoices}
          onViewInvoiceDetail={onViewInvoiceDetail}
          onPreviewInvoicePdf={onPreviewInvoicePdf}
        />
      </DrawerSection>
    </div>
  );
}
