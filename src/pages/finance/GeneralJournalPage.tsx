import React, { useState, useMemo } from "react";
import { BookOpen, Eye, Copy, Pencil, Building2, FileText } from "lucide-react";
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
import { JournalEntryDetailDrawer } from "@/modules/accounting/components/JournalEntryDetailDrawer";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type {
  ActionDropdownItem,
  ActionItem,
} from "@/shared/components/ActionDropdown";

export const GeneralJournalPage: React.FC = () => {
  const t = useT();
  const listHook = useJournalEntriesList();

  const [selectedBankTxnId, setSelectedBankTxnId] = useState<string | null>(
    null,
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [selectedJournalEntryId, setSelectedJournalEntryId] = useState<
    string | null
  >(null);
  const [journalDrawerMode, setJournalDrawerMode] = useState<"view" | "edit">(
    "view",
  );
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);

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
        header: headerFilter("_entryNo", t("Số CT", "Số CT"), {
          showBlankOption: true,
        }),
        size: 200,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => (
          <TableText
            text={row._entryNo || "—"}
            enableCopy={Boolean(row._entryNo)}
            onDetailClick={(e) => {
              e.stopPropagation();
              setSelectedRowData(row);
              setSelectedJournalEntryId(row._entryNo || row._id);
              setJournalDrawerMode("view");
            }}
            detailTooltip={t(
              "journalEntries.drawer.viewTooltip",
              "Xem chi tiết bút toán",
            )}
            textClassName="font-medium font-mono text-slate-800 dark:text-slate-200"
          />
        ),
      },
      {
        key: "_account",
        header: headerFilter("_account", t("TK", "TK"), {
          showBlankOption: true,
        }),
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
        cell: (row: JournalEntrySpreadsheetRow) => {
          const text = row.description || row._description || "—";
          if (!text || text === "—")
            return <span className="text-slate-400">—</span>;
          return (
            <Tooltip content={text}>
              <span className="text-slate-700 dark:text-slate-300 w-full truncate block text-xs select-text">
                {text}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "_subjectName",
        header: headerFilter("_subjectName", t("Đối tượng", "Đối tượng"), {
          showBlankOption: true,
        }),
        size: 180,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => {
          const text = row._subjectName || "—";
          if (!text || text === "—")
            return <span className="text-slate-400">—</span>;
          return (
            <Tooltip content={text}>
              <span className="text-slate-700 dark:text-slate-300 truncate block text-xs select-text">
                {text}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "_branch",
        header: headerFilter("_branch", t("Chi nhánh", "Chi nhánh"), {
          showBlankOption: true,
        }),
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
        header: headerFilter("_reference", t("Tham chiếu", "Tham chiếu"), {
          showBlankOption: true,
        }),
        size: 140,
        enableResizing: true,
        cell: (row: JournalEntrySpreadsheetRow) => {
          if (!row._reference) return <span className="text-slate-400">—</span>;
          const isBank = row._sourceType === "BANK" && Boolean(row._sourceId);
          const isInvoice =
            row._sourceType === "INVOICE" && Boolean(row._sourceId);

          return (
            <TableText
              text={row._reference}
              enableCopy={true}
              textClassName="font-mono text-xs text-slate-700 dark:text-slate-300"
              onDrawerClick={
                isBank
                  ? (e) => {
                      e.stopPropagation();
                      setSelectedBankTxnId(row._sourceId || null);
                    }
                  : isInvoice
                    ? (e) => {
                        e.stopPropagation();
                        setSelectedInvoiceId(row._sourceId || null);
                      }
                    : undefined
              }
              drawerTooltip={
                isBank
                  ? t(
                      "journalEntries.drawer.viewBankTxn",
                      "Xem giao dịch ngân hàng",
                    )
                  : isInvoice
                    ? t(
                        "journalEntries.drawer.viewInvoice",
                        "Xem hóa đơn VAT liên quan",
                      )
                    : undefined
              }
            />
          );
        },
      },
    ],
    [headerFilter, t],
  );

  const getRowActions = (
    row: JournalEntrySpreadsheetRow,
  ): ActionDropdownItem[] => {
    const isBank = row._sourceType === "BANK" && Boolean(row._sourceId);
    const isInvoice = row._sourceType === "INVOICE" && Boolean(row._sourceId);
    const hasGenericSource = Boolean(row._sourceId);

    const lookupItems: ActionItem[] = [
      {
        label: t("journalEntries.drawer.viewDetails", "Chi tiết"),
        icon: <Eye className="w-3.5 h-3.5" />,
        onClick: () => {
          setSelectedRowData(row);
          setSelectedJournalEntryId(row._entryNo || row._id);
          setJournalDrawerMode("view");
        },
      },
    ];

    if (isBank || isInvoice || hasGenericSource) {
      lookupItems.push({
        label: isBank
          ? t("journalEntries.drawer.viewBankTxn", "Xem giao dịch ngân hàng")
          : isInvoice
            ? t(
                "journalEntries.drawer.viewInvoice",
                "Xem hóa đơn VAT liên quan",
              )
            : t("journalEntries.drawer.viewSourceDoc", "Xem chứng từ gốc"),
        icon: isBank ? (
          <Building2 className="w-3.5 h-3.5" />
        ) : isInvoice ? (
          <FileText className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        ),
        onClick: () => {
          if (isBank) {
            setSelectedBankTxnId(row._sourceId!);
          } else if (isInvoice) {
            setSelectedInvoiceId(row._sourceId!);
          }
        },
      });
    }

    return [
      {
        groupLabel: t("journalEntries.drawer.groupTraCuu", "TRA CỨU"),
        items: lookupItems,
      },
      {
        groupLabel: t("journalEntries.drawer.groupThaoTac", "THAO TÁC"),
        items: [
          {
            label: t("common.edit", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => {
              setSelectedRowData(row);
              setSelectedJournalEntryId(row._entryNo || row._id);
              setJournalDrawerMode("edit");
            },
          },
          {
            label: t(
              "journalEntries.drawer.copyEntryNo",
              "Sao chép số chứng từ",
            ),
            icon: <Copy className="w-3.5 h-3.5" />,
            onClick: () => {
              if (row._entryNo && navigator.clipboard) {
                navigator.clipboard.writeText(row._entryNo);
              }
            },
            disabled: !row._entryNo,
          },
          {
            label: t(
              "journalEntries.drawer.copyReference",
              "Sao chép mã tham chiếu",
            ),
            icon: <Copy className="w-3.5 h-3.5" />,
            onClick: () => {
              if (row._reference && navigator.clipboard) {
                navigator.clipboard.writeText(row._reference);
              }
            },
            disabled: !row._reference,
          },
        ],
      },
    ];
  };

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
    const totals = listHook.totals;
    const grandDebit = totals?.grandTotalDebit ?? totalDebit;
    const grandCredit = totals?.grandTotalCredit ?? totalCredit;
    const grandLines = totals?.totalLines ?? listHook.total;
    const cumDebit =
      totals?.cumulativeDebit ?? (listHook.page === 1 ? totalDebit : undefined);
    const cumCredit =
      totals?.cumulativeCredit ??
      (listHook.page === 1 ? totalCredit : undefined);
    const cumLines =
      totals?.cumulativeLines ??
      (listHook.page === 1 ? listHook.data.length : undefined);

    return {
      _opposingAccount: (
        <div className="w-full flex justify-end">
          <SubtotalSummaryCell
            variantType="label"
            label={`${t("common.subtotal", "Tổng cộng")}:`}
            page={listHook.page}
            totalPages={listHook.totalPages}
            totalCount={grandLines}
            currentPageCount={listHook.data.length}
            cumulativeCount={cumLines}
          />
        </div>
      ),
      debit: (
        <div className="w-full flex justify-end">
          <SubtotalSummaryCell
            variantType="amount"
            metricTitle={t("finance.totalDebit", "Phát sinh Nợ")}
            subtotalAmount={totalDebit}
            cumulativeAmount={cumDebit}
            grandTotalAmount={grandDebit}
            page={listHook.page}
            totalPages={listHook.totalPages}
            valueClassName="font-semibold tabular-nums text-slate-900 dark:text-slate-100"
          />
        </div>
      ),
      credit: (
        <div className="w-full flex justify-end">
          <SubtotalSummaryCell
            variantType="amount"
            metricTitle={t("finance.totalCredit", "Phát sinh Có")}
            subtotalAmount={totalCredit}
            cumulativeAmount={cumCredit}
            grandTotalAmount={grandCredit}
            page={listHook.page}
            totalPages={listHook.totalPages}
            valueClassName="font-semibold tabular-nums text-slate-900 dark:text-slate-100"
          />
        </div>
      ),
    };
  }, [
    listHook.data,
    listHook.total,
    listHook.totals,
    listHook.page,
    listHook.totalPages,
    t,
  ]);

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
      <JournalEntryDetailDrawer
        open={!!selectedJournalEntryId}
        journalEntryId={selectedJournalEntryId}
        initialMode={journalDrawerMode}
        initialData={selectedRowData}
        onClose={() => {
          setSelectedJournalEntryId(null);
          setSelectedRowData(null);
        }}
        onSaved={() => {
          listHook.refetch();
        }}
      />
    </>
  );
};
