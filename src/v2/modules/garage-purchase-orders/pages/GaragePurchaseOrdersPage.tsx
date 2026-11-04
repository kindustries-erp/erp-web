import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { V2Button, V2ConfirmModal, V2ModulePage } from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import {
  PurchaseOrderDrawer,
  usePurchaseOrdersQuery,
} from "@/v2/core/purchase-orders";
import {
  v2ColumnPreferencesStorage,
  v2ViewPresetStorage,
} from "@/v2/shared/preferences/v2TablePreferenceStorages";
import type { GaragePurchaseOrder } from "@/v2/modules/garage-purchase-orders/domain/entities/garagePurchaseOrder";
import { garagePurchaseOrdersConfig } from "@/v2/modules/garage-purchase-orders/garagePurchaseOrders.config";
import { useGaragePurchaseOrdersPage } from "./GaragePurchaseOrdersPage.hook";
import "../garagePurchaseOrders.locale";

export function GaragePurchaseOrdersPage() {
  const state = useGaragePurchaseOrdersPage();
  const { t } = state;

  const tabs = React.useMemo<V2ModuleTab<GaragePurchaseOrder>[]>(
    () => [
      {
        key: "list",
        label: t("v2.purchaseOrders.list", "Danh sách"),
        kind: "list",
        resetKey: `${state.tableId}-${state.tableKey}`,
        table: {
          tableId: state.tableId,
          columns: state.columns,
          getRowKey: (row) => row.id,
          mode: "server",
          fetchOptions: (params) =>
            garagePurchaseOrdersConfig.api.options(params),
          rowActions: state.rowActions,
          preferencesStorage: v2ColumnPreferencesStorage,
          viewPresetStorage: v2ViewPresetStorage,
          emptyLabel: t("v2.purchaseOrders.empty", "Không có dữ liệu"),
          toolbar: {
            search: {},
            filterPanel: {},
            enableFullscreen: true,
            viewModes: {
              items: [
                {
                  key: "overview",
                  label: t("v2.purchaseOrders.views.overview", "Tổng quan"),
                },
                {
                  key: "all",
                  label: t("v2.purchaseOrders.views.all", "Tất cả cột"),
                },
              ],
              activeKey: state.view,
              onSelect: state.selectView,
            },
          },
        },
        useData: (query) =>
          usePurchaseOrdersQuery({
            api: garagePurchaseOrdersConfig.api,
            keys: garagePurchaseOrdersConfig.keys,
            query,
            onError: state.onListError,
          }),
      },
    ],
    [state],
  );

  return (
    <V2ModulePage<GaragePurchaseOrder>
      title={t("v2.garagePurchaseOrders.title", "Đơn mua hàng Garage")}
      description={t(
        "v2.garagePurchaseOrders.description",
        "Quản lý đơn mua phụ tùng cho garage",
      )}
      icon={<ShoppingCart className="h-4 w-4" />}
      tabs={tabs}
      actions={
        state.canCreate ? (
          <V2Button size="sm" onClick={() => state.open(null, "edit")}>
            {t("v2.garagePurchaseOrders.create", "Tạo đơn mua hàng")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          {state.drawer && (
            <PurchaseOrderDrawer
              key={`${state.drawer.id ?? "new"}-${state.drawer.mode}`}
              config={garagePurchaseOrdersConfig}
              open
              recordId={state.drawer.id}
              mode={state.drawer.mode}
              canUpdate={state.canUpdate}
              onClose={() => state.setDrawer(null)}
            />
          )}
          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.purchaseOrders.delete.title", "Xác nhận xóa đơn")}
            message={
              state.deleteTarget
                ? `${t("v2.purchaseOrders.delete.message", "Bạn có chắc muốn xóa đơn mua hàng này?")} ${state.deleteTarget.poNo}`
                : ""
            }
            confirmLabel={t("v2.purchaseOrders.actions.delete", "Xóa")}
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
