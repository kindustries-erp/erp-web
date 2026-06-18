import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { usePurchaseOrderDrawer } from "@/modules/purchase-orders-core/hooks/usePurchaseOrderDrawer";
import { FormLoadingSkeleton } from "@/modules/operational/components/form/FormLoadingSkeleton";
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

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      headerExtra={
        viewOnly && onToggleEdit ? (
          <Button variant="secondary" size="sm" onClick={onToggleEdit}>
            {t("Chỉnh sửa")}
          </Button>
        ) : undefined
      }
      panelClassName="min-[1024px]:min-w-[1400px]"
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
    >
      {loading ? (
        <FormLoadingSkeleton />
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full">
          <div className="flex-1 min-w-0 w-full order-2 xl:order-1 space-y-4">
            <FormLineDetailPanel
              variant="purchase"
              isPurchaseLocked={isPurchaseLocked}
              purchaseFieldLocked={purchaseFieldLocked}
              viewOnly={viewOnly}
              purchaseInventoryOptions={purchaseInventoryOptions}
            />
          </div>

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
        </div>
      )}

      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3">
          {error}
        </div>
      )}
    </DrawerModal>
  );
}
