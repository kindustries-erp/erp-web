import React, { useState, useCallback } from "react";
import type { TabItem } from "@/shared/components/PageLayout";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { GarageCashflowDrawer } from "../garage-cashflow-drawer/GarageCashflowDrawer";
import { GarageCashflowTable } from "../garage-cashflow-table/GarageCashflowTable";
import { GarageCashflowExportDrawer } from "../garage-cashflow-export-drawer/GarageCashflowExportDrawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { garageCashflowApi } from "../../../api/garageCashflowApi";
import { toast } from "react-hot-toast";

export interface GarageCashflowListProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
}

export const GarageCashflowList: React.FC<GarageCashflowListProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCaseDetail: onOpenCaseDetailProp,
}) => {
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    mode: "view" | "edit" | "create";
    voucher: GarageCashflowVoucher | null;
  }>({
    open: false,
    mode: "view",
    voucher: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    voucher: GarageCashflowVoucher | null;
  }>({
    open: false,
    voucher: null,
  });

  const [exportState, setExportState] = useState<{
    open: boolean;
    tableFilter?: any;
    filterSummary?: any;
  }>({
    open: false,
  });

  const handleOpenExport = useCallback((filterState: any) => {
    setExportState({
      open: true,
      tableFilter: filterState,
      filterSummary: {
        filterCount: filterState?.activeFilterCount || 0,
        columnFilters: filterState?.serverFilters,
      },
    });
  }, []);

  const canCreate = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.CREATE,
  );
  const canUpdate = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.UPDATE,
  );
  const canDelete = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.DELETE,
  );
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: garageCashflowApi.delete,
    onSuccess: () => {
      toast.success("Xóa phiếu thu/chi thành công");
      queryClient.invalidateQueries({ queryKey: ["garage-cashflow-list"] });
      setDeleteModal({ open: false, voucher: null });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || err.message || "Xóa phiếu thất bại",
      );
      setDeleteModal({ open: false, voucher: null });
    },
  });

  const handleCreate = useCallback(() => {
    setDrawerState({ open: true, mode: "create", voucher: null });
  }, []);

  const handleView = useCallback((row: GarageCashflowVoucher) => {
    setDrawerState({ open: true, mode: "view", voucher: row });
  }, []);

  const handleEdit = useCallback((row: GarageCashflowVoucher) => {
    setDrawerState({ open: true, mode: "edit", voucher: row });
  }, []);

  const handleDelete = useCallback((row: GarageCashflowVoucher) => {
    setDeleteModal({ open: true, voucher: row });
  }, []);

  const handleOpenCaseDetail = useCallback(
    (caseCode: string) => {
      if (onOpenCaseDetailProp) {
        onOpenCaseDetailProp(caseCode);
      } else {
        setSelectedCaseCode(caseCode);
      }
    },
    [onOpenCaseDetailProp],
  );

  return (
    <>
      <GarageCashflowTable
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
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
        title="Xác nhận xóa phiếu"
        message={
          deleteModal.voucher?.case ? (
            <div className="space-y-2 text-sm text-foreground">
              <p>
                Bạn có chắc chắn muốn xóa phiếu{" "}
                <strong>{deleteModal.voucher.voucherCode}</strong> không?
              </p>
              <div className="bg-amber-50 text-amber-600 p-3 rounded-md border border-amber-200">
                Phiếu này đang liên kết với Phiếu dịch vụ{" "}
                <strong>{deleteModal.voucher.case.soChungTu}</strong>. Việc xóa
                sẽ đồng thời gỡ bỏ khoản cấn trừ trên Phiếu dịch vụ đó.
              </div>
            </div>
          ) : (
            `Bạn có chắc chắn muốn xóa phiếu ${deleteModal.voucher?.voucherCode} không?`
          )
        }
        confirmLabel="Xóa"
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
