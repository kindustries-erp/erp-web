import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { usePurchaseOrderDrawer } from "@/modules/purchase-orders-core/hooks/usePurchaseOrderDrawer";
import {} from "@/modules/operational/components/form/FormLoadingSkeleton";
import { FormLineDetailPanel } from "@/modules/operational/components/form/FormLineDetailPanel";
import { FormGeneralInfoPanel } from "@/modules/operational/components/form/FormGeneralInfoPanel";

export interface PurchaseOrderDrawerProps {
  open: boolean;
  loading?: boolean;
  editing: OperationalDocument | null;
  viewOnly?: boolean;
  poReceipts?: ErpPoReceipt[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
}

export function PurchaseOrderDrawer({
  open,
  loading,
  editing,
  viewOnly,
  poReceipts,
  onClose,
  onSaved,
  onToggleEdit,
}: PurchaseOrderDrawerProps) {
  const t = useT();
  const drawerState = usePurchaseOrderDrawer({
    open,
    editing,
    viewOnly,
    poReceipts,
    onClose,
    onSaved,
  });

  const {
    docNo,
    status,
    saving,
    error,
    submittingStatus,
    branchOptions,
    partnerOptions,
    isPurchaseLocked,
    isPurchaseFullyLocked,
    purchaseFieldLocked,
    purchaseInventoryOptions,
    handleSubmit,
  } = drawerState;

  const actions =
    viewOnly || loading
      ? [
          {
            label: t("Đóng"),
            onClick: onClose,
            variant: "outline" as const,
            disabled: loading,
          },
        ]
      : status === "DRAFT" || !editing
        ? [
            {
              label: t("Hủy"),
              onClick: onClose,
              variant: "outline" as const,
              disabled: saving,
            },
            {
              label: editing ? t("Lưu Nháp") : t("Tạo Nháp"),
              variant: "outline" as const,
              loading: saving && submittingStatus === "DRAFT",
              disabled: saving,
              onClick: () => handleSubmit("DRAFT"),
            },
            {
              label: editing ? t("Xác nhận") : t("Tạo Mới"),
              primary: true,
              loading: saving && submittingStatus === "CONFIRMED",
              disabled: saving,
              onClick: () => handleSubmit("CONFIRMED"),
            },
          ]
        : [
            {
              label: t("Hủy"),
              onClick: onClose,
              variant: "outline" as const,
              disabled: saving,
            },
            {
              label: t("Lưu thay đổi"),
              primary: true,
              loading: saving,
              disabled: saving,
              onClick: () => handleSubmit(),
            },
          ];

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={onToggleEdit}
      title={
        viewOnly
          ? t("Chi tiết Đơn mua hàng")
          : editing
            ? t("Cập nhật Đơn mua hàng")
            : t("Tạo mới Đơn mua hàng")
      }
      titleExtra={
        status === "DRAFT" && (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
            {t("Nháp")}
          </span>
        )
      }
      subtitle={
        editing
          ? `${t("Mã")}: ${docNo || editing.id}`
          : t("Nhập thông tin chứng từ")
      }
      actions={actions}
      loading={loading}
      error={error}
      leftPanel={
        <FormLineDetailPanel
          variant="purchase"
          isPurchaseLocked={isPurchaseLocked}
          purchaseFieldLocked={purchaseFieldLocked}
          viewOnly={viewOnly}
          purchaseInventoryOptions={purchaseInventoryOptions}
        />
      }
      rightPanel={
        <FormGeneralInfoPanel
          variant="purchase"
          isPurchaseLocked={isPurchaseLocked}
          isPurchaseFullyLocked={isPurchaseFullyLocked}
          purchaseFieldLocked={purchaseFieldLocked}
          viewOnly={viewOnly}
          branchOptions={branchOptions}
          partnerOptions={partnerOptions}
          poReceipts={poReceipts}
        />
      }
    />
  );
}
