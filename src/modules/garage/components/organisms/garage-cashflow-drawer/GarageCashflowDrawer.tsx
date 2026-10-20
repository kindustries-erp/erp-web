import React, { useMemo } from "react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DrawerAuditTimeline } from "@/shared/components/drawer/DrawerAuditTimeline";
import { GarageCashflowDuplicateWarning } from "../../molecules/garage-cashflow-duplicate-warning";
import { AlertTriangle, FileText, History } from "lucide-react";
import { useT } from "@/core/i18n";
import { Badge } from "@/shared/components/ui/badge";
import type { GarageCashflowDrawerProps } from "./GarageCashflowDrawer.type";
import { useGarageCashflowDrawer } from "./GarageCashflowDrawer.hook";
import { GarageCashflowDrawerGeneralSection } from "./GarageCashflowDrawerGeneralSection";
import { GarageCashflowDrawerSettlementSection } from "./GarageCashflowDrawerSettlementSection";

export const GarageCashflowDrawer: React.FC<GarageCashflowDrawerProps> = ({
  open,
  onClose,
  voucher,
  initialMode = "view",
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
  });

  const t = useT();
  const sectionProps = useMemo(
    () => ({
      mode,
      voucher,
      formData,
      setFormData,
    }),
    [mode, voucher, formData, setFormData],
  );

  const drawerTabs: DrawerTopTabItem[] | undefined = useMemo(() => {
    if (!voucher) return undefined;

    return [
      {
        key: "details",
        label: t("garage:cashflowDrawer.tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-4 pb-4">
            <GarageCashflowDrawerGeneralSection {...sectionProps} />
            <GarageCashflowDrawerSettlementSection {...sectionProps} />
          </div>
        ),
      },
      {
        key: "history",
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
  }, [voucher, sectionProps, auditItems, isAuditLoading, t]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode={mode}
        onToggleEdit={canUpdate ? () => setMode("edit") : undefined}
        layout="1-column"
        size="md"
        defaultTabKey="details"
        tabs={drawerTabs}
        title={
          initialMode === "create"
            ? t("garage:cashflowDrawer.createTitle", "Tạo Phiếu Thu Chi Mới")
            : `${t("garage:cashflowDrawer.voucherPrefix", "Phiếu")} ${voucher?.voucherCode || ""}`
        }
        titleExtra={
          voucher && (
            <Badge variant="outline">
              {(voucher.voucherType || "").toUpperCase() === "RECEIPT"
                ? t("garage:cashflowDrawer.typeReceipt", "Thu")
                : t("garage:cashflowDrawer.typePayment", "Chi")}
            </Badge>
          )
        }
        actions={[
          {
            label: t("common:close", "Đóng"),
            onClick: onClose,
            variant: "outline",
          },
          ...(mode === "edit" && canSave
            ? [
                {
                  label: t("common:save", "Lưu"),
                  onClick: handleSave,
                  primary: true,
                  loading: isPending,
                },
              ]
            : []),
        ]}
        confirmOnClose={mode === "edit"}
        leftPanel={
          !drawerTabs ? (
            <div className="space-y-4 pb-4">
              <GarageCashflowDrawerGeneralSection {...sectionProps} />
              <GarageCashflowDrawerSettlementSection {...sectionProps} />
            </div>
          ) : undefined
        }
      />
      <ConfirmModal
        open={!!duplicate.pending}
        danger={false}
        size="md"
        icon={
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </span>
        }
        titleClassName="text-lg"
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
        loading={isPending && !duplicate.isChecking}
        onConfirm={duplicate.confirm}
        onCancel={duplicate.cancel}
      />
    </>
  );
};
