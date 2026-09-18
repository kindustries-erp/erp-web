import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import { money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

export interface UseBankStatementColumnsProps {
  type: "bank" | "cash";
  page: number;
  pageSize: number;
  tableState: {
    sorts: string[];
    setSort: (key: string, state: "asc" | "desc" | "none") => void;
    columnFilters: Record<string, string[]>;
    setColumnFilter: (key: string, values: string[]) => void;
    columnSearch: Record<string, string>;
    setColumnSearch: (key: string, value: string) => void;
  };
  filter: {
    state: {
      dateFrom?: string;
      dateTo?: string;
      custom?: Record<string, any>;
    };
    setDateFrom?: (v: string) => void;
    setDateTo?: (v: string) => void;
    setDateRange?: (from: string, to: string) => void;
  };
  setPage: (p: number) => void;
  setDetailTransactionId: (id: string | null) => void;
  setDetailDefaultTab?: (tab: string) => void;
  setSelectedPartner: (
    partner: { account?: string; name?: string } | null,
  ) => void;
  setPartnerDrawerOpen: (open: boolean) => void;
}

export function useBankStatementColumns({
  type,
  tableState,
  filter,
  setPage,
  setDetailTransactionId,
  setDetailDefaultTab,
  setSelectedPartner,
  setPartnerDrawerOpen,
}: UseBankStatementColumnsProps) {
  const { t } = useTranslation();

  const fetchColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    pageSize = 20,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    pageSize?: number;
    filtersStr?: string;
  }) => {
    const res = await bankStatementApi.getColumnOptions(
      columnKey,
      search,
      pageParam,
      pageSize,
      filtersStr,
      type === "bank" ? "BANK" : "CASH",
    );
    const currentPage = res.page || pageParam || 1;
    const totalPages =
      res.totalPages || Math.ceil((res.total || 0) / pageSize) || 1;
    return {
      items: res.items || res.data || [],
      total: res.total || 0,
      next: currentPage < totalPages ? currentPage + 1 : null,
    };
  };

  const listHook = useMemo(
    () => ({
      sorts: tableState.sorts,
      setSort: (key: string, state: any) => {
        tableState.setSort(key, state);
      },
      columnFilters: tableState.columnFilters,
      setColumnFilter: (key: string, values: string[]) => {
        tableState.setColumnFilter(key, values);
        setPage(1);
      },
      columnSearch: tableState.columnSearch,
      setColumnSearch: (key: string, value: string) => {
        tableState.setColumnSearch(key, value);
        setPage(1);
      },
      dateFrom: filter.state.dateFrom,
      dateTo: filter.state.dateTo,
      setDateRange: (from?: string, to?: string) => {
        if (filter.setDateRange) {
          filter.setDateRange(from || "", to || "");
        } else if (filter.setDateFrom && filter.setDateTo) {
          filter.setDateFrom(from || "");
          filter.setDateTo(to || "");
        }
        setPage(1);
      },
    }),
    [tableState, filter, setPage],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        fetchOptions: fetchColumnOptions,
        queryKeyPrefix: `bank-statement-${type}-column-options`,
        defaultAlign: "center",
      }),
    [listHook, type],
  );

  const settledOptions = useMemo(
    () => [
      {
        value: "settled_full",
        label: t("bankStatement.filters.settledFull", {
          defaultValue: "Đã cấn trừ hết",
        }),
      },
      {
        value: "settled_partial",
        label: t("bankStatement.filters.settledPartial", {
          defaultValue: "Đã cấn trừ một phần",
        }),
      },
      {
        value: "unsettled",
        label: t("bankStatement.filters.unsettled", {
          defaultValue: "Chưa cấn trừ",
        }),
      },
    ],
    [t],
  );

  const renderCopyableText = (text: string) => {
    if (!text) return null;
    return (
      <Tooltip content={<div className="whitespace-pre-wrap">{text}</div>}>
        <div
          className="w-full line-clamp-2 break-words whitespace-normal cursor-pointer hover:opacity-80 active:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text);
            toast.success(t("copied", { defaultValue: "Đã copy text" }));
          }}
        >
          {text}
        </div>
      </Tooltip>
    );
  };

  const columns: any[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px] text-center",
        className: "w-[40px] min-w-[40px] text-center",
        cell: (_: any, idx: number) => (
          <span className="text-muted-foreground">{idx}</span>
        ),
      },
      {
        key: "account",
        header: headerFilter(
          "account",
          type === "bank"
            ? t("bankStatement.columns.bankAccount", {
                defaultValue: "Ngân hàng",
              })
            : t("bankStatement.columns.cashBook", { defaultValue: "Sổ quỹ" }),
          { showBlankOption: true },
        ),
        cell: (row: any) => {
          const text =
            type === "bank"
              ? row.bankAccount?.bankName
                ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
                : ""
              : row.cashBook?.name || "";
          return renderCopyableText(text);
        },
        size: 140,
      },
      {
        key: "transDate",
        dataIndex: "transDate",
        header: headerFilter.date(
          "transDate",
          t("bankStatement.columns.transDate", {
            defaultValue: "Ngày giao dịch",
          }),
        ),
        cell: (row: any) => <TableDateCell date={row.transDate} />,
        size: 130,
      },
      {
        key: "referenceNumber",
        header: headerFilter(
          "referenceNumber",
          t("bankStatement.columns.referenceNumber", {
            defaultValue: "Số tham chiếu",
          }),
          { showBlankOption: true },
        ),
        size: 180,
        cell: (row: any) => {
          if (!row.referenceNumber) return "—";
          return (
            <TableText
              text={row.referenceNumber}
              onDetailClick={(e) => {
                e.stopPropagation();
                setDetailTransactionId(row.id);
              }}
              tooltip={true}
              enableCopy={true}
              textClassName="text-primary"
            />
          );
        },
      },
      {
        key: "description",
        dataIndex: "description",
        header: headerFilter(
          "description",
          t("bankStatement.columns.description", {
            defaultValue: "Nội dung giao dịch",
          }),
          { showBlankOption: true },
        ),
        size: 360,
        cell: (row: any) => renderCopyableText(row.description),
      },
      {
        key: "thu",
        header: headerFilter.amount(
          "thu",
          t("bankStatement.columns.thu", { defaultValue: "Tiền vào (Thu)" }),
        ),
        cell: (row: any) => {
          const credit = parseFloat(row.creditAmount) || 0;
          if (credit > 0)
            return (
              <span className="text-emerald-600 font-medium">
                {money(credit)}
              </span>
            );
          return null;
        },
        className: "text-right",
        size: 140,
        sortable: false,
      },
      {
        key: "chi",
        header: headerFilter.amount(
          "chi",
          t("bankStatement.columns.chi", { defaultValue: "Tiền ra (Chi)" }),
        ),
        cell: (row: any) => {
          const debit = parseFloat(row.debitAmount) || 0;
          if (debit > 0)
            return (
              <span className="text-[#ea580c] font-medium">{money(debit)}</span>
            );
          return null;
        },
        className: "text-right",
        size: 140,
        sortable: false,
      },
      {
        key: "balance",
        dataIndex: "balance",
        header: headerFilter.amount(
          "balance",
          t("bankStatement.columns.balance", { defaultValue: "Số dư" }),
        ),
        cell: (row: any) => money(row.balance),
        className: "text-right font-medium",
        size: 140,
        sortable: false,
      },
      {
        key: "netOffAmount",
        header: headerFilter.client(
          "netOffAmount",
          t("bankStatement.columns.netOffAmount", {
            defaultValue: "Đã cấn trừ",
          }),
          { filterOptions: settledOptions },
        ),
        className:
          "text-right bg-indigo-50/40 dark:bg-indigo-950/20 border-l border-indigo-200/60 dark:border-indigo-800/30",
        headerClassName:
          "text-center bg-indigo-50/40 dark:bg-indigo-950/20 border-l border-indigo-200/60 dark:border-indigo-800/30",
        size: 140,
        cell: (row: any) => {
          const netOff = parseFloat(row.netOffAmount) || 0;
          if (netOff === 0) return "--";
          return (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              {money(netOff)}
            </span>
          );
        },
      },
      {
        key: "remainingAmount",
        header: headerFilter.client(
          "remainingAmount",
          t("bankStatement.columns.remainingAmount", {
            defaultValue: "Còn lại",
          }),
          { filterOptions: settledOptions },
        ),
        className:
          "text-right font-semibold bg-indigo-50/40 dark:bg-indigo-950/20",
        headerClassName: "text-center bg-indigo-50/40 dark:bg-indigo-950/20",
        size: 140,
        cell: (row: any) => {
          const credit = parseFloat(row.creditAmount) || 0;
          const debit = parseFloat(row.debitAmount) || 0;
          const amount = credit > 0 ? credit : debit;
          const netOff = parseFloat(row.netOffAmount) || 0;
          const remaining = amount - netOff;
          if (remaining === 0)
            return <span className="text-emerald-600 font-medium">0</span>;
          return (
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {money(remaining)}
            </span>
          );
        },
      },
      {
        key: "invoiceSubject",
        header: headerFilter(
          "invoiceSubject",
          t("bankStatement.columns.invoiceSubject", {
            defaultValue: "Đối tượng HĐ",
          }),
          { showBlankOption: true },
        ),
        size: 200,
        cell: (row: any) => {
          let subject = row.invoiceSubject;
          if (!subject && row.invoiceNetOffs && row.invoiceNetOffs.length > 0) {
            const subjects = row.invoiceNetOffs
              .map((link: any) => {
                const inv = link.invoice || link.erpInvoice || {};
                const name =
                  inv.direction === "IN" ? inv.sellerName : inv.buyerName;
                const taxCode =
                  inv.direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;
                return taxCode && name ? `${taxCode} - ${name}` : name;
              })
              .filter(Boolean);
            if (subjects.length > 0) {
              subject = Array.from(new Set(subjects)).join(", ");
            }
          }
          return renderCopyableText(subject);
        },
      },
      {
        key: "correspondentName",
        header: headerFilter(
          "correspondentName",
          t("bankStatement.columns.correspondentName", {
            defaultValue: "Đối tác / Thụ hưởng",
          }),
          { showBlankOption: true },
        ),
        size: 200,
        cell: (row: any) => {
          if (!row.correspondentName) return null;
          return (
            <TableText
              text={row.correspondentName}
              onDrawerClick={(e) => {
                e.stopPropagation();
                if (setDetailDefaultTab && setDetailTransactionId) {
                  setDetailDefaultTab("partner");
                  setDetailTransactionId(row.id);
                } else {
                  setSelectedPartner({
                    account: row.correspondentAccount,
                    name: row.correspondentName,
                  });
                  setPartnerDrawerOpen(true);
                }
              }}
              tooltip={row.correspondentName}
              enableCopy={true}
              textClassName="text-primary"
            />
          );
        },
      },
      {
        key: "correspondentAccount",
        header: headerFilter(
          "correspondentAccount",
          t("bankStatement.columns.correspondentAccount", {
            defaultValue: "TK đối ứng",
          }),
          { showBlankOption: true },
        ),
        size: 160,
        cell: (row: any) => {
          if (!row.correspondentAccount) return null;
          return (
            <TableText
              text={row.correspondentAccount}
              onDrawerClick={(e) => {
                e.stopPropagation();
                if (setDetailDefaultTab && setDetailTransactionId) {
                  setDetailDefaultTab("partner");
                  setDetailTransactionId(row.id);
                } else {
                  setSelectedPartner({
                    account: row.correspondentAccount,
                    name: row.correspondentName,
                  });
                  setPartnerDrawerOpen(true);
                }
              }}
              tooltip={row.correspondentAccount}
              enableCopy={true}
              textClassName="text-primary"
            />
          );
        },
      },
      {
        key: "correspondentBank",
        header: headerFilter(
          "correspondentBank",
          t("bankStatement.columns.correspondentBank", {
            defaultValue: "Ngân hàng đối tác",
          }),
          { showBlankOption: true },
        ),
        size: 160,
        cell: (row: any) => renderCopyableText(row.correspondentBank),
      },
      {
        key: "branch",
        header: headerFilter(
          "branch",
          t("bankStatement.columns.branch", { defaultValue: "Chi nhánh" }),
          { showBlankOption: true },
        ),
        size: 140,
        cell: (row: any) => {
          const text = row.branch?.name || "";
          return renderCopyableText(text);
        },
      },
    ],
    [
      headerFilter,
      setDetailTransactionId,
      setDetailDefaultTab,
      setSelectedPartner,
      setPartnerDrawerOpen,
      settledOptions,
      t,
      type,
    ],
  );

  return { columns, renderCopyableText };
}
