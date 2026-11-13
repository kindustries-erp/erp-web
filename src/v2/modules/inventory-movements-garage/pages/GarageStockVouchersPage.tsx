import * as React from "react";
import { Boxes, Plus } from "lucide-react";
import {
  V2ConfirmModal,
  V2Dropdown,
  V2ModulePage,
  V2ModulePageTabVariant,
  V2SplitButton,
} from "@/v2/shared/components";
import type { V2ModuleTab } from "@/v2/shared/components";
import { LineItemCodeFieldProvider } from "@/v2/shared/context/LineItemCodeFieldContext";
import { GarageItemCodeField } from "@/v2/modules/items-garage";
import { GoodsReceiptDrawer } from "@/v2/core/goods-receipts";
import {
  StockVoucherDetailDrawer,
  useStockVoucherTypeCountsQuery,
} from "@/v2/core/inventory-movements";
import type { StockVoucherRow } from "@/v2/core/inventory-movements";
import { useProcurementWorkflowMenu } from "@/v2/core/procurement";
import { garageGoodsReceiptsConfig } from "../purchase-receipts/garageGoodsReceipts.config";
import { inventoryMovementsGarageConfig as config } from "../inventoryMovementsGarage.config";
import { useGarageStockVouchersPage } from "./GarageStockVouchersPage.hook";
import { buildGarageVoucherTabs } from "./GarageStockVouchersPage.tabs";
import "../inventoryMovementsGarage.locale";

export function GarageStockVouchersPage() {
  const state = useGarageStockVouchersPage();
  const { t, receipt } = state;
  const workflow = useProcurementWorkflowMenu("dev");
  const typeCounts = useStockVoucherTypeCountsQuery({
    api: config.api,
    keys: config.keys,
  });

  const tabs = React.useMemo<V2ModuleTab<StockVoucherRow>[]>(
    () => buildGarageVoucherTabs(state, typeCounts),
    [state, typeCounts],
  );

  return (
    <V2ModulePage<StockVoucherRow>
      title={t("v2.garageStockVouchers.title", "Chứng từ kho Garage")}
      description={t(
        "v2.garageStockVouchers.description",
        "Theo dõi phiếu nhập, xuất và điều chỉnh kho của garage",
      )}
      icon={<Boxes className="h-4 w-4" />}
      tabs={tabs}
      tabVariant={V2ModulePageTabVariant.STATUS_CHIP}
      tabBarClassName="pb-0"
      actions={
        <V2SplitButton
          label={
            receipt.canCreate
              ? t("v2.garageStockVouchers.create", "Nhập mua hàng")
              : workflow.actionsLabel
          }
          icon={receipt.canCreate ? <Plus className="h-4 w-4" /> : undefined}
          onClick={
            receipt.canCreate ? () => receipt.open(null, "edit") : undefined
          }
          renderMenu={(trigger) => (
            <V2Dropdown
              groups={[{ items: [workflow.item] }]}
              trigger={trigger}
              align="end"
            />
          )}
        />
      }
      overlays={
        <LineItemCodeFieldProvider value={GarageItemCodeField}>
          {workflow.drawer}
          {receipt.drawer && (
            <GoodsReceiptDrawer
              key={`${receipt.drawer.id ?? "new"}-${receipt.drawer.mode}`}
              config={garageGoodsReceiptsConfig}
              open
              recordId={receipt.drawer.id}
              mode={receipt.drawer.mode}
              prefill={receipt.drawer.prefill}
              canUpdate={receipt.canUpdate}
              onClose={() => receipt.setDrawer(null)}
            />
          )}
          {state.detail && (
            <StockVoucherDetailDrawer
              config={config}
              type={state.detail.type}
              id={state.detail.id}
              onClose={state.closeDetail}
            />
          )}
          <V2ConfirmModal
            open={Boolean(receipt.deleteTarget)}
            title={t("v2.goodsReceipts.delete.title", "Xác nhận xóa")}
            message={
              receipt.deleteTarget
                ? `${t("v2.goodsReceipts.delete.message", "Bạn có chắc muốn xóa?")} ${receipt.deleteTarget.receiptNo}`
                : ""
            }
            confirmLabel={t("v2.goodsReceipts.actions.delete", "Xóa")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={receipt.remove.isPending}
            onConfirm={() => {
              if (receipt.deleteTarget)
                receipt.remove.mutate(receipt.deleteTarget.id);
            }}
            onCancel={() => receipt.setDeleteTarget(null)}
            onOpenChange={(open) => !open && receipt.setDeleteTarget(null)}
          />
        </LineItemCodeFieldProvider>
      }
    />
  );
}
