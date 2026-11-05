import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import {
  showProcurementError,
  showProcurementSuccess,
} from "../procurement.toast";
import {
  PROCUREMENT_REASON_ACTIONS,
  type ProcurementActionKey,
} from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import {
  consumeProcurementRequestIntent,
  useProcurementIntentStore,
} from "../procurement.intent";

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

/** Trạng thái màn danh sách: drawer, hành động dòng, modal, xóa nháp và luồng tạo PO từ PR. */
export function useProcurementList<T extends { id: string }>(
  config: ProcurementListConfig<T>,
) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
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
  const pendingRequestId = useProcurementIntentStore((s) => s.pendingRequestId);

  // Mở sẵn drawer tạo PO nếu vừa được chuyển sang từ một PR
  React.useEffect(() => {
    if (!canCreate) return;
    const fromRequestId = consumeProcurementRequestIntent();
    if (fromRequestId) {
      setDrawer({ id: null, mode: "edit", fromRequestId });
    }
  }, [canCreate, pendingRequestId]);

  const onListError = React.useCallback(
    (error: unknown) =>
      showProcurementError(
        error,
        t("v2.procurement.listLoadError", "Không thể tải danh sách"),
      ),
    [t],
  );

  const transition = useMutation({
    mutationFn: (vars: {
      id: string;
      action: ProcurementActionKey;
      reason?: string;
    }) => config.api.transition(vars.id, vars.action, vars.reason),
    onSuccess: () => {
      showProcurementSuccess(
        t("v2.procurement.actionDone", "Đã cập nhật chứng từ"),
      );
      setReasonTarget(null);
      setConfirmTarget(null);
      void queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.actionError", "Không thực hiện được thao tác"),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => {
      if (!config.api.remove) throw new Error("remove not supported");
      return config.api.remove(id);
    },
    onSuccess: () => {
      showProcurementSuccess(t("v2.procurement.deleteDone", "Đã xóa đơn nháp"));
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.actionError", "Không thực hiện được thao tác"),
      ),
  });

  const start = React.useCallback((row: T, action: ProcurementActionKey) => {
    if (PROCUREMENT_REASON_ACTIONS.includes(action)) {
      setReasonTarget({ row, action });
    } else {
      setConfirmTarget({ row, action });
    }
  }, []);

  /** Đổi URL sang trang PO và báo V2 Routes đổi trang (V2 không dùng router thư viện). */
  const orderFromRequest = React.useCallback(
    (row: T) => {
      if (!config.poHref) return;
      useProcurementIntentStore.getState().setPendingRequestId(row.id);
      window.history.pushState(null, "", config.poHref);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [config.poHref],
  );

  const rowActions = React.useCallback(
    (row: T): V2RowActionGroup[] => {
      const view = {
        label: t("v2.procurement.actions.view", "Xem"),
        onClick: () => setDrawer({ id: row.id, mode: "view" }),
      };
      const edit =
        canUpdate && config.isEditable(row)
          ? [
              {
                label: t("v2.procurement.actions.edit", "Sửa"),
                onClick: () => setDrawer({ id: row.id, mode: "edit" }),
              },
            ]
          : [];
      const transitions = canUpdate
        ? config.availableActions(row).map((action) => ({
            label: t(`v2.procurement.actions.${action}`, action),
            onClick: () => start(row, action),
            variant:
              action === "cancel" || action === "reject"
                ? ("danger" as const)
                : ("default" as const),
          }))
        : [];
      const fromRequest =
        canCreate && config.poHref && config.canOrderFromRequest?.(row)
          ? [
              {
                label: t("v2.procurement.actions.createOrder", "Tạo PO từ PR"),
                onClick: () => orderFromRequest(row),
              },
            ]
          : [];
      const deletable =
        canDelete && config.api.remove && config.isEditable(row)
          ? [
              {
                label: t("v2.procurement.actions.delete", "Xóa"),
                onClick: () => setDeleteTarget(row),
                variant: "danger" as const,
              },
            ]
          : [];
      return [
        { items: [view, ...edit, ...fromRequest] },
        ...(transitions.length ? [{ items: transitions }] : []),
        ...(deletable.length ? [{ items: deletable }] : []),
      ];
    },
    [canCreate, canDelete, canUpdate, config, orderFromRequest, start, t],
  );

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
    openCreate: () => setDrawer({ id: null, mode: "edit" }),
    closeDrawer: () => setDrawer(null),
    rowActions,
    reasonTarget,
    confirmTarget,
    deleteTarget,
    isTransitioning: transition.isPending || remove.isPending,
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
