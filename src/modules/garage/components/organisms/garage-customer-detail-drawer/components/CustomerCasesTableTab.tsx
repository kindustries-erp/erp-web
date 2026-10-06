import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  createColumnHeaderFilter,
} from "@/shared/components/DataTable";
import { useCustomerCasesTableColumns } from "../hooks/useCustomerCasesTableColumns";

interface CustomerCasesTableTabProps {
  cases: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  tableState: any;
  onOpenCaseDetail: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal: (c: any) => void;
  onOpenInvoiceLinkingModal: (c: any) => void;
}

export const CustomerCasesTableTab = React.memo(function CustomerCasesTableTab({
  cases,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  tableState,
  onOpenCaseDetail,
  onOpenSettlementModal,
  onOpenInvoiceLinkingModal,
}: CustomerCasesTableTabProps) {
  const { t } = useTranslation(["garage", "common"]);

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
    onOpenCaseDetail,
    onOpenSettlementModal,
    onOpenInvoiceLinkingModal,
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <DataTable
        items={cases}
        columns={columns}
        emptyLabel={t("customers.empty", "Không có dữ liệu phiếu dịch vụ")}
        total={totalCount}
        page={page}
        pageSize={pageSize}
        onPage={onPageChange}
        onPageSize={onPageSizeChange}
        containerClassName="flex-1 min-h-0 w-full"
      />
    </div>
  );
});
