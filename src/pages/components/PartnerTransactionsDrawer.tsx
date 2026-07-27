import React, { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { BarChart } from "@/shared/components/charts/BarChart";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { Tooltip } from "@/core/components/ui/Tooltip";
import toast from "react-hot-toast";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";

interface PartnerTransactionsDrawerProps {
  open: boolean;
  onClose: () => void;
  correspondentAccount?: string;
  correspondentName?: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalBranchId?: string;
}

const renderCopyableText = (text: string | null | undefined) => {
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

export function PartnerTransactionsDrawer({
  open,
  onClose,
  correspondentAccount,
  correspondentName,
  globalStartDate,
  globalEndDate,
  globalBranchId,
}: PartnerTransactionsDrawerProps) {
  const t = useT();
  // const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );

  const tableState = useTableColumnState("partner-transactions-table-v1");

  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: [
      "partner-chart",
      correspondentAccount,
      correspondentName,
      globalStartDate,
      globalEndDate,
      globalBranchId,
    ],
    queryFn: () =>
      bankStatementApi.getDashboardStats({
        startDate: globalStartDate,
        endDate: globalEndDate,
        branchId: globalBranchId,
        correspondentAccount,
        correspondentName,
      }),
    enabled: open && (!!correspondentAccount || !!correspondentName),
  });

  const {
    data: tableData,
    isFetching: isTableFetching,
    // refetch,
  } = useQuery({
    queryKey: [
      "partner-transactions",
      correspondentAccount,
      correspondentName,
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
      globalStartDate,
      globalEndDate,
      globalBranchId,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page,
        pageSize,
        sortBy,
        sortOrder,
        startDate: globalStartDate,
        endDate: globalEndDate,
        branchId: globalBranchId,
        correspondentAccount,
        correspondentName,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
    enabled: open && (!!correspondentAccount || !!correspondentName),
  });

  const fetchColumnOptions = useCallback(
    async ({
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
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore parse error
        }
      }
      if (correspondentAccount) {
        currentFilters["correspondentAccount"] = [correspondentAccount];
      }
      if (correspondentName) {
        currentFilters["correspondentName"] = [correspondentName];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      return bankStatementApi.getColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        newFiltersStr,
      );
    },
    [correspondentAccount, correspondentName],
  );

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

  const columns: any[] = [
    {
      key: "account",
      header: renderHeaderFilter("account", "Tài khoản"),
      cell: (row: any) => {
        const text =
          row.sourceType === "BANK"
            ? row.bankAccount?.bankName
              ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
              : ""
            : row.cashBook?.name || "";
        return renderCopyableText(text);
      },
      size: 120,
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: renderHeaderFilter(
        "transDate",
        t("bankStatement.columns.transDate"),
      ),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 120,
      sortable: false,
    },
    {
      key: "referenceNumber",
      header: renderHeaderFilter(
        "referenceNumber",
        t("bankStatement.columns.referenceNumber"),
      ),
      size: 150,
      cell: (row: any) => {
        if (!row.referenceNumber) return "—";
        return (
          <TableText
            text={row.referenceNumber}
            onDrawerClick={(e) => {
              e.stopPropagation();
              setDetailTransactionId(row.id);
            }}
            tooltip={true}
            enableCopy={true}
            textClassName="font-medium underline text-primary hover:text-primary/80 cursor-pointer break-words whitespace-normal"
          />
        );
      },
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
      key: "balance",
      dataIndex: "balance",
      header: renderHeaderFilter("balance", t("bankStatement.columns.balance")),
      cell: (row: any) => money(row.balance),
      className: "text-right font-medium",
      size: 150,
      sortable: false,
    },
    {
      key: "netOffAmount",
      header: renderHeaderFilter("netOffAmount", "Đã cấn trừ"),
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
      header: renderHeaderFilter("remainingAmount", "Còn lại"),
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
      key: "invoiceSubject",
      header: renderHeaderFilter("invoiceSubject", "Đối tượng HĐ"),
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
  ];

  const summaryRow = useMemo(() => {
    if (!tableData?.items || tableData.items.length === 0) return undefined;

    const totalDebit = tableData.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
      0,
    );
    const totalCredit = tableData.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
      0,
    );
    const totalNetOff = tableData.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = tableData.items.reduce(
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
  }, [tableData]);

  const cashTrendLabels = chartData?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = chartData?.cashTrend?.map((t: any) => t.cashIn) || [];
  const cashTrendOut = chartData?.cashTrend?.map((t: any) => t.cashOut) || [];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Giao dịch đối tác: ${correspondentName || correspondentAccount || "Khác"}`}
      panelClassName="min-[1024px]:w-[calc(100vw-280px)] w-full max-w-[90vw]"
      bodyClassName="flex flex-col p-4"
    >
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-800">
            Dòng tiền qua từng tháng
          </h3>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="h-[250px]">
              {isChartLoading ? (
                <ChartSkeleton type="bar" />
              ) : chartData?.cashTrend?.length ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      label: "Tổng thu",
                      data: cashTrendIn,
                      color: "#059669",
                    },
                    {
                      label: "Tổng chi",
                      data: cashTrendOut,
                      color: "#ea580c",
                    },
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-sm font-semibold mb-3 text-slate-800">
            Danh sách Giao dịch
          </h3>
          <div className="flex-1 min-h-0 flex flex-col">
            <StandardTable
              tableId="partner-transactions-table-v1"
              items={tableData?.items || []}
              columns={columns}
              getRowKey={(row: any) => row.id}
              loading={isTableFetching}
              variant="spreadsheet"
              minWidth={1000}
              enableColumnResizing={true}
              containerClassName="max-h-[600px] overflow-auto"
              page={page}
              pageSize={pageSize}
              total={tableData?.total || 0}
              totalPages={tableData?.totalPages || 0}
              onPage={setPage}
              onPageSize={setPageSize}
              summaryRow={summaryRow}
            />
          </div>
        </div>
      </div>
      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />
    </DrawerModal>
  );
}
