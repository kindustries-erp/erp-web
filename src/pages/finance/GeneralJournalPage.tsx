import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { formatGMT7, money } from "@/shared/utils/format";
import { useAppStore } from "@/core/config/appStore";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { InvoiceDetailWrapper } from "@/modules/erp-invoices-core/components/InvoiceDetailWrapper";
import { Popover } from "@/core/components/ui/Popover";

export const GeneralJournalPage = () => {
  const t = useT();
  const { setCustomBreadcrumbs } = useAppStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortArray, setSortArray] = useState<string[]>(["-date"]);
  const [selectedBankTxnId, setSelectedBankTxnId] = useState<string | null>(
    null,
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.cashflow"],
      ["nav.items.reportJournal"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const filterConfig = useMemo(() => {
    return {
      search: true,
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "branchId",
          label: "Chi nhánh",
          placeholder: "Tất cả chi nhánh",
          options: branches.map((b) => ({ value: b.id, label: b.name })),
        },
      ],
    };
  }, [branches]);

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const {
    data: journalData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["journal-entries", page, pageSize, filter.state, sortArray],
    queryFn: async () => {
      return accountingApi.getJournalEntries({
        page,
        pageSize,
        search: filter.state.search || undefined,
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom?.branchId || undefined,
        sortBy: sortArray[0]?.replace("-", ""),
        sortOrder: sortArray[0]?.startsWith("-") ? "DESC" : "ASC",
      });
    },
  });

  // Flatten lines for spreadsheet view
  const flattenedData = useMemo(() => {
    if (!journalData?.items) return [];
    const result: any[] = [];
    journalData.items.forEach((entry: any) => {
      if (entry.lines && entry.lines.length > 0) {
        // Sắp xếp lại lines theo trường sort từ backend để đảm bảo đúng thứ tự cặp (Nợ -> Có)
        const sortedLines = [...entry.lines].sort(
          (a: any, b: any) => a.sort - b.sort,
        );

        sortedLines.forEach((line: any, index: number) => {
          const isDebit = Number(line.debit) > 0;
          // Because backend pairs them adjacently (Nợ -> Có), if it's debit, opposing is index + 1; if credit, opposing is index - 1
          const opposingLine = sortedLines[isDebit ? index + 1 : index - 1];
          const opposingAccountCode = opposingLine?.account?.accountCode || "";

          result.push({
            ...line,
            _id: `${entry.id}-${line.id}`,
            _entryNo: entry.entryNo,
            _date: entry.date,
            _documentDate: entry.documentDate,
            _status: entry.status,
            _description: entry.description,
            _reference: entry.reference,
            _branch: entry.branch?.name,
            _sourceId: entry.sourceId,
            _sourceType: entry.sourceType,
            _subjectName: entry.subjectName,
            _account: line.account?.accountCode,
            _opposingAccount: opposingAccountCode,
            isFirstLine: index === 0,
            rowSpan: index === 0 ? entry.lines.length : 0,
          });
        });
      } else {
        result.push({
          ...entry,
          _id: entry.id,
          _entryNo: entry.entryNo,
          _date: entry.date,
          _documentDate: entry.documentDate,
          _status: entry.status,
          _description: entry.description,
          _reference: entry.reference,
          _branch: entry.branch?.name,
          _sourceId: entry.sourceId,
          _sourceType: entry.sourceType,
          _subjectName: entry.subjectName,
          isFirstLine: true,
          rowSpan: 1,
        });
      }
    });
    return result;
  }, [journalData]);

  const columns = useMemo(
    () => [
      {
        key: "_date",
        header: "Ngày hạch toán",
        size: 130,
        cell: (row: any) => <span>{formatGMT7(row._date, "date")}</span>,
      },
      {
        key: "_documentDate",
        header: "Ngày chứng từ",
        size: 130,
        cell: (row: any) => (
          <span>
            {row._documentDate ? formatGMT7(row._documentDate, "date") : "-"}
          </span>
        ),
      },
      {
        key: "_entryNo",
        header: "Số CT",
        size: 120,
        cell: (row: any) => (
          <span className="font-medium text-blue-600 cursor-pointer hover:underline">
            {row._entryNo}
          </span>
        ),
      },
      {
        key: "account",
        header: "TK",
        size: 80,
        cell: (row: any) => {
          return <span className="font-mono text-sm">{row._account}</span>;
        },
      },
      {
        key: "opposingAccount",
        header: "TK đối ứng",
        size: 80,
        cell: (row: any) => {
          return (
            <span className="font-mono text-sm">{row._opposingAccount}</span>
          );
        },
      },
      {
        key: "debit",
        header: "Phát sinh Nợ",
        size: 130,
        align: "right" as const,
        cell: (row: any) => (
          <span
            className={
              Number(row.debit) > 0
                ? "font-medium text-gray-900 dark:text-gray-100"
                : "text-transparent"
            }
          >
            {Number(row.debit) > 0 ? money(row.debit) : "-"}
          </span>
        ),
      },
      {
        key: "credit",
        header: "Phát sinh Có",
        size: 130,
        align: "right" as const,
        cell: (row: any) => (
          <span
            className={
              Number(row.credit) > 0
                ? "font-medium text-gray-900 dark:text-gray-100"
                : "text-transparent"
            }
          >
            {Number(row.credit) > 0 ? money(row.credit) : "-"}
          </span>
        ),
      },
      {
        key: "description",
        header: "Diễn giải",
        size: 400,
        cell: (row: any) => (
          <Popover
            content={
              <div className="p-3 text-sm max-w-md break-words whitespace-normal text-slate-800">
                {row.description || row._description || "—"}
              </div>
            }
          >
            <div className="text-gray-600 dark:text-gray-300 w-full cursor-pointer hover:text-primary underline decoration-dashed underline-offset-4 decoration-slate-300 line-clamp-2">
              {row.description || row._description}
            </div>
          </Popover>
        ),
      },
      {
        key: "_subjectName",
        header: "Đối tượng",
        size: 200,
        cell: (row: any) => (
          <Popover
            content={
              <div className="p-3 text-sm max-w-sm break-words whitespace-normal text-slate-800">
                {row._subjectName || "—"}
              </div>
            }
          >
            <span className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary underline decoration-dashed underline-offset-4 decoration-slate-300 truncate block">
              {row._subjectName || "-"}
            </span>
          </Popover>
        ),
      },
      {
        key: "_branch",
        header: "Chi nhánh",
        size: 150,
        cell: (row: any) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row._branch || "-"}
          </span>
        ),
      },
      {
        key: "_reference",
        header: "Tham chiếu",
        size: 130,
        cell: (row: any) => {
          if (!row._reference) return <span className="text-gray-400">-</span>;
          if (row._sourceType === "BANK" && row._sourceId) {
            return (
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => setSelectedBankTxnId(row._sourceId)}
              >
                {row._reference}
              </span>
            );
          }
          if (row._sourceType === "INVOICE" && row._sourceId) {
            return (
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => setSelectedInvoiceId(row._sourceId)}
              >
                {row._reference}
              </span>
            );
          }
          return (
            <span className="text-gray-600 dark:text-gray-400">
              {row._reference}
            </span>
          );
        },
      },
    ],
    [t],
  );

  const summaryRow = useMemo(() => {
    if (!flattenedData.length) return undefined;
    const totalDebit = flattenedData.reduce(
      (sum, item) => sum + (Number(item.debit) || 0),
      0,
    );
    const totalCredit = flattenedData.reduce(
      (sum, item) => sum + (Number(item.credit) || 0),
      0,
    );
    return {
      debit: <span className="font-semibold">{money(totalDebit)}</span>,
      credit: <span className="font-semibold">{money(totalCredit)}</span>,
    };
  }, [flattenedData]);

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("Nhật ký chung")}
        icon={<BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
        tableId="general-journal-table"
        items={flattenedData}
        columns={columns}
        getRowKey={(row: any) => row._id}
        loading={isFetching}
        page={page}
        pageSize={pageSize}
        total={journalData?.total || 0}
        totalPages={journalData?.totalPages || 0}
        onPage={setPage}
        onPageSize={setPageSize}
        onRefresh={refetch}
        filterConfig={filterConfig}
        filter={filter}
        sortArray={sortArray}
        summaryRow={summaryRow}
        onSort={(colKey) => {
          setSortArray((prev) => {
            const current = prev[0];
            if (current === colKey) return [`-${colKey}`];
            if (current === `-${colKey}`) return [];
            return [colKey];
          });
        }}
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
