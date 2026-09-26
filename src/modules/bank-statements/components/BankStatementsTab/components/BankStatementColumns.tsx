import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import { money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import {
  renderCopyableText,
  renderReferenceCell,
  renderThuCell,
  renderChiCell,
  renderNetOffCell,
  renderRemainingCell,
  renderInvoiceSubjectCell,
  renderPartnerCell,
} from "./BankStatementCellRenderers";

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
      setSort: (key: string, state: any) => tableState.setSort(key, state),
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
        if (filter.setDateRange) filter.setDateRange(from || "", to || "");
        else if (filter.setDateFrom && filter.setDateTo) {
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

  const handleOpenPartner = (
    account?: string,
    name?: string,
    rowId?: string,
  ) => {
    if (setDetailDefaultTab && setDetailTransactionId && rowId) {
      setDetailDefaultTab("partner");
      setDetailTransactionId(rowId);
    } else {
      setSelectedPartner({ account, name });
      setPartnerDrawerOpen(true);
    }
  };

  const columns: any[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px] text-center",
        className:
          "w-[40px] min-w-[40px] text-center font-mono text-xs text-muted-foreground",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center">{idx}</span>
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
          return renderCopyableText(text, t);
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
        cell: (row: any) =>
          renderReferenceCell(row, (id) => setDetailTransactionId(id)),
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
        cell: (row: any) => renderCopyableText(row.description, t),
      },
      {
        key: "thu",
        header: headerFilter.amount(
          "thu",
          t("bankStatement.columns.thu", { defaultValue: "Tiền vào (Thu)" }),
        ),
        cell: renderThuCell,
        className: "text-right",
        size: 140,
      },
      {
        key: "chi",
        header: headerFilter.amount(
          "chi",
          t("bankStatement.columns.chi", { defaultValue: "Tiền ra (Chi)" }),
        ),
        cell: renderChiCell,
        className: "text-right",
        size: 140,
      },
      {
        key: "balance",
        dataIndex: "balance",
        header: headerFilter.amount(
          "balance",
          t("bankStatement.columns.balance", { defaultValue: "Số dư" }),
        ),
        cell: (row: any) => (
          <span className="tabular-nums font-medium">{money(row.balance)}</span>
        ),
        className: "text-right font-medium",
        size: 140,
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
          "text-right bg-muted/20 border-l border-border/40 font-medium",
        headerClassName:
          "text-center bg-muted/20 border-l border-border/40 font-medium",
        size: 140,
        cell: renderNetOffCell,
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
        className: "text-right font-semibold bg-muted/20",
        headerClassName: "text-center bg-muted/20 font-semibold",
        size: 140,
        cell: renderRemainingCell,
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
        cell: (row: any) => renderInvoiceSubjectCell(row, t),
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
        cell: (row: any) =>
          renderPartnerCell(
            row.correspondentAccount,
            row.correspondentName,
            row.id,
            handleOpenPartner,
          ),
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
        cell: (row: any) =>
          renderPartnerCell(
            row.correspondentAccount,
            row.correspondentName,
            row.id,
            handleOpenPartner,
          ),
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
        cell: (row: any) => renderCopyableText(row.correspondentBank, t),
      },
      {
        key: "branch",
        header: headerFilter(
          "branch",
          t("bankStatement.columns.branch", { defaultValue: "Chi nhánh" }),
          { showBlankOption: true },
        ),
        size: 140,
        cell: (row: any) => renderCopyableText(row.branch?.name || "", t),
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

  return {
    columns,
    renderCopyableText: (txt: string) => renderCopyableText(txt, t),
  };
}
