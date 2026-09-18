import React, { useState, useMemo } from "react";
import { BookOpen, Eye, Copy } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { PillTabs } from "@/shared/components/PillTabs";
import { useT } from "@/core/i18n";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { useJournalEntriesList } from "@/modules/accounting/hooks/useJournalEntriesList";
import type { JournalEntrySpreadsheetRow } from "@/modules/accounting/types/journalEntry";
import { money } from "@/shared/utils/format";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { InvoiceDetailWrapper } from "@/modules/erp-invoices-core/components/InvoiceDetailWrapper";
import { Popover } from "@/core/components/ui/Popover";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export const GeneralJournalPage: React.FC = () => {
  const t = useT();
  const listHook = useJournalEntriesList();

  const [selectedBankTxnId, setSelectedBankTxnId] = useState<string | null>(
    null,
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "journal-entries-column-options",
        fetchOptions: async ({ columnKey, search, pageParam, filtersStr }) => {
          const res = await accountingApi.getJournalEntriesColumnOptions(
            columnKey,
            search,
            pageParam,
            20,
            filtersStr,
          );
          return {
            items: res.items,
            total: res.total,
            next: res.page < res.totalPages ? res.page + 1 : null,
          };
        },
      }),
    [listHook],
  );

  const columns: DataTableColumn<JournalEntrySpreadsheetRow>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: JournalEntrySpreadsheetRow, idx: number) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "_date",
        header: headerFilter.date(
          "_date",
          t("Ngày hạch toán", "Ngày hạch toán"),
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (row: JournalEntrySpreadsheetRow) => (
          <TableDateCell
            date={row._date}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "_documentDate",
        header: headerFilter.date(
          "_documentDate",
          t("Ngày chứng từ", "Ngày chứng từ"),
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (row: JournalEntrySpreadsheetRow) => (
          <TableDateCell
            date={row._documentDate}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "_entryNo",
        header: headerFilter("_entryNo", t("Số CT", "Số CT")),
        size: 140,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => (
          <TableText
            className="w-full font-medium"
            text={row._entryNo}
            enableCopy={true}
            tooltip={true}
          />
        ),
      },
      {
        key: "_account",
        header: headerFilter("_account", t("TK", "TK")),
        size: 80,
        enableResizing: true,
        className: "text-center",
        cell: (row: JournalEntrySpreadsheetRow) => (
          <span className="font-mono text-sm font-medium text-slate-800 dark:text-slate-200">
            {row._account}
          </span>
        ),
      },
      {
        key: "_opposingAccount",
        header: headerFilter(
          "_opposingAccount",
          t("TK đối ứng", "TK đối ứng"),
          { showBlankOption: true },
        ),
        size: 90,
        enableResizing: true,
        className: "text-center",
        cell: (row: JournalEntrySpreadsheetRow) => (
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
            {row._opposingAccount || "-"}
          </span>
        ),
      },
      {
        key: "debit",
        header: headerFilter.amount("debit", t("Phát sinh Nợ", "Phát sinh Nợ")),
        size: 130,
        align: "right" as const,
        enableResizing: true,
        className: "text-right",
        cell: (row: JournalEntrySpreadsheetRow) => (
          <span
            className={
              Number(row.debit) > 0
                ? "font-medium text-slate-900 dark:text-slate-100 tabular-nums"
                : "text-transparent"
            }
          >
            {Number(row.debit) > 0 ? money(row.debit) : "-"}
          </span>
        ),
      },
      {
        key: "credit",
        header: headerFilter.amount(
          "credit",
          t("Phát sinh Có", "Phát sinh Có"),
        ),
        size: 130,
        align: "right" as const,
        enableResizing: true,
        className: "text-right",
        cell: (row: JournalEntrySpreadsheetRow) => (
          <span
            className={
              Number(row.credit) > 0
                ? "font-medium text-slate-900 dark:text-slate-100 tabular-nums"
                : "text-transparent"
            }
          >
            {Number(row.credit) > 0 ? money(row.credit) : "-"}
          </span>
        ),
      },
      {
        key: "description",
        header: headerFilter("description", t("Diễn giải", "Diễn giải"), {
          showBlankOption: true,
        }),
        size: 350,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => (
          <Popover
            content={
              <div className="p-3 text-sm max-w-md break-words whitespace-normal text-slate-800 dark:text-slate-200">
                {row.description || row._description || "—"}
              </div>
            }
          >
            <div className="text-slate-600 dark:text-slate-300 w-full cursor-pointer hover:text-primary underline decoration-dashed underline-offset-4 decoration-slate-300 line-clamp-2">
              {row.description || row._description || "-"}
            </div>
          </Popover>
        ),
      },
      {
        key: "_subjectName",
        header: headerFilter("_subjectName", t("Đối tượng", "Đối tượng"), {
          showBlankOption: true,
        }),
        size: 180,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => (
          <Popover
            content={
              <div className="p-3 text-sm max-w-sm break-words whitespace-normal text-slate-800 dark:text-slate-200">
                {row._subjectName || "—"}
              </div>
            }
          >
            <span className="text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary underline decoration-dashed underline-offset-4 decoration-slate-300 truncate block">
              {row._subjectName || "-"}
            </span>
          </Popover>
        ),
      },
      {
        key: "_branch",
        header: headerFilter("_branch", t("Chi nhánh", "Chi nhánh")),
        size: 150,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => (
          <span className="text-slate-600 dark:text-slate-400 truncate block">
            {row._branch || "-"}
          </span>
        ),
      },
      {
        key: "_reference",
        header: headerFilter("_reference", t("Tham chiếu", "Tham chiếu")),
        size: 130,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => {
          if (!row._reference) return <span className="text-slate-400">-</span>;
          if (row._sourceType === "BANK" && row._sourceId) {
            return (
              <span
                className="text-primary hover:underline cursor-pointer font-medium"
                onClick={() => setSelectedBankTxnId(row._sourceId || null)}
              >
                {row._reference}
              </span>
            );
          }
          if (row._sourceType === "INVOICE" && row._sourceId) {
            return (
              <span
                className="text-primary hover:underline cursor-pointer font-medium"
                onClick={() => setSelectedInvoiceId(row._sourceId || null)}
              >
                {row._reference}
              </span>
            );
          }
          return (
            <span className="text-slate-600 dark:text-slate-400">
              {row._reference}
            </span>
          );
        },
      },
    ],
    [headerFilter, t],
  );

  const getRowActions = (
    row: JournalEntrySpreadsheetRow,
  ): ActionDropdownItem[] => [
    {
      groupLabel: t("TRA CỨU", "TRA CỨU"),
      items: [
        {
          label: t("viewSourceDoc", "Xem chứng từ gốc"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => {
            if (row._sourceType === "BANK" && row._sourceId) {
              setSelectedBankTxnId(row._sourceId);
            } else if (row._sourceType === "INVOICE" && row._sourceId) {
              setSelectedInvoiceId(row._sourceId);
            }
          },
          disabled: !(
            row._sourceId &&
            (row._sourceType === "BANK" || row._sourceType === "INVOICE")
          ),
        },
        {
          label: t("copyEntryNo", "Sao chép số chứng từ"),
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            if (row._entryNo && navigator.clipboard) {
              navigator.clipboard.writeText(row._entryNo);
            }
          },
        },
      ],
    },
  ];

  const summaryRow = useMemo(() => {
    if (!listHook.data.length) return undefined;
    const totalDebit = listHook.data.reduce(
      (sum, item) => sum + (Number(item.debit) || 0),
      0,
    );
    const totalCredit = listHook.data.reduce(
      (sum, item) => sum + (Number(item.credit) || 0),
      0,
    );
    return {
      _opposingAccount: (
        <div className="w-full text-right font-semibold text-muted-foreground pr-1 text-xs">
          {t("common.subtotal", "Tổng cộng")}:
        </div>
      ),
      debit: (
        <div className="w-full flex justify-end">
          <SubtotalSummaryCell
            variantType="amount"
            subtotalAmount={totalDebit}
            grandTotalAmount={totalDebit}
            grandTotalQty={0}
            itemCount={listHook.total}
            page={listHook.page}
            totalPages={listHook.totalPages}
            currentPageCount={listHook.data.length}
            totalCount={listHook.total}
            valueClassName="font-semibold tabular-nums text-slate-900 dark:text-slate-100"
          />
        </div>
      ),
      credit: (
        <div className="w-full flex justify-end">
          <SubtotalSummaryCell
            variantType="amount"
            subtotalAmount={totalCredit}
            grandTotalAmount={totalCredit}
            grandTotalQty={0}
            itemCount={listHook.total}
            page={listHook.page}
            totalPages={listHook.totalPages}
            currentPageCount={listHook.data.length}
            totalCount={listHook.total}
            valueClassName="font-semibold tabular-nums text-slate-900 dark:text-slate-100"
          />
        </div>
      ),
    };
  }, [listHook.data, listHook.total, listHook.page, listHook.totalPages, t]);

  const customActionsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-3.5 text-xs rounded-full"
        items={[
          { value: "ALL", label: t("tabs.all", "Tất cả") },
          { value: "CASHFLOW", label: t("tabs.cashflow", "Dòng tiền") },
          { value: "INVOICE", label: t("tabs.invoice", "Hóa đơn") },
          { value: "OTHER", label: t("tabs.other", "Khác") },
        ]}
        value={listHook.activeSourceType}
        onValueChange={listHook.setActiveSourceType}
        hideBorder
      />
    </div>
  );

  return (
    <>
      <SpreadsheetPageTemplate<JournalEntrySpreadsheetRow>
        title={t("title", "Nhật ký chung")}
        desc={t("desc", "Sổ nhật ký chung và các bút toán hạch toán kế toán")}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        tableId="general-journal-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row._id}
        loading={listHook.isLoading}
        emptyLabel={t("noData", "Không có dữ liệu")}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={listHook.setPage}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={listHook.refetch}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={getRowActions}
        summaryRow={summaryRow}
        customActionsNode={customActionsNode}
        listHook={listHook}
      />

      <BankTransactionDetailDrawer
        isOpen={!!selectedBankTxnId}
        onClose={() => setSelectedBankTxnId(null)}
        transactionId={selectedBankTxnId}
      />
      <InvoiceDetailWrapper
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </>
  );
};
