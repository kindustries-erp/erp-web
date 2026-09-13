import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ListChecks, Eye } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  TableColumnHeaderFilter,
  TableSortState,
  TableColumnAlign,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { FilterButton } from "@/shared/components/FilterPanel";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { SelectedInvoicesTable } from "./SelectedInvoicesTable";
import type { InvoiceTabContentProps } from "../types";

export function InvoiceTabContent({
  invoiceDirection,
  invoiceItems,
  selectedInvoicesList,
  selectedInvoicesCount,
  selectedInvoicesTotal,
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
}: InvoiceTabContentProps) {
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);

  const renderInvoiceHeaderFilter = (
    key: string,
    label: string,
    align: TableColumnAlign = TableColumnAlign.CENTER,
  ) => {
    const isSortedAsc = invoiceTableState.sorts[0] === key;
    const isSortedDesc = invoiceTableState.sorts[0] === `-${key}`;
    const sortState: TableSortState = isSortedAsc
      ? TableSortState.ASC
      : isSortedDesc
        ? TableSortState.DESC
        : TableSortState.NONE;

    return (
      <TableColumnHeaderFilter
        title={label}
        align={align}
        className="w-full justify-center"
        sortState={sortState}
        onSortChange={(state) => invoiceTableState.setSort(key, state)}
        searchValue={invoiceTableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          invoiceTableState.setColumnSearch(key, val);
          onSetInvoicePage(1);
        }}
        selectedFilters={invoiceTableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          invoiceTableState.setColumnFilter(key, vals);
          onSetInvoicePage(1);
        }}
        columnKey={key}
        allFilters={invoiceTableState.columnFilters}
      />
    );
  };

  const isAllInvoiceSelected =
    invoiceItems.length > 0 &&
    invoiceItems.every((inv: ErpInvoice) => !!selectedInvoicesMap[inv.id]);

  const invoiceColumns: any[] = useMemo(
    () => [
      {
        key: "selection",
        header: (
          <div
            className="flex items-center justify-center p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isAllInvoiceSelected}
              onCheckedChange={(c: any) => onSelectAllInvoices(!!c)}
            />
          </div>
        ),
        size: 45,
        cell: (inv: ErpInvoice) => {
          const isSelected = !!selectedInvoicesMap[inv.id];
          return (
            <div
              className="flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleInvoice(inv)}
              />
            </div>
          );
        },
        sortable: false,
      },
      {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title={t("cases.reconciliation.invoiceDate", "Ngày HĐ")}
            align={TableColumnAlign.CENTER}
            className="w-full justify-center"
            sortState={
              invoiceTableState.sorts[0] === "invoiceDate"
                ? TableSortState.ASC
                : invoiceTableState.sorts[0] === "-invoiceDate"
                  ? TableSortState.DESC
                  : TableSortState.NONE
            }
            onSortChange={(state) =>
              invoiceTableState.setSort("invoiceDate", state)
            }
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(invoiceDateFrom || invoiceDateTo)}
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={invoiceDateFrom}
                dateTo={invoiceDateTo}
                onChange={(from, to) => {
                  onSetInvoiceDateFrom(from);
                  onSetInvoiceDateTo(to);
                  onSetInvoicePage(1);
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 110,
        cell: (inv: ErpInvoice) => (
          <TableDateCell
            date={inv.invoiceDate}
            format="date"
            className="justify-end w-full font-mono text-xs text-slate-600 dark:text-slate-400"
          />
        ),
        className: "text-right",
        sortable: false,
      },
      {
        key: "invoiceNo",
        header: renderInvoiceHeaderFilter(
          "invoiceNo",
          t("cases.reconciliation.invoiceNo", "Số HĐ"),
          TableColumnAlign.LEFT,
        ),
        size: 130,
        cell: (inv: ErpInvoice) => (
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              className="text-xs font-mono font-bold text-primary hover:underline truncate cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onViewInvoiceDetail(inv.id);
              }}
            >
              {inv.invoiceNo || "---"}
            </button>
            {inv.pdfFileKey && (
              <Tooltip
                content={t(
                  "cases.reconciliation.viewPdfTooltip",
                  "Xem PDF hóa đơn",
                )}
              >
                <button
                  type="button"
                  className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewInvoicePdf({
                      url: `/api/v1/erp-invoices-core/${inv.id}/pdf`,
                      filename: `HD_${inv.invoiceNo || inv.id}.pdf`,
                      fileKey: inv.pdfFileKey || "",
                      invoiceId: inv.id,
                    });
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        key: "serialNo",
        header: renderInvoiceHeaderFilter(
          "serialNo",
          t("cases.reconciliation.serialNo", "Ký hiệu"),
          TableColumnAlign.LEFT,
        ),
        size: 95,
        cell: (inv: ErpInvoice) => (
          <span className="text-xs font-mono text-slate-500">
            {inv.serialNo || "—"}
          </span>
        ),
      },
      {
        key: "partnerName",
        header: renderInvoiceHeaderFilter(
          "partnerName",
          invoiceDirection === "OUT"
            ? t("cases.reconciliation.buyerName", "Bên mua")
            : t("cases.reconciliation.sellerName", "Bên bán"),
          TableColumnAlign.LEFT,
        ),
        size: 200,
        cell: (inv: ErpInvoice) => (
          <span
            className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate block"
            title={
              invoiceDirection === "OUT"
                ? inv.buyerName || inv.buyerPersonalName || ""
                : inv.sellerName || ""
            }
          >
            {invoiceDirection === "OUT"
              ? inv.buyerName || inv.buyerPersonalName || "—"
              : inv.sellerName || "—"}
          </span>
        ),
      },
      {
        key: "licensePlate",
        header: renderInvoiceHeaderFilter(
          "licensePlate",
          t("cases.reconciliation.licensePlateCol", "Biển số xe"),
          TableColumnAlign.CENTER,
        ),
        size: 110,
        cell: (inv: ErpInvoice) =>
          inv.licensePlate ? (
            <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
              {inv.licensePlate}
            </span>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          ),
      },
      {
        key: "description",
        header: renderInvoiceHeaderFilter(
          "description",
          t("cases.reconciliation.description", "Diễn giải"),
          TableColumnAlign.LEFT,
        ),
        size: 230,
        cell: (inv: ErpInvoice) => (
          <div
            className="whitespace-pre-wrap line-clamp-2 text-xs text-slate-600 dark:text-slate-300"
            title={inv.description || ""}
          >
            {inv.description || "—"}
          </div>
        ),
      },
      {
        key: "totalAmount",
        header: renderInvoiceHeaderFilter(
          "totalAmount",
          t("cases.reconciliation.totalAmount", "Tổng tiền VAT"),
          TableColumnAlign.RIGHT,
        ),
        size: 130,
        cell: (inv: ErpInvoice) => (
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {money(inv.totalAmount)}
          </span>
        ),
        className: "text-right",
      },
    ],
    [
      isAllInvoiceSelected,
      onSelectAllInvoices,
      selectedInvoicesMap,
      onToggleInvoice,
      invoiceTableState,
      t,
      invoiceDateFrom,
      invoiceDateTo,
      onSetInvoiceDateFrom,
      onSetInvoiceDateTo,
      onSetInvoicePage,
      onViewInvoiceDetail,
      onPreviewInvoicePdf,
      invoiceDirection,
    ],
  );

  return (
    <div className="space-y-3 pb-2">
      {/* SECTION 1: CÁC HÓA ĐƠN ĐÃ CHỌN */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {invoiceDirection === "OUT"
                ? t(
                    "cases.reconciliation.selectedInvoicesListTitle",
                    "Hóa đơn Bán ra đã chọn",
                  )
                : t(
                    "cases.reconciliation.selectedInvoicesInListTitle",
                    "Hóa đơn Mua vào đã chọn",
                  )}
            </span>
            {selectedInvoicesCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
              >
                {selectedInvoicesCount} {t("invoices", "hóa đơn")}
              </Badge>
            )}
            {selectedInvoicesCount > 0 && (
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 ml-auto">
                Tổng: {money(selectedInvoicesTotal)}
              </span>
            )}
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="mb-0 p-3"
        bodyClassName="p-0"
      >
        <SelectedInvoicesTable
          invoices={selectedInvoicesList}
          onRemove={onToggleInvoice}
          onViewDetail={onViewInvoiceDetail}
        />
      </DrawerSection>

      {/* SECTION 2: TOÀN BỘ DANH SÁCH HÓA ĐƠN */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              {invoiceDirection === "OUT"
                ? t(
                    "cases.reconciliation.outInvoicesList",
                    "Danh sách Hóa đơn Bán ra (Doanh thu)",
                  )
                : t(
                    "cases.reconciliation.inInvoicesList",
                    "Danh sách Hóa đơn Mua vào (Chi phí)",
                  )}
            </span>
            {invoiceDataTotal !== undefined && (
              <span className="text-xs font-normal text-muted-foreground lowercase">
                ({invoiceDataTotal} {t("invoices", "hóa đơn")})
              </span>
            )}
          </div>
        }
        titleExtra={
          <div className="flex items-center gap-2">
            {invoiceTableState.activeFilterCount +
              (invoiceDateFrom || invoiceDateTo ? 1 : 0) >
              0 && (
              <FilterButton
                activeCount={
                  invoiceTableState.activeFilterCount +
                  (invoiceDateFrom || invoiceDateTo ? 1 : 0)
                }
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
        className="mb-0 p-3"
        bodyClassName="p-0"
      >
        <div className="h-[calc(100vh-320px)] min-h-[300px] flex flex-col">
          <StandardTable
            tableId={
              invoiceDirection === "OUT"
                ? "garage-reconciliation-invoice-out-table"
                : "garage-reconciliation-invoice-in-table"
            }
            items={invoiceItems}
            columns={invoiceColumns}
            getRowKey={(inv: ErpInvoice) => inv.id}
            variant="spreadsheet"
            enableColumnResizing={true}
            loading={isLoadingInvoices}
            page={invoicePage}
            pageSize={invoicePageSize}
            total={invoiceDataTotal || 0}
            totalPages={invoiceDataTotalPages || 0}
            onPage={onSetInvoicePage}
            onPageSize={onSetInvoicePageSize}
            minWidth={980}
            containerClassName="flex-1 min-h-0"
          />
        </div>
      </DrawerSection>
    </div>
  );
}
