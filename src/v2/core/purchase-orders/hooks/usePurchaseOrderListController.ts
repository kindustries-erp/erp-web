import * as React from "react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import { usePurchaseOrderMutations } from "../api/mutations/usePurchaseOrderMutations";
import { buildPurchaseOrderColumns } from "../components/organisms/purchase-order-table/PurchaseOrderTable.columns";
import { buildPurchaseOrderRowActions } from "../components/organisms/purchase-order-table/PurchaseOrderTable.rowActions";
import type { PurchaseOrderRecord } from "../domain/purchaseOrder";

export interface PurchaseOrderDrawerTarget {
  id: string | null;
  mode: "view" | "edit";
}

/**
 * Trạng thái màn danh sách PO: drawer, xóa, chế độ xem, cột và thao tác dòng.
 * Module chỉ cần truyền cấu hình (`config`); không chứa logic riêng của module.
 */
export function usePurchaseOrderListController(
  config: PurchaseOrderModuleConfig,
) {
  const { t } = useV2Translation();
  const { tableId, viewVisibility } = config;
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
  const [drawer, setDrawer] = React.useState<PurchaseOrderDrawerTarget | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<PurchaseOrderRecord | null>(null);
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[tableId]?.views?.activeKey ??
      "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[tableId]?.columns) {
      applyV2SystemView(tableId, "overview", viewVisibility.overview);
    }
  }, [tableId, viewVisibility]);

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.purchaseOrders.listLoadError",
        "Không thể tải danh sách",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
    [t],
  );

  const open = React.useCallback(
    (id: string | null, mode: "view" | "edit") => setDrawer({ id, mode }),
    [],
  );

  const columns = React.useMemo(
    () => buildPurchaseOrderColumns(t, (id) => open(id, "view")),
    [t, open],
  );

  const rowActions = React.useMemo(
    () =>
      buildPurchaseOrderRowActions({
        t,
        canUpdate,
        canDelete,
        open,
        onDelete: setDeleteTarget,
      }) as (row: PurchaseOrderRecord) => V2RowActionGroup[],
    [t, canUpdate, canDelete, open],
  );

  const { remove } = usePurchaseOrderMutations({
    api: config.api,
    keys: config.keys,
    t,
    onRemoved: () => setDeleteTarget(null),
  });

  const selectView = (key: string) => {
    setView(key);
    const visibility = viewVisibility[key];
    if (visibility) {
      applyV2SystemView(tableId, key, visibility);
      setTableKey((value) => value + 1);
    }
  };

  return {
    t,
    tableId,
    tableKey,
    columns,
    rowActions,
    canCreate,
    canUpdate,
    canDelete,
    drawer,
    setDrawer,
    open,
    deleteTarget,
    setDeleteTarget,
    remove,
    view,
    selectView,
    onListError,
  };
}

export type PurchaseOrderListController = ReturnType<
  typeof usePurchaseOrderListController
>;
