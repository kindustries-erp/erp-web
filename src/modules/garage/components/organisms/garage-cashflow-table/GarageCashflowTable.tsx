import React, { useMemo, useCallback } from "react";
import { Plus, ReceiptText, FileSpreadsheet } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import type { GarageCashflowTableProps } from "./GarageCashflowTable.type";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";
import { useT } from "@/core/i18n";
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
  onOpenCaseDetail,
  canDelete = true,
  onExportExcel,
}) => {
  const t = useT();
  const tableHook = useGarageCashflowTable();

  const filterBuilder = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook as any,
        fetchOptions: tableHook.getColumnOptions,
        queryKeyPrefix: "garage-cashflow-options",
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
    () =>
      getGarageCashflowColumns(
        filterBuilder,
        openDetail,
        onOpenCaseDetail,
        tableHook,
      ),
    [filterBuilder, openDetail, onOpenCaseDetail, tableHook],
  );

  const rowActions = useMemo(
    () =>
      getGarageCashflowRowActions(
        openDetail,
        canDelete ? onDelete : undefined,
        Boolean(onEdit),
        canDelete,
      ),
    [openDetail, onDelete, onEdit, canDelete],
  );

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("groupThaoTac", { defaultValue: "Thao tác" }),
        items: [
          {
            label: t("garage.cashflow.exportExcel", {
              defaultValue: "Xuất Excel",
            }),
            icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
            onClick: () => {
              if (onExportExcel) {
                onExportExcel({
                  column_filters: Object.keys(tableHook.serverFilters).length
                    ? JSON.stringify(tableHook.serverFilters)
                    : undefined,
                  column_search: Object.keys(tableHook.columnSearch).length
                    ? JSON.stringify(tableHook.columnSearch)
                    : undefined,
                  sorts: tableHook.sorts,
                  activeFilterCount: tableHook.activeFilterCount,
                  serverFilters: tableHook.serverFilters,
                });
              }
            },
          },
        ],
      },
    ],
    [onExportExcel, tableHook, t],
  );

  return (
    <SpreadsheetPageTemplate
      title={t("nav.items.garageCashflow", "Thu chi garage")}
      desc={t(
        "garage.cashflow.desc",
        "Quản lý Thu/Chi nội bộ tại xưởng và đối soát với dòng tiền ERP",
      )}
      icon={<ReceiptText className="w-5 h-5 text-slate-700" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId="garage-cashflow-list"
      columns={columns}
      defaultColumnVisibility={{ createdAt: false }}
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
      sortArray={tableHook.sorts.length > 0 ? tableHook.sorts : undefined}
      onSort={tableHook.toggleSort}
      rowActions={rowActions}
      onCreate={onCreate}
      createLabel="Tạo phiếu mới"
      createIcon={<Plus className="w-4 h-4 mr-1 text-primary-foreground" />}
      createActions={createActions}
    />
  );
};
