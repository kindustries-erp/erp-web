import * as React from "react";
import { FileText } from "lucide-react";
import { V2Button, V2ConfirmModal, V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  useGoodsReceiptsQuery,
  GoodsReceiptDrawer,
} from "@/v2/core/goods-receipts";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import type { GarageGoodsReceipt } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { garageGoodsReceiptsConfig } from "@/v2/modules/garage-goods-receipts/garageGoodsReceipts.config";
import { useGarageGoodsReceiptsPage } from "./GarageGoodsReceiptsPage.hook";
import "../garageGoodsReceipts.locale";

export function GarageGoodsReceiptsPage() {
  const state = useGarageGoodsReceiptsPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<GarageGoodsReceipt>[]>(
    () => [
      {
        key: "list",
        label: t("v2.goodsReceipts.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            garageGoodsReceiptsConfig.api.options(params),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.goodsReceipts.empty", "Không có dữ liệu"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.goodsReceipts.views.overview", "Tổng quan"),
                },
                {
                  key: "all",
                  label: t("v2.goodsReceipts.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          useGoodsReceiptsQuery({
            api: garageGoodsReceiptsConfig.api,
            keys: garageGoodsReceiptsConfig.keys,
            query,
            onError: state.onListError,
          }),
      },
    ],
    [state],
  );

  return (
    <V2ModulePage<GarageGoodsReceipt>
      title={t("v2.garageGoodsReceipts.title", "Nhập kho Garage")}
      description={t(
        "v2.garageGoodsReceipts.description",
        "Quản lý Nhập kho Garage",
      )}
      icon={<FileText className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button size="sm" onClick={() => state.open(null, "edit")}>
            {t("v2.garageGoodsReceipts.create", "Thêm Nhập kho Garage")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <GoodsReceiptDrawer
              key={`${state.drawer.id ?? "new"}-${state.drawer.mode}`}
              config={garageGoodsReceiptsConfig}
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.goodsReceipts.delete.title", "Xác nhận xóa")}
            message={
              state.deleteTarget
                ? `${t("v2.goodsReceipts.delete.message", "Bạn có chắc muốn xóa?")} ${state.deleteTarget.receiptNo}`
                : ""
            }
            confirmLabel={t("v2.goodsReceipts.actions.delete", "Xóa")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.remove.isPending}
            onConfirm={() => {
              if (state.deleteTarget)
                state.remove.mutate(state.deleteTarget.id);
            }}
            onCancel={() => state.setDeleteTarget(null)}
            onOpenChange={(open) => !open && state.setDeleteTarget(null)}
          />
        </>
      }
    />
  );
}
