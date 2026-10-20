import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { BarChart } from "@/shared/components/charts/BarChart";
import { StandardTable } from "@/shared/components/StandardTable";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { useT } from "@/core/i18n";
import { money } from "@/shared/utils/format";
import { Users } from "lucide-react";
import { usePartnerTransactionsLogic } from "./hooks/usePartnerTransactionsLogic";
import { usePartnerTransactionsColumns } from "./components/PartnerTransactionsColumns";

export interface PartnerTransactionsDrawerProps {
  open: boolean;
  onClose: () => void;
  correspondentAccount?: string;
  correspondentName?: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalBranchId?: string;
}

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

  const {
    tableState,
    page,
    pageSize,
    setPage,
    setPageSize,
    detailTransactionId,
    setDetailTransactionId,
    chartData,
    isChartLoading,
    isTableFetching,
    items,
    total,
    totalPages,
    fetchColumnOptions,
    summaryRow,
    cashTrendLabels,
    cashTrendIn,
    cashTrendOut,
  } = usePartnerTransactionsLogic({
    open,
    correspondentAccount,
    correspondentName,
    globalStartDate,
    globalEndDate,
    globalBranchId,
    t,
  });

  const { columns } = usePartnerTransactionsColumns({
    tableState,
    items,
    fetchColumnOptions,
    setDetailTransactionId,
    t,
  });

  const partnerDisplayName =
    correspondentName || correspondentAccount || t("common.other", "Khác");

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="view"
        layout="1-column"
        size="xl"
        icon={<Users className="w-5 h-5 text-emerald-600" />}
        title={`${t("cashflow.partnerTransactions", "Giao dịch đối tác")}: ${partnerDisplayName}`}
        subtitle={t(
          "cashflow.partnerTransactionsDesc",
          "Chi tiết dòng tiền và danh sách giao dịch phát sinh",
        )}
        leftPanel={
          <div className="space-y-6">
            <DrawerSection
              title={t("cashflow.monthlyTrend", "Dòng tiền qua từng tháng")}
            >
              <div className="bg-card border rounded-xl p-4 shadow-sm">
                <div className="h-[250px]">
                  {isChartLoading ? (
                    <ChartSkeleton type="bar" />
                  ) : chartData?.cashTrend?.length ? (
                    <BarChart
                      labels={cashTrendLabels}
                      yCallback={(v) => money(Number(v))}
                      datasets={[
                        {
                          label: t("bankStatement.columns.thu", "Tổng thu"),
                          data: cashTrendIn,
                          color: "#059669",
                        },
                        {
                          label: t("bankStatement.columns.chi", "Tổng chi"),
                          data: cashTrendOut,
                          color: "#ea580c",
                        },
                      ]}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      {t("common.noData", "Không có dữ liệu")}
                    </div>
                  )}
                </div>
              </div>
            </DrawerSection>

            <DrawerSection
              title={t("cashflow.transactionsList", "Danh sách Giao dịch")}
            >
              <StandardTable
                tableId="partner-transactions-table-v1"
                items={items}
                columns={columns}
                getRowKey={(row: any) => row.id}
                loading={isTableFetching}
                variant="spreadsheet"
                minWidth={1000}
                enableColumnResizing={true}
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPage={setPage}
                onPageSize={setPageSize}
                sortArray={tableState.sorts}
                onSort={(colKey) => {
                  const currentSort = tableState.sorts[0];
                  const nextState =
                    currentSort === colKey
                      ? "desc"
                      : currentSort === `-${colKey}`
                        ? "none"
                        : "asc";
                  tableState.setSort(colKey, nextState);
                  setPage(1);
                }}
                summaryRow={summaryRow}
              />
            </DrawerSection>
          </div>
        }
      />

      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />
    </>
  );
}
