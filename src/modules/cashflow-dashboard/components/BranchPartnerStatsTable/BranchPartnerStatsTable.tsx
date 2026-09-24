import { useMemo } from "react";
import { StandardTable } from "@/shared/components/StandardTable";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { useT } from "@/core/i18n";
import { useBranchPartnerStatsLogic } from "./hooks/useBranchPartnerStatsLogic";
import { useBranchPartnerStatsColumns } from "./components/BranchPartnerStatsColumns";

export interface BranchPartnerStatsTableProps {
  branchId?: string;
  branchName: string;
  filterState: any;
  onPartnerClick: (account?: string, name?: string) => void;
}

export function BranchPartnerStatsTable({
  branchId,
  branchName,
  filterState,
  onPartnerClick,
}: BranchPartnerStatsTableProps) {
  const t = useT();

  const {
    tableId,
    tableState,
    page,
    pageSize,
    setPage,
    setPageSize,
    isPartnerFetching,
    items,
    total,
    totalPages,
    fetchPartnerOptions,
    topTransactionsInTotal,
    topTransactionsOutTotal,
    grandTotalCredit,
    grandTotalDebit,
  } = useBranchPartnerStatsLogic({ branchId, filterState });

  const { columns } = useBranchPartnerStatsColumns({
    tableState,
    items,
    fetchPartnerOptions,
    onPartnerClick,
    t,
  });

  const summaryRow = useMemo(
    () => ({
      correspondentName: (
        <span className="font-semibold text-xs text-foreground">
          {t("common.total", "Tổng")}:
        </span>
      ),
      totalCredit: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("bankStatement.columns.thu", "Tiền vào (Thu)")}
          subtotalAmount={topTransactionsInTotal}
          cumulativeAmount={grandTotalCredit}
          grandTotalAmount={grandTotalCredit}
          page={page}
          totalPages={totalPages}
          valueClassName="text-emerald-600 font-bold"
        />
      ),
      totalDebit: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("bankStatement.columns.chi", "Tiền ra (Chi)")}
          subtotalAmount={topTransactionsOutTotal}
          cumulativeAmount={grandTotalDebit}
          grandTotalAmount={grandTotalDebit}
          page={page}
          totalPages={totalPages}
          valueClassName="text-[#ea580c] font-bold"
        />
      ),
    }),
    [
      topTransactionsInTotal,
      topTransactionsOutTotal,
      grandTotalCredit,
      grandTotalDebit,
      page,
      totalPages,
      t,
    ],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {branchName}
        </h4>
        <span className="text-xs text-muted-foreground">
          {t("common.total", "Tổng")}: {total}{" "}
          {t("cashflow.partnersUnit", "đối tác")}
        </span>
      </div>

      <StandardTable
        tableId={tableId}
        items={items}
        columns={columns}
        getRowKey={(row: any) =>
          `${row.correspondentAccount || ""}_${row.correspondentName || ""}`
        }
        loading={isPartnerFetching}
        emptyLabel={t("common.noData", "Chưa có dữ liệu.")}
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
    </div>
  );
}
