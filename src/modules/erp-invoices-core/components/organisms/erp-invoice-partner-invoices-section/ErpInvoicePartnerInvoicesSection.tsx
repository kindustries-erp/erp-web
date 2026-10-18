import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FileText, RotateCcw, Eye } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { Button } from "@/shared/components/ui/Button";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";
import { useErpInvoicePartnerInvoices } from "./ErpInvoicePartnerInvoicesSection.hook";
import type { ErpInvoicePartnerInvoicesSectionProps } from "./ErpInvoicePartnerInvoicesSection.type";

export const ErpInvoicePartnerInvoicesSection = React.memo(
  function ErpInvoicePartnerInvoicesSection(
    props: ErpInvoicePartnerInvoicesSectionProps,
  ) {
    const { t } = useTranslation(["erpInvoices", "common"]);
    const {
      paginatedInvoices,
      filteredInvoices,
      isLoading,
      total,
      totalPages,
      page,
      pageSize,
      setPage,
      setPageSize,
      columns,
      summaryRow,
      tableState,
      handleClearFilters,
    } = useErpInvoicePartnerInvoices(props);

    const rowActions = useCallback(
      (inv: PartnerInvoiceDetailItem): ActionDropdownItem[] => [
        {
          label: t("actionDetail", "Xem chi tiết"),
          icon: <Eye className="w-3.5 h-3.5" />,
          onClick: () => props.onPreviewInvoice?.(inv),
        },
      ],
      [t, props.onPreviewInvoice],
    );

    return (
      <DrawerSection
        title={
          <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>
              {t("tabInvoicesListTitle", "Chi tiết hóa đơn theo đối tượng")}
            </span>
            {total > 0 && (
              <span className="text-xs font-normal text-muted-foreground lowercase font-mono">
                ({filteredInvoices.length} / {total}{" "}
                {t("recordsInvoices", "hóa đơn")})
              </span>
            )}
          </div>
        }
        titleExtra={
          tableState.activeFilterCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-md border border-destructive/20 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>
                {t("clearFilters", "Đặt lại")} ({tableState.activeFilterCount})
              </span>
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
            items={paginatedInvoices}
            columns={columns}
            getRowKey={(r) => r.id}
            loading={isLoading}
            variant="spreadsheet"
            minWidth={1500}
            tableId="erp-invoice-partner-invoices-drawer-table"
            enableColumnResizing={true}
            enableRowHoverActions={true}
            hideLegacyActionColumn={true}
            actions={rowActions}
            summaryRow={summaryRow}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={setPageSize}
            containerClassName="flex-1 min-h-0"
          />
        </div>
      </DrawerSection>
    );
  },
);
