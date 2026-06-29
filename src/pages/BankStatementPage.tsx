import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Wallet, Plus, Upload } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { ImportStatementDrawer } from "@/pages/finance/components/ImportStatementDrawer";
import { CreateCashTransactionDrawer } from "@/pages/finance/components/CreateCashTransactionDrawer";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";

export const BankStatementPage = ({ type }: { type: "bank" | "cash" }) => {
  const t = useT();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortArray, setSortArray] = useState<string[]>(["-transDate"]);

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

  const sortBy = sortArray[0]?.replace("-", "");
  const sortOrder = sortArray[0]?.startsWith("-") ? "DESC" : "ASC";

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "bank-transactions",
      type,
      page,
      pageSize,
      filter.state,
      sortArray,
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
      }),
  });

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

    return {
      transDate: null,
      thu:
        totalCredit > 0 ? (
          <span className="text-green-600 font-medium">
            +{money(totalCredit)}
          </span>
        ) : (
          money(0)
        ),
      chi:
        totalDebit > 0 ? (
          <span className="text-red-600 font-medium">{money(totalDebit)}</span>
        ) : (
          money(0)
        ),
    };
  }, [data]);

  const columns: any[] = [
    {
      key: "account",
      header: type === "bank" ? "Ngân hàng" : "Sổ quỹ",
      cell: (row: any) => {
        const text =
          type === "bank"
            ? row.bankAccount?.bankName
              ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
              : ""
            : row.cashBook?.name || "";
        return (
          <Tooltip content={text}>
            <div className="truncate w-full">{text}</div>
          </Tooltip>
        );
      },
      size: 150,
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: t("bankStatement.columns.transDate"),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 150,
      sortable: true,
    },

    {
      key: "description",
      dataIndex: "description",
      header: t("bankStatement.columns.description"),
      size: 400,
      cell: (row: any) => (
        <div className="whitespace-normal break-words w-full">
          {row.description}
        </div>
      ),
    },
    {
      key: "thu",
      header: t("bankStatement.columns.thu"),
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-green-600 font-medium">+{money(credit)}</span>
          );
        return null;
      },
      className: "text-right",
      size: 150,
      sortable: true,
      sortKey: "creditAmount",
    },
    {
      key: "chi",
      header: t("bankStatement.columns.chi"),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-red-600 font-medium">{money(debit)}</span>
          );
        return null;
      },
      className: "text-right",
      size: 150,
      sortable: true,
      sortKey: "debitAmount",
    },
    {
      key: "balance",
      dataIndex: "balance",
      header: t("bankStatement.columns.balance"),
      cell: (row: any) => money(row.balance),
      className: "text-right font-medium",
      size: 150,
      sortable: false,
    },
    {
      key: "tags",
      header: "Danh mục",
      cell: (row: any) => (
        <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
          <div className="w-max">
            <EntityTagSelector
              entityType="bank_transaction"
              entityId={row.id}
            />
          </div>
        </div>
      ),
      size: 200,
    },
    {
      key: "correspondentName",
      dataIndex: "correspondentName",
      header: t("bankStatement.columns.correspondentName"),
      size: 200,
      valueType: "text",
    },
    {
      key: "correspondentAccount",
      dataIndex: "correspondentAccount",
      header: t("bankStatement.columns.correspondentAccount"),
      size: 150,
      valueType: "text",
    },
    {
      key: "correspondentBank",
      dataIndex: "correspondentBank",
      header: t("bankStatement.columns.correspondentBank"),
      size: 150,
      valueType: "text",
    },
    {
      key: "branch",
      dataIndex: "branch.name",
      header: "Chi nhánh",
      size: 150,
      valueType: "text",
    },
    {
      key: "referenceNumber",
      dataIndex: "referenceNumber",
      header: t("bankStatement.columns.referenceNumber"),
      size: 150,
      valueType: "text",
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
        columns={columns}
        getRowKey={(row: any) => row.id}
        summaryRow={summaryRow}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={data?.totalPages || 0}
        onPage={setPage}
        onPageSize={setPageSize}
        onRefresh={refetch}
        filterConfig={filterConfig}
        filter={filter}
        sortArray={sortArray}
        onSort={(colKey) => {
          setSortArray((prev) => {
            const current = prev[0];
            if (current === colKey) return [`-${colKey}`];
            if (current === `-${colKey}`) return [];
            return [colKey];
          });
          setPage(1);
        }}
        createActions={[
          ...(type === "cash"
            ? [
                {
                  label: "Tạo mới",
                  icon: <Plus className="w-4 h-4 text-emerald-600" />,
                  onClick: () => setIsCreateOpen(true),
                },
              ]
            : [
                {
                  label: t("bankStatement.importBtn"),
                  icon: <Upload className="w-4 h-4 text-emerald-600" />,
                  onClick: () => setIsImportOpen(true),
                },
              ]),
        ]}
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
    </>
  );
};
