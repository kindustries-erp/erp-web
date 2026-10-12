import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { GarageCashflowDuplicateWarning } from "../../molecules/garage-cashflow-duplicate-warning";
import { AlertTriangle } from "lucide-react";
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
  } = useGarageCashflowDrawer({
    open,
    onClose,
    voucher,
    initialMode,
  });

  const t = useT();
  const sectionProps = {
    mode,
    voucher,
    formData,
    setFormData,
  };

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode={mode}
        onToggleEdit={canUpdate ? () => setMode("edit") : undefined}
        layout="1-column"
        size="md"
        title={
          initialMode === "create"
            ? "Tạo Phiếu Thu Chi Mới"
            : `Phiếu ${voucher?.voucherCode || ""}`
        }
        titleExtra={
          voucher && (
            <Badge variant="outline">
              {(voucher.voucherType || "").toUpperCase() === "RECEIPT"
                ? "Thu"
                : "Chi"}
            </Badge>
          )
        }
        actions={[
          { label: "Đóng", onClick: onClose, variant: "outline" },
          ...(mode === "edit" && canSave
            ? [
                {
                  label: "Lưu",
                  onClick: handleSave,
                  primary: true,
                  loading: isPending,
                },
              ]
            : []),
        ]}
        confirmOnClose={mode === "edit"}
        leftPanel={
          <div className="space-y-4 pb-4">
            <GarageCashflowDrawerGeneralSection {...sectionProps} />
            <GarageCashflowDrawerSettlementSection {...sectionProps} />
          </div>
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
