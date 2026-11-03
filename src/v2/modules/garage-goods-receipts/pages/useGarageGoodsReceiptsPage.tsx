import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useRemoveGarageGoodsReceiptMutation } from "@/v2/modules/garage-goods-receipts/api/mutations/useGarageGoodsReceiptMutations";
import { buildGarageGoodsReceiptsColumns } from "@/v2/modules/garage-goods-receipts/components/organisms/garage-goods-receipt-table/GarageGoodsReceiptTable.columns";
import { garageGoodsReceiptsViewVisibility } from "@/v2/modules/garage-goods-receipts/components/organisms/garage-goods-receipt-table/GarageGoodsReceiptTable.views";
import type { GarageGoodsReceipt } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";

const TABLE_ID = "erp-garage-goods-receipts-table";

export function useGarageGoodsReceiptsPage() {
  const { t } = useV2Translation();
  const canCreate = useV2HasPermission({
    collection: "garage_goods_receipts",
    action: "create",
  });
  const canUpdate = useV2HasPermission({
    collection: "garage_goods_receipts",
    action: "update",
  });
  const canDelete = useV2HasPermission({
    collection: "garage_goods_receipts",
    action: "delete",
  });
  const [drawer, setDrawer] = React.useState<{
    id: string | null;
    mode: "view" | "edit";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<GarageGoodsReceipt | null>(null);
  const [view, setView] = React.useState(
    () =>
      useV2TablePreferencesStore.getState().tables[TABLE_ID]?.views
        ?.activeKey ?? "overview",
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    if (!useV2TablePreferencesStore.getState().tables[TABLE_ID]?.columns) {
      applyV2SystemView(
        TABLE_ID,
        "overview",
        garageGoodsReceiptsViewVisibility.overview,
      );
    }
  }, []);

  const onListError = React.useCallback(
    (error: unknown) => {
      const fallback = t(
        "v2.garageGoodsReceipts.listLoadError",
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
    () => buildGarageGoodsReceiptsColumns(t, (id) => open(id, "view")),
    [t, open],
  );
  const rowActions = React.useCallback(
    (row: GarageGoodsReceipt): V2RowActionGroup[] => {
      const items: V2RowActionGroup["items"] = [
        {
          label: t("v2.garageGoodsReceipts.actions.view", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "view"),
        },
      ];
      if (canUpdate)
        items.push({
          label: t("v2.garageGoodsReceipts.actions.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "edit"),
        });
      if (canDelete)
        items.push({
          label: t("v2.garageGoodsReceipts.actions.delete", "Xóa"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: () => setDeleteTarget(row),
        });
      return [{ items }];
    },
    [canDelete, canUpdate, open, t],
  );

  const remove = useRemoveGarageGoodsReceiptMutation(t, () =>
    setDeleteTarget(null),
  );

  const selectView = (key: string) => {
    setView(key);
    const visibility =
      garageGoodsReceiptsViewVisibility[
        key as keyof typeof garageGoodsReceiptsViewVisibility
      ];
    if (visibility) {
      applyV2SystemView(TABLE_ID, key, visibility);
      setTableKey((value) => value + 1);
    }
  };

  return {
    t,
    tableId: TABLE_ID,
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

export type GarageGoodsReceiptsPageState = ReturnType<
  typeof useGarageGoodsReceiptsPage
>;
