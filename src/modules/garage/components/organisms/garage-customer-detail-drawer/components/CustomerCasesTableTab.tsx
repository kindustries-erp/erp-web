import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { createColumnHeaderFilter } from "@/shared/components/DataTable";
import { StandardTable } from "@/shared/components/StandardTable";
import { useCustomerCasesTableColumns } from "../hooks/useCustomerCasesTableColumns";
import { useCustomerCasesSummaryRow } from "../hooks/useCustomerCasesSummaryRow";
import { buildCustomerCaseRowActions } from "../helpers/customerCaseActions.helper";
import type { CustomerDebtTotals } from "../types";

interface CustomerCasesTableTabProps {
  cases: any[];
  totalCount: number;
  totals: CustomerDebtTotals;
  page: number;
  pageSize: number;
  debtType?: "receivables" | "payables";
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  tableState: any;
  onOpenCaseDetail: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal: (c: any) => void;
  onOpenInvoiceLinkingModal: (c: any) => void;
  onSyncFromKgara?: (caseId: string) => void;
}

export const CustomerCasesTableTab = React.memo(function CustomerCasesTableTab({
  cases,
  totalCount,
  totals,
  page,
  pageSize,
  debtType = "receivables",
  onPageChange,
  onPageSizeChange,
  tableState,
  onOpenCaseDetail,
  onOpenSettlementModal,
  onOpenInvoiceLinkingModal,
  onSyncFromKgara,
}: CustomerCasesTableTabProps) {
  const { t } = useTranslation(["garage", "debts", "common"]);

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: cases,
        defaultAlign: "center",
      }),
    [tableState, cases],
  );

  const columns = useCustomerCasesTableColumns({
    headerFilter,
    page,
    pageSize,
    debtType,
    onOpenCaseDetail,
  });

  const summaryRow = useCustomerCasesSummaryRow({
    cases,
    totals,
    page,
    pageSize,
    totalCount,
    debtType,
    t,
  });

  const getRowActions = useCallback(
    (row: any) =>
      buildCustomerCaseRowActions(
        row,
        {
          onOpenCaseDetail,
          onOpenSettlementModal,
          onOpenInvoiceLinkingModal,
          onSyncFromKgara,
        },
        t,
        debtType,
      ),
    [
      debtType,
      onOpenCaseDetail,
      onOpenInvoiceLinkingModal,
      onOpenSettlementModal,
      onSyncFromKgara,
      t,
    ],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <StandardTable
        items={cases}
        columns={columns}
        getRowKey={(item) => item.id || item.soPhieu || item.caseNumber || ""}
        emptyLabel={t("customers.empty", "Không có dữ liệu phiếu dịch vụ")}
        total={totalCount}
        page={page}
        pageSize={pageSize}
        onPage={onPageChange}
        onPageSize={onPageSizeChange}
        variant="spreadsheet"
        actions={getRowActions}
        summaryRow={summaryRow}
        hideLegacyActionColumn={true}
        enableRowHoverActions={true}
        enableRowContextMenu={true}
        containerClassName="flex-1 min-h-0 w-full"
      />
    </div>
  );
});
