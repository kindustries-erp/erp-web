import * as React from "react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type {
  GoodsReceiptModuleConfig,
  GoodsReceiptPrefill,
} from "../goodsReceipts.config.type";
import { describeSourceOrderError } from "./goodsReceiptSourceOrderError";
import { useGoodsReceiptMutations } from "../api/mutations/useGoodsReceiptMutations";
import { buildGoodsReceiptColumns } from "../components/organisms/goods-receipt-table/GoodsReceiptTable.columns";
import { buildGoodsReceiptRowActions } from "../components/organisms/goods-receipt-table/GoodsReceiptTable.rowActions";
import type { GoodsReceiptRecord } from "../domain/goodsReceipt";

export { FROM_ORDER_CODES } from "./goodsReceiptSourceOrderError";

export interface GoodsReceiptDrawerTarget {
  id: string | null;
  mode: "view" | "edit";
  /** Dữ liệu điền sẵn khi lập phiếu mới từ đơn mua */
  prefill?: GoodsReceiptPrefill;
}

/**
 * Trạng thái màn danh sách của một họ phiếu: drawer, xóa, chế độ xem, cột và thao tác dòng.
 * Module chỉ cần truyền cấu hình (`config`); không chứa logic riêng của module.
 */
export function useGoodsReceiptListController(
  config: GoodsReceiptModuleConfig,
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
  const [drawer, setDrawer] = React.useState<GoodsReceiptDrawerTarget | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<GoodsReceiptRecord | null>(null);
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
        "v2.goodsReceipts.listLoadError",
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
    () => buildGoodsReceiptColumns(t, (id) => open(id, "view")),
    [t, open],
  );

  const rowActions = React.useMemo(
    () =>
      buildGoodsReceiptRowActions({
        t,
        canUpdate,
        canDelete,
        open,
        onDelete: setDeleteTarget,
      }) as (row: GoodsReceiptRecord) => V2RowActionGroup[],
    [t, canUpdate, canDelete, open],
  );

  const { remove } = useGoodsReceiptMutations({
    api: config.api,
    keys: config.keys,
    t,
    onRemoved: () => setDeleteTarget(null),
  });

  // Mở từ đơn mua: `?fromOrder=<id>` tải đơn rồi mở drawer tạo mới điền sẵn; xóa tham số để F5 không lập lại
  React.useEffect(() => {
    const loader = config.sourceOrder;
    if (!canCreate || !loader) return;
    const orderId = new URLSearchParams(window.location.search).get(
      "fromOrder",
    );
    if (!orderId) return;
    window.history.replaceState(null, "", window.location.pathname);
    loader
      .load(orderId)
      .then((prefill) => setDrawer({ id: null, mode: "edit", prefill }))
      .catch((error: unknown) => {
        useV2ToastStore.getState().showToast({
          variant: "destructive",
          ...describeSourceOrderError(error, t),
        });
      });
  }, [canCreate, config, t]);

  // Mở một phiếu có sẵn từ lịch sử nhập kho của đơn mua: `?receipt=<id>` mở drawer xem; xóa tham số để F5 không mở lại
  React.useEffect(() => {
    const receiptId = new URLSearchParams(window.location.search).get(
      "receipt",
    );
    if (!receiptId) return;
    window.history.replaceState(null, "", window.location.pathname);
    setDrawer({ id: receiptId, mode: "view" });
  }, []);

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

export type GoodsReceiptListController = ReturnType<
  typeof useGoodsReceiptListController
>;
