import { useMemo } from "react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { usePurchaseOrderDrawer } from "@/modules/purchase-orders-core/hooks/usePurchaseOrderDrawer";
import { FormLineDetailPanel } from "@/modules/operational/components/form/FormLineDetailPanel";
import { FormGeneralInfoPanel } from "@/modules/operational/components/form/FormGeneralInfoPanel";
import { PurchaseLinkedDocuments } from "@/modules/operational/components/PurchaseLinkedDocuments";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { FileSpreadsheet, ChevronDown, FileText, Link2 } from "lucide-react";

export interface PurchaseOrderDrawerProps {
  open: boolean;
  loading?: boolean;
  editing: OperationalDocument | null;
  viewOnly?: boolean;
  poReceipts?: ErpPoReceipt[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
  onExportExcel?: () => void;
  /** Pending tag IDs for Option B create flow */
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  isAdminEmail?: boolean;
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
  onExportExcel,
  pendingTagIds = [],
  onPendingTagsChange,
  isAdminEmail,
}: PurchaseOrderDrawerProps) {
  const t = useT();
  const drawerState = usePurchaseOrderDrawer({
    open,
    editing,
    viewOnly,
    poReceipts,
    onClose,
    onSaved,
    pendingTagIds,
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
    purchaseFieldLocked,
    purchaseInventoryOptions,
    handleSubmit,
    pendingDocumentChanges,
    fieldSet,
    onItemSearch,
    onScrollBottomItems,
    loadingItems,
  } = drawerState;

  const linkedCount = useMemo(() => {
    const receiptsCount = poReceipts?.length || 0;
    const pendingCount = pendingDocumentChanges?.length || 0;
    return receiptsCount + pendingCount;
  }, [poReceipts, pendingDocumentChanges]);

  const drawerTabs: DrawerTopTabItem[] = useMemo(
    () => [
      {
        key: "po_details",
        label: t("Chi tiết đơn hàng"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <FormLineDetailPanel
            variant="purchase"
            isPurchaseLocked={isPurchaseLocked}
            purchaseFieldLocked={purchaseFieldLocked}
            viewOnly={viewOnly}
            purchaseInventoryOptions={purchaseInventoryOptions}
            onItemSearch={onItemSearch}
            onScrollBottomItems={onScrollBottomItems}
            loadingItems={loadingItems}
          />
        ),
      },
      {
        key: "linked_docs",
        label: t("Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount: linkedCount,
        content: (
          <div className="space-y-4">
            <PurchaseLinkedDocuments
              receipts={poReceipts || []}
              editMode={!viewOnly}
              pendingDocumentChanges={pendingDocumentChanges}
              fieldSet={fieldSet}
              purchaseOrderId={editing?.id}
              open={open}
            />
          </div>
        ),
      },
    ],
    [
      t,
      isPurchaseLocked,
      purchaseFieldLocked,
      viewOnly,
      purchaseInventoryOptions,
      onItemSearch,
      onScrollBottomItems,
      loadingItems,
      linkedCount,
      poReceipts,
      pendingDocumentChanges,
      fieldSet,
      editing?.id,
      open,
    ],
  );

  const footerLeft =
    editing && onExportExcel ? (
      <ActionDropdown
        align="start"
        items={[
          {
            groupLabel: t("common.exportGroup", "XUẤT DỮ LIỆU"),
            items: [
              {
                label:
                  status === "DRAFT"
                    ? t("Xuất phiếu đề xuất mua hàng")
                    : t("Xuất bảng kê mua hàng"),
                icon: (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ),
                onClick: onExportExcel,
                disabled: loading || saving,
              },
            ],
          },
        ]}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white dark:bg-zinc-800 hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              {t("common.actions", "Thao tác")}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    ) : undefined;

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
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      confirmOnClose={!viewOnly}
      onClose={onClose}
      onToggleEdit={onToggleEdit}
      footerLeft={footerLeft}
      tabs={drawerTabs}
      defaultTabKey="po_details"
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
      rightPanel={
        <FormGeneralInfoPanel
          variant="purchase"
          isPurchaseLocked={isPurchaseLocked}
          purchaseFieldLocked={purchaseFieldLocked}
          viewOnly={viewOnly}
          branchOptions={branchOptions}
          partnerOptions={partnerOptions}
          entityId={editing?.id ?? null}
          entityType="erp_purchase_order"
          pendingTagIds={pendingTagIds}
          onPendingTagsChange={onPendingTagsChange}
          isAdminEmail={isAdminEmail}
        />
      }
    />
  );
}
