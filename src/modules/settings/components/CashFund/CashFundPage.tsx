import { useCallback, useMemo } from "react";
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { CashFundDrawer } from "@/modules/settings/components/CashFundDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  useCashFundLogic,
  type NormalizedCashBook,
} from "./hooks/useCashFundLogic";
import { useCashFundColumns } from "./components/CashFundColumns";

export function CashFundPage() {
  const {
    t,
    tableState,
    normalizedCashBooks,
    paginatedItems,
    isCashBooksLoading,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    refetch,
    drawerOpen,
    setDrawerOpen,
    editingItem,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDelete,
    handleCreate,
    handleEdit,
    pageSubtotalOpeningBalance,
    totalOpeningBalance,
  } = useCashFundLogic();

  const { columns } = useCashFundColumns({
    tableState,
    items: normalizedCashBooks,
    t,
  });

  const rowActions = useCallback(
    (a: NormalizedCashBook) => [
      {
        groupLabel: t("common.actions", "Thao tác"),
        items: [
          {
            label: t("common.edit", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => handleEdit(a),
          },
          {
            label: t("common.delete", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: "danger" as const,
            onClick: () => setDeleteTarget(a),
          },
        ],
      },
    ],
    [t, handleEdit, setDeleteTarget],
  );

  const summaryRow = useMemo(
    () => ({
      name: (
        <span className="font-semibold text-xs text-foreground">
          {t("common.total", "Tổng")}
        </span>
      ),
      openingBalance: (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={pageSubtotalOpeningBalance}
          cumulativeAmount={totalOpeningBalance}
          grandTotalAmount={totalOpeningBalance}
          page={page}
          totalPages={totalPages}
          totalCount={total}
          currentPageCount={paginatedItems.length}
        />
      ),
    }),
    [pageSubtotalOpeningBalance, totalOpeningBalance, t],
  );

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("thietlap.tabs.quy", "Sổ quỹ tiền mặt")}
        desc={t("thietlap.desc", "Quản lý danh sách sổ quỹ tiền mặt")}
        icon={<Wallet className="h-4 w-4" />}
        tableId="settings-cash-funds-table"
        items={paginatedItems}
        columns={columns}
        getRowKey={(a) => a.id}
        loading={isCashBooksLoading}
        emptyLabel={t("common.noData", "Chưa có dữ liệu.")}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={(p) => setPage(p)}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        activeFilterCount={tableState.activeFilterCount}
        onClearAllFilters={tableState.resetFilters}
        summaryRow={summaryRow}
        createActions={[
          {
            label: t("panel.createNew", "Tạo mới"),
            icon: <Plus className="w-4 h-4 text-emerald-600" />,
            onClick: handleCreate,
          },
        ]}
        onRefresh={() => refetch()}
        rowActions={rowActions}
      />

      <CashFundDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cashBook={editingItem}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete", "Xóa sổ quỹ")}
        message={`${t("settings.confirmDeleteCashFund", "Bạn có chắc chắn muốn xóa sổ quỹ")} ${deleteTarget?.name}?`}
        loading={deleting}
      />
    </>
  );
}
