import * as React from "react";
import { FileText } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2ModulePage } from "@/v2/shared/components/templates/v2-module-page";
import type { V2ModuleTab } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useGarageGoodsReceiptsQuery } from "@/v2/modules/garage-goods-receipts/api/queries/useGarageGoodsReceiptsQuery";
import { GarageGoodsReceiptDrawer } from "@/v2/modules/garage-goods-receipts/drawers/GarageGoodsReceiptDrawer";
import type { GarageGoodsReceipt } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { useGarageGoodsReceiptsPage } from "./useGarageGoodsReceiptsPage";
import "../garageGoodsReceipts.locale";

export function GarageGoodsReceiptsPage() {
  const state = useGarageGoodsReceiptsPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<GarageGoodsReceipt>[]>(
    () => [
      {
        key: "list",
        label: t("v2.garageGoodsReceipts.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            import("../api/garageGoodsReceiptsApi").then(
              ({ garageGoodsReceiptsV2Api }) =>
                garageGoodsReceiptsV2Api.options(params),
            ),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.garageGoodsReceipts.empty", "Không có dữ liệu"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t(
                    "v2.garageGoodsReceipts.views.overview",
                    "Tổng quan",
                  ),
                },
                {
                  key: "all",
                  label: t("v2.garageGoodsReceipts.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          useGarageGoodsReceiptsQuery(query, state.onListError),
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
            <GarageGoodsReceiptDrawer
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.garageGoodsReceipts.delete.title", "Xác nhận xóa")}
            message={
              state.deleteTarget
                ? `${t("v2.garageGoodsReceipts.delete.message", "Bạn có chắc muốn xóa?")} ${state.deleteTarget.receiptNo}`
                : ""
            }
            confirmLabel={t("v2.garageGoodsReceipts.actions.delete", "Xóa")}
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
