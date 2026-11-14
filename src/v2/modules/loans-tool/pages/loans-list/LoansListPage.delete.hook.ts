import * as React from "react";
import { LoanItem } from "@/v2/core/loans";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useDeleteLoanMutation, usePurgeLoanMutation } from "../../api";

type Translate = (key: string, fallback?: string) => string;

/** State & handler cho modal xác nhận Xóa mềm và Xóa vĩnh viễn khoản vay. */
export function useLoansDeleteModals(t: Translate) {
  const showToast = useV2ToastStore((s) => s.showToast);
  const [deleteTarget, setDeleteTarget] = React.useState<LoanItem | null>(null);
  const [purgeTarget, setPurgeTarget] = React.useState<LoanItem | null>(null);

  const deleteMutation = useDeleteLoanMutation();
  const purgeMutation = usePurgeLoanMutation();

  const confirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      showToast({
        title: t("v2.loans.delete.success", "Đã xóa khoản vay"),
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: extractV2ApiError(
          error,
          t("v2.loans.delete.error", "Không thể xóa khoản vay"),
        ),
        variant: "destructive",
      });
    }
  }, [deleteMutation, deleteTarget, showToast, t]);

  const confirmPurge = React.useCallback(async () => {
    if (!purgeTarget) return;
    try {
      await purgeMutation.mutateAsync(purgeTarget.id);
      setPurgeTarget(null);
      showToast({
        title: t("v2.loans.purge.success", "Đã xóa vĩnh viễn khoản vay"),
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: extractV2ApiError(
          error,
          t("v2.loans.purge.error", "Không thể xóa vĩnh viễn khoản vay"),
        ),
        variant: "destructive",
      });
    }
  }, [purgeMutation, purgeTarget, showToast, t]);

  return {
    deleteTarget,
    purgeTarget,
    setDeleteTarget,
    setPurgeTarget,
    isDeleting: deleteMutation.isPending,
    isPurging: purgeMutation.isPending,
    closeDelete: () => setDeleteTarget(null),
    closePurge: () => setPurgeTarget(null),
    confirmDelete,
    confirmPurge,
  };
}
