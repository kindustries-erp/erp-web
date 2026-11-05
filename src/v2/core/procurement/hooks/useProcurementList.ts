import * as React from "react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { showProcurementError } from "../procurement.toast";
import {
  PROCUREMENT_REASON_ACTIONS,
  type ProcurementActionKey,
} from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { useProcurementPurge } from "./useProcurementPurge";
import { useProcurementTransition } from "./useProcurementTransition";
import { useProcurementRowActions } from "./useProcurementRowActions";
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

  const { transition, remove } = useProcurementTransition(config, {
    onTransitioned: () => {
      setReasonTarget(null);
      setConfirmTarget(null);
    },
    onRemoved: () => setDeleteTarget(null),
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

  const openDrawer = React.useCallback(
    (id: string, mode: "view" | "edit") => setDrawer({ id, mode }),
    [],
  );

  const rowActions = useProcurementRowActions<T>({
    config,
    canCreate,
    canUpdate,
    canDelete,
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
    closeDrawer: () => setDrawer(null),
    rowActions,
    start,
    orderFromRequest,
    reasonTarget,
    confirmTarget,
    deleteTarget,
    isTransitioning:
      transition.isPending || remove.isPending || purgeState.isPurging,
    purgeTarget: purgeState.purgeTarget,
    closePurge: purgeState.closePurge,
    confirmPurge: purgeState.confirmPurge,
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
