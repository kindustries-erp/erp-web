import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  showProcurementError,
  showProcurementSuccess,
} from "../procurement.toast";
import {
  PROCUREMENT_REASON_ACTIONS,
  type ProcurementActionKey,
} from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { useProcurementPurge } from "./useProcurementPurge";
import { useProcurementTransition } from "./useProcurementTransition";
import { useProcurementRowActions } from "./useProcurementRowActions";
import { useProcurementApprovalGate } from "./useProcurementApprovalGate";
import { useProcurementAlreadyDecided } from "./useProcurementAlreadyDecided";
import { useProcurementOrderIntent } from "./useProcurementOrderIntent";
import { useProcurementIntentStore } from "../procurement.intent";

/** Cấu hình một màn danh sách procurement: module truyền vào, core xử lý phần còn lại. */
export interface ProcurementActionTarget<T> {
  row: T;
  action: ProcurementActionKey;
}

export interface ProcurementDrawerTarget {
  id: string | null;
  mode: "view" | "edit";
  /** Tạo PO điền sẵn từ PR này */
  fromRequestId?: string | null;
}

/** Kiểu trả về của `useProcurementList`, dùng cho các component con nhận state. */
export type ProcurementListState<T extends { id: string }> = ReturnType<
  typeof useProcurementList<T>
>;

