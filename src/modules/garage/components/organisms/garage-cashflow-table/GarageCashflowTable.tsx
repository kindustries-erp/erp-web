import React, { useMemo, useCallback } from "react";
import { Plus, ReceiptText } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import type { GarageCashflowTableProps } from "./GarageCashflowTable.type";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";
import {
  getGarageCashflowColumns,
  getGarageCashflowRowActions,
} from "./GarageCashflowTable.columns";

export const GarageCashflowTable: React.FC<GarageCashflowTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
}) => {
  const tableHook = useGarageCashflowTable();

  const filterBuilder = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook as any,
      }),
    [tableHook],
  );

  const openDetail = useCallback(
    (row: GarageCashflowVoucher, mode: "view" | "edit") => {
      if (mode === "view" && onView) onView(row);
      if (mode === "edit" && onEdit) onEdit(row);
    },
    [onView, onEdit],
  );

  const columns = useMemo(
    () => getGarageCashflowColumns(filterBuilder, openDetail),
    [filterBuilder, openDetail],
  );

  const rowActions = useMemo(
    () => getGarageCashflowRowActions(openDetail, onDelete),
    [openDetail, onDelete],
  );

  return (
    <SpreadsheetPageTemplate
      title="Thu chi xưởng"
      desc="Quản lý Thu/Chi nội bộ tại xưởng và đối soát với dòng tiền ERP"
      icon={<ReceiptText className="w-5 h-5 text-slate-700" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId="garage-cashflow-list"
      columns={columns}
      items={tableHook.data}
      total={tableHook.total}
      totalPages={tableHook.totalPages}
      page={tableHook.page}
      pageSize={tableHook.pageSize}
      onPage={tableHook.setPage}
      onPageSize={tableHook.setPageSize}
      loading={tableHook.isLoading}
      onRefresh={tableHook.refetch}
      getRowKey={(row) => row.id}
      listHook={tableHook as any}
      activeFilterCount={tableHook.activeFilterCount}
      onClearAllFilters={tableHook.clearAllFilters}
      sortArray={tableHook.sorts}
      onSort={tableHook.setSort as any}
      rowActions={rowActions}
      onCreate={onCreate}
      createLabel="Tạo phiếu mới"
      createIcon={<Plus className="w-4 h-4 mr-1 text-primary-foreground" />}
    />
  );
};
