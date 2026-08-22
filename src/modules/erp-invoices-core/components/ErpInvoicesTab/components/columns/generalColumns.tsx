import React, { useMemo } from "react";
import { format } from "date-fns";
import { type TFunction } from "i18next";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { InvoiceDateRangeSlot } from "@/modules/erp-invoices-core/components/InvoiceDateRangeSlot";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { INVOICE_TYPE_MAP } from "../../utils";
import { InvoiceAttachmentsCell } from "../cells/InvoiceAttachmentsCell";
import { InvoiceNoCell } from "../cells/InvoiceNoCell";
import {
  InvoicePartnerCell,
  InvoiceTaxCodeCell,
} from "../cells/InvoicePartnerCell";

export interface GeneralColumnsOptions {
  direction: "IN" | "OUT";
  t: TFunction<any, any>;
  branches: Array<{ value: string; label: string }>;
  listHook: ReturnType<typeof useErpInvoicesList>;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  setPreviewPdf: (pdf: any) => void;
  onSelectPartner: (partner: { taxCode: string; partnerName: string }) => void;
  handleOpenInternal: (inv: any, mode?: "view" | "edit") => void;
  handleDownload: (id: string, type: "pdf" | "xml") => Promise<void>;
  handlePreviewPdf: (
    id: string,
    key: string,
    filename: string,
  ) => Promise<void>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  handleSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  handleSearchChange: (key: string, val: string) => void;
  handleFilterChange: (key: string, vals: string[]) => void;
  fetchInvoiceOptions: (params: any) => Promise<any>;
}

