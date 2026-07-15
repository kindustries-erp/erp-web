import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Wallet, Plus, Upload } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { FolderArchive } from "lucide-react";
import { getTags } from "@/modules/tags/api/tagsApi";
import { ImportStatementDrawer } from "@/pages/finance/components/ImportStatementDrawer";
import { OriginalStatementFilesDrawer } from "@/pages/finance/components/OriginalStatementFilesDrawer";
import { CreateCashTransactionDrawer } from "@/pages/finance/components/CreateCashTransactionDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import toast from "react-hot-toast";

import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";

export const BankStatementPage = ({ type }: { type: "bank" | "cash" }) => {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isOriginalFilesOpen, setIsOriginalFilesOpen] = useState(false);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const { data: accountsData = [] } = useQuery<any[]>({
    queryKey: [type === "bank" ? "bank-accounts" : "cash-books"],
    queryFn: async () => {
      const data =
        type === "bank"
          ? await bankStatementApi.getBankAccounts()
          : await bankStatementApi.getCashBooks();
      return data as any[];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const filterConfig = useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: branches.map((b) => ({ value: b.id, label: b.name })),
      },
    ];

    if (accountsData && accountsData.length > 0) {
      custom.push({
        key: type === "bank" ? "bankAccountId" : "cashBookId",
        label: type === "bank" ? "Ngân hàng" : "Sổ quỹ",
        placeholder: type === "bank" ? "Tất cả ngân hàng" : "Tất cả sổ quỹ",
        options: accountsData.map((a: any) => ({
          value: a.id,
          label:
            type === "bank" ? `${a.bankCode} - ${a.accountNumber}` : a.name,
        })),
      });
    }

    custom.push({
      key: "transactionType",
      label: "Loại giao dịch",
      placeholder: "Tất cả",
      options: [
        { value: "IN", label: "Tiền vào" },
        { value: "OUT", label: "Tiền ra" },
      ],
    });

    custom.push({
      key: "tagIds",
      label: "Danh mục (Tags)",
      placeholder: "Chọn danh mục",
      options: tags.map((t) => ({ value: t.id, label: t.name })),
      multiple: true,
    });

    return {
      search: true,
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches, accountsData, type, tags]);

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const tableState = useTableColumnState(`bank-statement-${type}-table-v3`);

  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      "bank-transactions",
      type,
      page,
      pageSize,
      filter.state,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        sourceType: type === "bank" ? "BANK" : "CASH",
        page,
        pageSize,
        sortBy,
        sortOrder,
        search: filter.state.search || undefined,
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
        bankAccountId: filter.state.custom.bankAccountId || undefined,
        cashBookId: filter.state.custom.cashBookId || undefined,
        transactionType: filter.state.custom.transactionType as
          | string
          | undefined,
        tagIds: filter.state.custom.tagIds as unknown as string[] | undefined,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
  });

  const fetchColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    return bankStatementApi.getColumnOptions(
      columnKey,
      search,
      pageParam,
      20,
      filtersStr,
      type === "bank" ? "BANK" : "CASH",
    );
  };

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
    setPage(1);
  };

  const formatAmtOption = (val: string | number) => {
    const n = Number(val || 0);
    if (isNaN(n)) return String(val);
    return n.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const renderHeaderFilter = (key: string, label: string) => {
    let formatOptionLabel: ((val: string) => string) | undefined;
    if (
      ["thu", "chi", "balance", "netOffAmount", "remainingAmount"].includes(key)
    ) {
      formatOptionLabel = formatAmtOption as any;
    }

    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        sortState={getSortState(key)}
        onSortChange={(state) => handleSortChange(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => handleSearchChange(key, val)}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => handleFilterChange(key, vals)}
        columnKey={key}
        allFilters={tableState.columnFilters}
        fetchOptions={fetchColumnOptions}
        formatOptionLabel={formatOptionLabel}
      />
    );
  };

  const summaryRow = useMemo(() => {
    if (!data?.items || data.items.length === 0) return undefined;

    const totalDebit = data.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
      0,
    );
    const totalCredit = data.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
      0,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const netAmount = totalCredit - totalDebit;

    const totalNetOff = data.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = data.items.reduce(
      (acc: number, curr: any) =>
        acc +
        (Math.max(
          parseFloat(curr.creditAmount) || 0,
          parseFloat(curr.debitAmount) || 0,
        ) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    return {
      transDate: null,
      thu:
        totalCredit > 0 ? (
          <span className="text-emerald-600 font-medium">
            +{money(totalCredit)}
          </span>
        ) : (
          money(0)
        ),
      chi:
        totalDebit > 0 ? (
          <span className="text-[#ea580c] font-medium">
            {money(totalDebit)}
          </span>
        ) : (
          money(0)
        ),
      netOffAmount:
        totalNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 font-medium">
            {money(totalNetOff)}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-slate-700 font-medium">
            {money(totalRemaining)}
          </span>
        ),
    };
  }, [data]);

  const renderCopyableText = (text: string) => {
    if (!text) return null;
    return (
      <Tooltip content={<div className="whitespace-pre-wrap">{text}</div>}>
        <div
          className="w-full line-clamp-2 break-words whitespace-normal cursor-pointer hover:opacity-80 active:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text);
            toast.success("Đã copy text");
          }}
        >
          {text}
        </div>
      </Tooltip>
    );
  };

  const columns: any[] = [
    {
      key: "account",
      header: renderHeaderFilter(
        "account",
        type === "bank" ? "Ngân hàng" : "Sổ quỹ",
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
      size: 150,
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: renderHeaderFilter(
        "transDate",
        t("bankStatement.columns.transDate"),
      ),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 150,
      sortable: false,
    },

    {
      key: "description",
      dataIndex: "description",
      header: renderHeaderFilter(
        "description",
        t("bankStatement.columns.description"),
      ),
      size: 400,
      cell: (row: any) => renderCopyableText(row.description),
    },
    {
      key: "thu",
      header: renderHeaderFilter("thu", t("bankStatement.columns.thu")),
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-emerald-600 font-medium">
              +{money(credit)}
            </span>
          );
        return null;
      },
      className: "text-right",
      size: 150,
      sortable: false,
    },
    {
      key: "chi",
      header: renderHeaderFilter("chi", t("bankStatement.columns.chi")),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-[#ea580c] font-medium">{money(debit)}</span>
          );
        return null;
      },
      className: "text-right",
      size: 150,
      sortable: false,
    },
    {
      key: "netOffAmount",
      header: "Đã cấn trừ",
      className: "text-right bg-blue-50/50 border-l border-blue-200",
      headerClassName: "text-center bg-blue-50/50 border-l border-blue-200",
      size: 150,
      cell: (row: any) => {
        const netOff = parseFloat(row.netOffAmount) || 0;
        if (netOff === 0) return "--";
        return (
          <span className="text-blue-600 font-medium">{money(netOff)}</span>
        );
      },
    },
    {
      key: "remainingAmount",
      header: "Còn lại",
      className: "text-right font-semibold bg-blue-50/50",
      headerClassName: "text-center bg-blue-50/50",
      size: 150,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = amount - netOff;
        if (remaining === 0)
          return <span className="text-emerald-600 font-medium">0</span>;
        return (
          <span className="text-slate-700 font-medium">{money(remaining)}</span>
        );
      },
    },
    {
      key: "balance",
      dataIndex: "balance",
      header: renderHeaderFilter("balance", t("bankStatement.columns.balance")),
      cell: (row: any) => money(row.balance),
      className: "text-right font-medium",
      size: 150,
      sortable: false,
    },
    {
      key: "correspondentName",
      header: renderHeaderFilter(
        "correspondentName",
        t("bankStatement.columns.correspondentName"),
      ),
      size: 200,
      cell: (row: any) => renderCopyableText(row.correspondentName),
    },
    {
      key: "correspondentAccount",
      header: renderHeaderFilter(
        "correspondentAccount",
        t("bankStatement.columns.correspondentAccount"),
      ),
      size: 150,
      cell: (row: any) => renderCopyableText(row.correspondentAccount),
    },
    {
      key: "correspondentBank",
      header: renderHeaderFilter(
        "correspondentBank",
        t("bankStatement.columns.correspondentBank"),
      ),
      size: 150,
      cell: (row: any) => renderCopyableText(row.correspondentBank),
    },
    {
      key: "branch",
      header: renderHeaderFilter("branch", "Chi nhánh"),
      size: 150,
      cell: (row: any) => {
        const text = row.branch?.name || "";
        return renderCopyableText(text);
      },
    },
    {
      key: "referenceNumber",
      header: renderHeaderFilter(
        "referenceNumber",
        t("bankStatement.columns.referenceNumber"),
      ),
      size: 150,
      cell: (row: any) => renderCopyableText(row.referenceNumber),
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          type === "bank"
            ? t("bankStatement.bankTitle")
            : t("bankStatement.cashTitle")
        }
        desc={
          type === "bank"
            ? t("bankStatement.bankDesc")
            : t("bankStatement.cashDesc")
        }
        icon={type === "bank" ? <Building2 /> : <Wallet />}
        tableId={`bank-statement-${type}-table-v3`}
        items={data?.items || []}
        columns={columns.map((c) => ({
          ...c,
          headerClassName: c.headerClassName
            ? `${c.headerClassName} text-center`
            : "text-center",
        }))}
        getRowKey={(row: any) => row.id}
        summaryRow={summaryRow}
        loading={isFetching}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={data?.totalPages || 0}
        onPage={setPage}
        onPageSize={setPageSize}
        onRefresh={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: [type === "bank" ? "bank-accounts" : "cash-books"],
          });
        }}
        filterConfig={filterConfig}
        filter={filter}
        sortArray={tableState.sorts}
        onSort={(colKey) => {
          handleSortChange(
            colKey,
            getSortState(colKey) === "asc" ? "desc" : "asc",
          );
          setPage(1);
        }}
        rowActions={(row) => [
          {
            groupLabel: t("groupTraCuu", "Tra cứu"),
            items: [
              {
                label: "Chi tiết",
                onClick: () => setDetailTransactionId(row.id),
              },
            ],
          },
        ]}
        createActions={[
          {
            groupLabel: t("groupThemMoi", "Thêm mới"),
            items:
              type === "cash"
                ? [
                    {
                      label: "Tạo mới",
                      icon: <Plus className="w-4 h-4 text-emerald-600" />,
                      onClick: () => setIsCreateOpen(true),
                    },
                    {
                      label: t("bankStatement.importBtn", "Nhập sao kê"),
                      icon: <Upload className="w-4 h-4 text-emerald-600" />,
                      onClick: () => setIsImportOpen(true),
                    },
                    {
                      label: "Quản lý file gốc",
                      icon: (
                        <FolderArchive className="w-4 h-4 text-emerald-600" />
                      ),
                      onClick: () => setIsOriginalFilesOpen(true),
                    },
                  ]
                : [
                    {
                      label: t("bankStatement.importBtn", "Nhập sao kê"),
                      icon: <Upload className="w-4 h-4 text-emerald-600" />,
                      onClick: () => setIsImportOpen(true),
                    },
                    {
                      label: "Quản lý file gốc",
                      icon: (
                        <FolderArchive className="w-4 h-4 text-emerald-600" />
                      ),
                      onClick: () => setIsOriginalFilesOpen(true),
                    },
                  ],
          },
        ]}
      />

      <OriginalStatementFilesDrawer
        isOpen={isOriginalFilesOpen}
        onClose={() => setIsOriginalFilesOpen(false)}
        type={type}
      />

      <ImportStatementDrawer
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type={type}
        onSuccess={() => {
          setIsImportOpen(false);
          refetch();
        }}
      />

      {type === "cash" && (
        <CreateCashTransactionDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            refetch();
          }}
        />
      )}

      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />
    </>
  );
};
