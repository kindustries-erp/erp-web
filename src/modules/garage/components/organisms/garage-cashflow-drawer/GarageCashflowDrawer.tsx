import React, { useMemo } from "react";
import {
  V2StandardDrawer,
  type V2TabItemData,
  type DrawerAction,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { DrawerAuditTimeline } from "@/shared/components/drawer/DrawerAuditTimeline";
import { GarageCashflowDuplicateWarning } from "../../molecules/garage-cashflow-duplicate-warning";
import { FileText, History } from "lucide-react";
import { useT } from "@/core/i18n";
import { Badge } from "@/v2/shared/ui/badge";
import {
  V2DrawerMode,
  type GarageCashflowDrawerProps,
} from "./GarageCashflowDrawer.type";
import { useGarageCashflowDrawer } from "./GarageCashflowDrawer.hook";
import { GarageCashflowDrawerGeneralSection } from "./GarageCashflowDrawerGeneralSection";
import { GarageCashflowDrawerSettlementSection } from "./GarageCashflowDrawerSettlementSection";

export const GarageCashflowDrawer: React.FC<GarageCashflowDrawerProps> = ({
  open,
  onClose,
  voucher,
  initialMode = V2DrawerMode.VIEW,
  initialData,
  onSuccess,
}) => {
  const {
    mode,
    setMode,
    formData,
    setFormData,
    canUpdate,
    canSave,
    handleSave,
    isPending,
    duplicate,
    auditItems,
    isAuditLoading,
  } = useGarageCashflowDrawer({
    open,
    onClose,
    voucher,
    initialMode,
    initialData,
    onSuccess,
  });

  const t = useT();

  const sectionProps = useMemo(
    () => ({ mode, voucher, formData, setFormData, initialData }),
    [mode, voucher, formData, setFormData, initialData],
  );

  const mainPanel = useMemo(
    () => (
      <div className="space-y-4 pb-4">
        <GarageCashflowDrawerGeneralSection {...sectionProps} />
        <GarageCashflowDrawerSettlementSection {...sectionProps} />
      </div>
    ),
    [sectionProps],
  );

  const drawerTabs: V2TabItemData[] | undefined = useMemo(() => {
    if (!voucher) return undefined;
    return [
      {
        key: "details",
        id: "details",
        label: t("garage:cashflowDrawer.tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: mainPanel,
      },
      {
        key: "history",
        id: "history",
        label: t("garage:cashflowDrawer.tabHistory", "Lịch sử & Kiểm duyệt"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
            <DrawerAuditTimeline
              items={auditItems}
              loading={isAuditLoading}
              emptyLabel={t(
                "garage:cashflowDrawer.noHistory",
                "Chưa có ghi nhận lịch sử.",
              )}
            />
          </div>
        ),
      },
    ];
  }, [voucher, mainPanel, auditItems, isAuditLoading, t]);

  const drawerActions: DrawerAction[] = useMemo(() => {
    const list: DrawerAction[] = [
      {
        label: t("common:close", "Đóng"),
        onClick: onClose,
        variant: "outline",
      },
    ];
    if (mode === V2DrawerMode.EDIT && canSave) {
      list.push({
        label: t("common:save", "Lưu"),
        onClick: handleSave,
        primary: true,
        loading: isPending,
      });
    }
    return list;
  }, [t, onClose, mode, canSave, handleSave, isPending]);

  const isReceipt = (voucher?.voucherType || "").toUpperCase() === "RECEIPT";
  const title =
    initialMode === V2DrawerMode.CREATE
      ? t("garage:cashflowDrawer.createTitle", "Tạo Phiếu Thu Chi Mới")
      : `${t("garage:cashflowDrawer.voucherPrefix", "Phiếu")} ${voucher?.voucherCode || ""}`;

  return (
    <>
      <V2StandardDrawer
        open={open}
        onClose={onClose}
        mode={mode}
        onToggleEdit={canUpdate ? () => setMode(V2DrawerMode.EDIT) : undefined}
        layout="1-column"
        size="md"
        defaultTabKey="details"
        tabs={drawerTabs}
        title={title}
        titleExtra={
          voucher && (
            <Badge variant="outline">
              {isReceipt
                ? t("garage:cashflowDrawer.typeReceipt", "Thu")
                : t("garage:cashflowDrawer.typePayment", "Chi")}
            </Badge>
          )
        }
        actions={drawerActions}
        confirmOnClose={mode === V2DrawerMode.EDIT}
        leftPanel={!drawerTabs ? mainPanel : undefined}
      />
      <V2ConfirmModal
        open={Boolean(duplicate.pending)}
        variant="warning"
        title={t(
          "garage:cashflowDuplicate.title",
          "Phiếu thu/chi có thể bị trùng",
        )}
        message={
          duplicate.pending && (
            <GarageCashflowDuplicateWarning
              amount={duplicate.pending.params.amount}
              result={duplicate.pending.result}
            />
          )
        }
        cancelLabel={t("garage:cashflowDuplicate.back", "Quay lại sửa")}
        confirmLabel={t("garage:cashflowDuplicate.proceed", "Vẫn nhập tiếp")}
        isLoading={isPending && !duplicate.isChecking}
        onConfirm={duplicate.confirm}
        onCancel={duplicate.cancel}
      />
    </>
  );
};
