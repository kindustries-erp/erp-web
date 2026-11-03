import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useT } from "@/core/i18n";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import {
  garageCashflowApi,
  type GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

export interface UseGarageCashflowListOptions {
  onOpenCaseDetailProp?: (caseCode: string) => void;
  tabKey?: "vouchers" | "forecast";
}

export function useGarageCashflowList({
  onOpenCaseDetailProp,
}: UseGarageCashflowListOptions = {}) {
  const t = useT();
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
      toast.success(
        t(
          "garage.cashflow.toast.deleteSuccess",
          "Xóa phiếu thu/chi thành công",
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["garage-cashflow-list"] });
      queryClient.invalidateQueries({
        queryKey: ["garage-cashflow-forecast-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-cashflow-dashboard"],
      });
      setDeleteModal({ open: false, voucher: null });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          t("garage.cashflow.toast.deleteFailed", "Xóa phiếu thất bại"),
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

  return {
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
  };
}
