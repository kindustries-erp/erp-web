import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useT } from "@/core/i18n";
import { money, formatGMT7 } from "@/shared/utils/format";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";

export function CategoryTransactionsDrawer({
  open,
  onClose,
  tagId,
  tagLabel,
  filterState,
}: {
  open: boolean;
  onClose: () => void;
  tagId?: string;
  tagLabel?: string;
  filterState: any;
}) {
  const t = useT();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: [
      "category-transactions",
      tagId,
      filterState,
      search,
      page,
      pageSize,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        tagIds: tagId ? [tagId] : undefined,
        branchId: filterState.custom?.branchId || undefined,
        sourceType: filterState.custom?.sourceType || undefined,
        startDate: filterState.dateFrom || undefined,
        endDate: filterState.dateTo || undefined,
        search: search || undefined,
        page,
        pageSize,
      }),
    enabled: open && !!tagId,
  });

  const columns = [
    {
      key: "transDate",
      dataIndex: "transDate",
      header: t("bankStatement.columns.transDate"),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 150,
      fixed: false,
    },
    {
      key: "description",
      dataIndex: "description",
      header: t("bankStatement.columns.description"),
      size: 400,
      valueType: "text" as const,
    },
    {
      key: "amount",
      header: "Số tiền",
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-green-600 font-medium">+{money(credit)}</span>
          );
        if (debit > 0)
          return (
            <span className="text-red-600 font-medium">-{money(debit)}</span>
          );
        return money(0);
      },
      size: 150,
    },
    {
      key: "tags",
      header: "Danh mục",
      cell: (row: any) => (
        <EntityTagSelector entityType="bank_transaction" entityId={row.id} />
      ),
      size: 200,
    },
    {
      key: "source",
      header: "Nguồn tiền",
      cell: (row: any) => {
        if (row.sourceType === "BANK")
          return row.bankAccount?.accountNumber || "Bank";
        return row.cashBook?.name || "Cash";
      },
      size: 200,
    },
    {
      key: "referenceNumber",
      dataIndex: "referenceNumber",
      header: t("bankStatement.columns.referenceNumber"),
      size: 150,
      valueType: "text" as const,
    },
  ];

  const currentPageCredit = (data?.items || data?.data || []).reduce(
    (acc: number, row: any) => acc + (parseFloat(row.creditAmount) || 0),
    0,
  );
  const currentPageDebit = (data?.items || data?.data || []).reduce(
    (acc: number, row: any) => acc + (parseFloat(row.debitAmount) || 0),
    0,
  );
  const netValue = currentPageCredit - currentPageDebit;

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Chi phí danh mục: ${tagLabel || ""}`}
      bodyClassName="p-0 bg-background"
      panelClassName="w-[1100px] max-w-[95vw]"
    >
      <div className="p-4 h-[calc(100vh-100px)] flex flex-col">
        <div className="mb-4 flex gap-4 w-full">
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, mã CT..."
              className="w-full h-9 px-3 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <StandardTable
          items={data?.items || data?.data || []}
          columns={columns as any}
          getRowKey={(row: any) => row.id}
          loading={isLoading}
          variant="spreadsheet"
          page={page}
          pageSize={pageSize}
          total={data?.meta?.totalItems || data?.total || 0}
          onPage={setPage}
          onPageSize={setPageSize}
          summaryRow={{
            description: (
              <span className="font-semibold text-right block"></span>
            ),
            amount: (
              <span className="font-semibold">
                {netValue > 0 ? (
                  <span className="text-green-600">+{money(netValue)}</span>
                ) : netValue < 0 ? (
                  <span className="text-red-600">
                    -{money(Math.abs(netValue))}
                  </span>
                ) : (
                  money(0)
                )}
              </span>
            ),
          }}
        />
      </div>
    </DrawerModal>
  );
}