/** Trạng thái màn danh sách: drawer, modal lý do/xác nhận/xóa và luồng tạo PO từ PR. */
export function useProcurementList<T extends { id: string }>(
  config: ProcurementListConfig<T>,
) {
  const { t } = useV2Translation();
  const canCreate = useV2HasPermission({
    collection: config.permissionCollection,
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: config.permissionCollection,
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: config.permissionCollection,
    action: "delete",
  });
  const [drawer, setDrawer] = React.useState<ProcurementDrawerTarget | null>(
    null,
  );
  const [reasonTarget, setReasonTarget] =
    React.useState<ProcurementActionTarget<T> | null>(null);
  const [confirmTarget, setConfirmTarget] =
    React.useState<ProcurementActionTarget<T> | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<T | null>(null);
  const purgeState = useProcurementPurge(config);
  const approval = useProcurementApprovalGate(config);
  // Mở sẵn drawer tạo đơn mua nếu vừa được chuyển sang từ một đề nghị (chỉ danh sách đơn mua)
  const openOrderDraft = React.useCallback(
    (fromRequestId: string) =>
      setDrawer({ id: null, mode: "edit", fromRequestId }),
    [],
  );
  useProcurementOrderIntent(config, canCreate, openOrderDraft);

  const onListError = React.useCallback(
    (error: unknown) =>
      showProcurementError(
        error,
        t("v2.procurement.listLoadError", "Không thể tải danh sách"),
      ),
    [t],
  );

  const alreadyDecidedState = useProcurementAlreadyDecided();
  const { showAlreadyDecided } = alreadyDecidedState;

  const { transition, remove } = useProcurementTransition(config, {
    onTransitioned: () => {
      setReasonTarget(null);
      setConfirmTarget(null);
      approval.closeSubmit();
    },
    onRemoved: () => setDeleteTarget(null),
    onAlreadyDecided: (status) => {
      const row =
        confirmTarget?.row ??
        reasonTarget?.row ??
        approval.submitTarget ??
        null;
      setReasonTarget(null);
      setConfirmTarget(null);
      approval.closeSubmit();
      showAlreadyDecided({
        rowLabel: row ? config.rowLabel(row) : "",
        status,
      });
    },
  });

  const { requestSubmit } = approval;
  const start = React.useCallback(
    (row: T, action: ProcurementActionKey) => {
      // Gửi duyệt khi khóa bật: mở modal chọn người duyệt trước
      if (requestSubmit(row, action)) return;
      if (PROCUREMENT_REASON_ACTIONS.includes(action)) {
        setReasonTarget({ row, action });
      } else {
        setConfirmTarget({ row, action });
      }
    },
    [requestSubmit],
  );

  /** Đổi URL sang trang PO và báo V2 Routes đổi trang (V2 không dùng router thư viện). */
  const orderFromRequest = React.useCallback(
    (row: T) => {
      if (!config.poHref) return;
      // Đóng drawer đề nghị đang mở (nếu có) để chỉ còn drawer đơn mua
      setDrawer(null);
      useProcurementIntentStore.getState().setPendingRequestId(row.id);
      window.history.pushState(null, "", config.poHref);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [config.poHref],
  );

  const openDrawer = React.useCallback(
    (id: string, mode: "view" | "edit") => setDrawer({ id, mode }),
    [],
  );

  const currentUserId = useAuthStore((s) => s.profile?.id ?? null);
  const currentUserEmail = useAuthStore(
    (s) => s.profile?.email ?? s.employee?.email ?? null,
  );

  // Nhân bản phiếu đã từ chối/hủy: tạo nháp mới rồi mở ngay ở chế độ sửa
  const queryClient = useQueryClient();
  const { mutate: cloneMutate } = useMutation({
    mutationFn: (id: string) => {
      if (!config.api.clone) throw new Error("Chưa hỗ trợ nhân bản");
      return config.api.clone(id);
    },
    onSuccess: ({ id }) => {
      void queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      showProcurementSuccess(
        t("v2.procurement.drawer.cloned", "Đã nhân bản thành phiếu nháp mới"),
      );
      setDrawer({ id, mode: "edit" });
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.drawer.cloneError", "Không nhân bản được phiếu"),
      ),
  });
  const cloneRow = React.useCallback(
    (row: T) => cloneMutate(row.id),
    [cloneMutate],
  );

  const rowActions = useProcurementRowActions<T>({
    cloneRow,
    config: approval.approvalConfig,
    canCreate,
    canUpdate,
    canDelete,
    currentUserId,
    currentUserEmail,
    openDrawer,
    start,
    openDelete: (row) => setDeleteTarget(row),
    orderFromRequest,
    purgeActions: purgeState.purgeActions,
  });

  const submitReason = (reason: string) => {
    if (!reasonTarget) return;
    transition.mutate({
      id: reasonTarget.row.id,
      action: reasonTarget.action,
      reason,
    });
  };

  return {
    canCreate,
    canUpdate,
    drawer,
    openView: (id: string) => openDrawer(id, "view"),
    openCreate: () => setDrawer({ id: null, mode: "edit" }),
    /** Sau khi lưu (tạo hoặc sửa): mở lại chứng từ ở chế độ xem */
    openSaved: (id: string) => setDrawer({ id, mode: "view" }),
    closeDrawer: () => setDrawer(null),
    rowActions,
    start,
    orderFromRequest,
    approval,
    submitWithApprover: (approverId: string) => {
      if (!approval.submitTarget) return;
      transition.mutate({
        id: approval.submitTarget.id,
        action: "submit",
        approverId,
      });
    },
    reasonTarget,
    confirmTarget,
    deleteTarget,
    isTransitioning:
      transition.isPending || remove.isPending || purgeState.isPurging,
    /** Nút xóa vĩnh viễn của một dòng (chế độ xem phiếu đã xóa mềm) */
    purgeActions: purgeState.purgeActions,
    purgeTarget: purgeState.purgeTarget,
    closePurge: purgeState.closePurge,
    confirmPurge: purgeState.confirmPurge,
    alreadyDecided: alreadyDecidedState.alreadyDecided,
    showAlreadyDecided,
    closeAlreadyDecided: alreadyDecidedState.closeAlreadyDecided,
    closeReason: () => setReasonTarget(null),
    closeConfirm: () => setConfirmTarget(null),
    closeDelete: () => setDeleteTarget(null),
    submitReason,
    confirmAction: () => {
      if (!confirmTarget) return;
      transition.mutate({
        id: confirmTarget.row.id,
        action: confirmTarget.action,
      });
    },
    confirmDelete: () => {
      if (deleteTarget) remove.mutate(deleteTarget.id);
    },
    onListError,
  };
}
