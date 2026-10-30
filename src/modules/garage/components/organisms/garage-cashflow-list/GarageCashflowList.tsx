import React from "react";
import type { TabItem } from "@/shared/components/PageLayout";
import { GarageCashflowDrawer } from "../garage-cashflow-drawer/GarageCashflowDrawer";
import { GarageCashflowTable } from "../garage-cashflow-table/GarageCashflowTable";
import { GarageCashflowExportDrawer } from "../garage-cashflow-export-drawer/GarageCashflowExportDrawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useGarageCashflowList } from "./GarageCashflowList.hook";

export interface GarageCashflowListProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
  tabKey?: "vouchers" | "forecast";
}

export const GarageCashflowList: React.FC<GarageCashflowListProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCaseDetail: onOpenCaseDetailProp,
  tabKey = "vouchers",
}) => {
  const {
    selectedCaseCode,
    setSelectedCaseCode,
    drawerState,
    setDrawerState,
    deleteModal,
    setDeleteModal,
    exportState,
    setExportState,
    handleOpenExport,
    canCreate,
    canUpdate,
    canDelete,
    deleteMutation,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete,
    handleOpenCaseDetail,
    t,
  } = useGarageCashflowList({ onOpenCaseDetailProp, tabKey });

  return (
    <>
      <GarageCashflowTable
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabKey={tabKey}
        onCreate={canCreate ? handleCreate : undefined}
        onView={handleView}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        onOpenCaseDetail={handleOpenCaseDetail}
        canDelete={canDelete}
        onExportExcel={handleOpenExport}
      />

      <GarageCaseStandaloneDrawer
        isOpen={Boolean(selectedCaseCode)}
        caseCode={selectedCaseCode}
        onClose={() => setSelectedCaseCode(null)}
      />

      <GarageCashflowDrawer
        open={drawerState.open}
        onClose={() => setDrawerState((prev) => ({ ...prev, open: false }))}
        initialMode={drawerState.mode}
        voucher={drawerState.voucher}
      />

      <GarageCashflowExportDrawer
        open={exportState.open}
        onClose={() => setExportState((prev) => ({ ...prev, open: false }))}
        tableFilter={exportState.tableFilter}
        filterSummary={exportState.filterSummary}
      />

      <ConfirmModal
        open={deleteModal.open}
        title={t("garage.cashflow.modal.deleteTitle", "Xác nhận xóa phiếu")}
        message={
          deleteModal.voucher?.case ? (
            <div className="space-y-2 text-sm text-foreground">
              <p>
                {t(
                  "garage.cashflow.modal.deleteConfirm",
                  "Bạn có chắc chắn muốn xóa phiếu {{code}} không?",
                ).replace("{{code}}", deleteModal.voucher.voucherCode)}
              </p>
              <div className="bg-amber-50 text-amber-600 p-3 rounded-md border border-amber-200">
                {t(
                  "garage.cashflow.modal.deleteLinkedWarning",
                  "Phiếu này đang liên kết với Phiếu dịch vụ {{caseCode}}. Việc xóa sẽ đồng thời gỡ bỏ khoản cấn trừ trên Phiếu dịch vụ đó.",
                ).replace(
                  "{{caseCode}}",
                  deleteModal.voucher.case.soChungTu || "",
                )}
              </div>
            </div>
          ) : (
            t(
              "garage.cashflow.modal.deleteConfirm",
              "Bạn có chắc chắn muốn xóa phiếu {{code}} không?",
            ).replace("{{code}}", deleteModal.voucher?.voucherCode || "")
          )
        }
        confirmLabel={t("garage.cashflow.modal.deleteButton", "Xóa")}
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteModal.voucher) {
            deleteMutation.mutate(deleteModal.voucher.id);
          }
        }}
        onCancel={() => setDeleteModal({ open: false, voucher: null })}
      />
    </>
  );
};
