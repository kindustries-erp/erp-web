import * as React from "react";
import { LoanItem } from "@/v2/core/loans";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { V2FetchOptions } from "@/v2/shared/types/v2-table";
import { loansApi } from "../../api";
import { buildLoanColumns } from "../../components/organisms/loan-table";
import { buildLoanRowActions } from "./LoansListPage.actions";
import { useLoansDeleteModals } from "./LoansListPage.delete.hook";
import {
  useLoansActiveTab,
  useLoansListFilterAndView,
} from "./LoansListPage.filter.hook";
import { LoansTabKey } from "./loansList.enum";

export function useLoansListPage() {
  const { t } = useV2Translation();
  const showToast = useV2ToastStore((s) => s.showToast);
  const [activeTab, setActiveTab] = useLoansActiveTab(LoansTabKey.SIMULATOR);
  const filterView = useLoansListFilterAndView(t);
  const deleteModals = useLoansDeleteModals(t);

  const canCreate = useV2HasPermission({
    collection: "loans",
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: "loans",
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: "loans",
    action: "delete",
  });
  const canPurge = useV2HasPermission({ collection: "loans", action: "purge" });

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState<LoanItem | null>(null);
  const [detailLoanId, setDetailLoanId] = React.useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [paymentModalLoan, setPaymentModalLoan] =
    React.useState<LoanItem | null>(null);

  const onListError = React.useCallback(
    (error: unknown) => {
      showToast({
        title: extractV2ApiError(
          error,
          t("v2.loans.listLoadError", "Không thể tải danh sách khoản vay"),
        ),
        variant: "destructive",
      });
    },
    [showToast, t],
  );

  const handleOpenDetail = React.useCallback((id: string) => {
    setDetailLoanId(id);
    setIsDetailOpen(true);
  }, []);

  const handleEdit = React.useCallback((loan: LoanItem) => {
    setEditingLoan(loan);
    setIsFormOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      buildLoanColumns(t, filterView.isDeleted ? undefined : handleOpenDetail),
    [filterView.isDeleted, handleOpenDetail, t],
  );

  const rowActions = React.useMemo(
    () =>
      buildLoanRowActions({
        t,
        isDeleted: filterView.isDeleted,
        canUpdate,
        canDelete,
        canPurge,
        onRecordPayment: setPaymentModalLoan,
        onViewDetail: handleOpenDetail,
        onEdit: handleEdit,
        onDelete: deleteModals.setDeleteTarget,
        onPurge: deleteModals.setPurgeTarget,
      }),
    [
      canDelete,
      canPurge,
      canUpdate,
      deleteModals.setDeleteTarget,
      deleteModals.setPurgeTarget,
      filterView.isDeleted,
      handleEdit,
      handleOpenDetail,
      t,
    ],
  );

  const fetchOptions = React.useMemo<V2FetchOptions>(
    () => (params) =>
      loansApi.options({
        ...params,
        deleted: filterView.isDeleted ? "only" : undefined,
      }),
    [filterView.isDeleted],
  );

  return {
    activeTab,
    setActiveTab,
    canCreate,
    filterView,
    columns,
    rowActions,
    fetchOptions,
    onListError,
    isFormOpen,
    editingLoan,
    detailLoanId,
    isDetailOpen,
    paymentModalLoan,
    ...deleteModals,
    handleCreate: () => {
      setEditingLoan(null);
      setIsFormOpen(true);
    },
    handleEdit,
    handleCloseDetail: () => {
      setIsDetailOpen(false);
      setDetailLoanId(null);
    },
    handleCloseForm: () => {
      setIsFormOpen(false);
      setEditingLoan(null);
    },
    handleClosePaymentModal: () => setPaymentModalLoan(null),
  };
}