export function useGeneralColumns({
  direction,
  t,
  branches,
  listHook,
  openPopoverId,
  setOpenPopoverId,
  setPreviewPdf,
  onSelectPartner,
  handleOpenInternal,
  handleDownload,
  handlePreviewPdf,
  getSortState,
  handleSortChange,
  handleSearchChange,
  handleFilterChange,
  fetchInvoiceOptions,
}: GeneralColumnsOptions) {
  return useMemo(() => {
    return {
      attachments: {
        key: "attachments",
        header: (
          <TableColumnHeaderFilter
            title={t("attachments", "Chứng từ")}
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={
              listHook.tableState.columnFilters["attachments"] || []
            }
            onFilterChange={(vals) => handleFilterChange("attachments", vals)}
            align="center"
            columnKey="attachments"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={async ({ search }: { search: string }) => {
              const options = [
                { value: "has_pdf", label: "Có file PDF" },
                { value: "has_xml", label: "Có file XML" },
                { value: "no_pdf", label: "Không có file PDF" },
                { value: "no_xml", label: "Không có file XML" },
              ];
              const filtered = options.filter((o) =>
                o.label.toLowerCase().includes(search.toLowerCase()),
              );
              return { items: filtered, total: filtered.length, next: null };
            }}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: ErpInvoice) => (
          <InvoiceAttachmentsCell
            inv={inv}
            t={t}
            openPopoverId={openPopoverId}
            setOpenPopoverId={setOpenPopoverId}
            handleDownload={handleDownload}
            handlePreviewPdf={handlePreviewPdf}
            setPreviewPdf={setPreviewPdf}
          />
        ),
      },
      invoiceDate: {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceDate", "Ngày HĐ")}
            sortState={getSortState("invoiceDate")}
            onSortChange={(state) => handleSortChange("invoiceDate", state)}
            searchValue={listHook.tableState.columnSearch["invoiceDate"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceDate", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceDate"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceDate", vals)}
            align="center"
            columnKey="invoiceDate"
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(
              listHook.filterPanel.state.dateFrom ||
              listHook.filterPanel.state.dateTo,
            )}
            dateRangeSlot={({ close }: { close: () => void }) => (
              <InvoiceDateRangeSlot
                dateFrom={listHook.filterPanel.state.dateFrom}
                dateTo={listHook.filterPanel.state.dateTo}
                onChange={(from, to) => {
                  listHook.filterPanel.setDateFrom(from);
                  listHook.filterPanel.setDateTo(to);
                  listHook.setPage(1);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 100,
        headerClassName: "text-center",
        className: "text-right",
        cell: (inv: ErpInvoice) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd-MM-yyyy")
            : "",
      },
      invoiceNo: {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceNo", "Số / Ký hiệu HĐ")}
            sortState={getSortState("invoiceNo")}
            onSortChange={(state) => handleSortChange("invoiceNo", state)}
            searchValue={listHook.tableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceNo", vals)}
            align="center"
            columnKey="invoiceNo"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            enableSelectAllMatching={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-left",
        cell: (inv: ErpInvoice) => (
          <InvoiceNoCell inv={inv} handleOpenInternal={handleOpenInternal} />
        ),
      },
      serialNo: {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title={t("serialNo", "Ký hiệu")}
            sortState={getSortState("serialNo")}
            onSortChange={(state) => handleSortChange("serialNo", state)}
            searchValue={listHook.tableState.columnSearch["serialNo"] || ""}
            onSearchChange={(val) => handleSearchChange("serialNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["serialNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("serialNo", vals)}
            align="center"
            columnKey="serialNo"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-muted-foreground text-left",
        cell: (inv: ErpInvoice) => inv.serialNo || "—",
      },
      partner: {
        key: "partner",
        header: (
          <TableColumnHeaderFilter
            title={
              direction === "IN"
                ? t("seller", "Bên bán / MST")
                : t("buyer", "Bên mua / MST")
            }
            sortState={getSortState("partner")}
            onSortChange={(state) => handleSortChange("partner", state)}
            searchValue={listHook.tableState.columnSearch["partner"] || ""}
            onSearchChange={(val) => handleSearchChange("partner", val)}
            selectedFilters={listHook.tableState.columnFilters["partner"] || []}
            onFilterChange={(vals) => handleFilterChange("partner", vals)}
            align="center"
            columnKey="partner"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 250,
        headerClassName: "text-center",
        className: "text-left",
        cell: (inv: ErpInvoice) => (
          <InvoicePartnerCell
            inv={inv}
            direction={direction}
            onSelectPartner={onSelectPartner}
          />
        ),
      },
      taxCode: {
        key: "taxCode",
        header: (
          <TableColumnHeaderFilter
            title={t("taxCode", "MST")}
            sortState={getSortState("taxCode")}
            onSortChange={(state) => handleSortChange("taxCode", state)}
            searchValue={listHook.tableState.columnSearch["taxCode"] || ""}
            onSearchChange={(val) => handleSearchChange("taxCode", val)}
            selectedFilters={listHook.tableState.columnFilters["taxCode"] || []}
            onFilterChange={(vals) => handleFilterChange("taxCode", vals)}
            align="center"
            columnKey="taxCode"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 150,
        headerClassName: "text-center",
        className: "text-muted-foreground text-xs text-left",
        cell: (inv: ErpInvoice) => (
          <InvoiceTaxCodeCell
            inv={inv}
            direction={direction}
            onSelectPartner={onSelectPartner}
          />
        ),
      },
      branchId: {
        key: "branchId",
        header: (
          <TableColumnHeaderFilter
            title={t("branch", "Chi nhánh")}
            sortState={getSortState("branchId")}
            onSortChange={(state) => handleSortChange("branchId", state)}
            searchValue={listHook.tableState.columnSearch["branchId"] || ""}
            onSearchChange={(val) => handleSearchChange("branchId", val)}
            selectedFilters={
              listHook.tableState.columnFilters["branchId"] || []
            }
            onFilterChange={(vals) => handleFilterChange("branchId", vals)}
            align="center"
            columnKey="branchId"
            queryKeyPrefix={`erp-invoice-options-branch-${branches.length}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: any) => {
          if (!inv.branchId) return "—";
          const branch = branches.find((b) => b.value === inv.branchId);
          if (!branch) return inv.branchId;
          const parts = branch.label.split(" — ");
          return parts.length > 1 ? parts[1] : branch.label;
        },
      },
      invoiceCategory: {
        key: "invoiceCategory",
        header: (
          <TableColumnHeaderFilter
            title="Phân loại HĐ"
            sortState={getSortState("invoiceCategory")}
            onSortChange={(state) => handleSortChange("invoiceCategory", state)}
            searchValue={
              listHook.tableState.columnSearch["invoiceCategory"] || ""
            }
            onSearchChange={(val) => handleSearchChange("invoiceCategory", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceCategory"] || []
            }
            onFilterChange={(vals) =>
              handleFilterChange("invoiceCategory", vals)
            }
            align="center"
            columnKey="invoiceCategory"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 140,
        headerClassName: "text-center",
        className: "text-center",
        cell: (inv: any) => {
          if (!inv.invoiceCategory) return "—";
          return INVOICE_TYPE_MAP[inv.invoiceCategory] || inv.invoiceCategory;
        },
      },
      notes: {
        key: "notes",
        header: (
          <TableColumnHeaderFilter
            title={t("invoice.columns.notes", "Ghi chú")}
            sortState={getSortState("notes")}
            onSortChange={(state) => handleSortChange("notes", state)}
            searchValue={listHook.tableState.columnSearch["notes"] || ""}
            onSearchChange={(val) => handleSearchChange("notes", val)}
            selectedFilters={listHook.tableState.columnFilters["notes"] || []}
            onFilterChange={(vals) => handleFilterChange("notes", vals)}
            align="center"
            columnKey="notes"
            queryKeyPrefix="erp-invoice-options"
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
            showBlankOption={true}
          />
        ),
        size: 200,
        headerClassName: "text-center",
        className: "text-left whitespace-normal",
        cell: (inv: any) => {
          if (!inv.notes) return "—";
          return (
            <TableText
              text={inv.notes}
              tooltip={true}
              textClassName="line-clamp-2 break-words whitespace-normal text-slate-700"
            />
          );
        },
      },
    };
  }, [
    direction,
    t,
    branches,
    listHook.tableState.columnFilters,
    listHook.tableState.columnSearch,
    listHook.tableState.sorts,
    listHook.filterPanel.state.dateFrom,
    listHook.filterPanel.state.dateTo,
    fetchInvoiceOptions,
    openPopoverId,
    setOpenPopoverId,
    setPreviewPdf,
    onSelectPartner,
    handleOpenInternal,
    handleDownload,
    handlePreviewPdf,
    getSortState,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
  ]);
}
