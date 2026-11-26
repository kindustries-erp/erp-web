import React from "react";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { GarageCashflowDuplicateWarning } from "../../molecules/garage-cashflow-duplicate-warning";
import { useT } from "@/core/i18n";
import type { useGarageCashflowDuplicateGuard } from "./useGarageCashflowDuplicateGuard";

export interface GarageCashflowDrawerDuplicateModalProps {
  duplicate: ReturnType<typeof useGarageCashflowDuplicateGuard>;
  isPending: boolean;
}

export const GarageCashflowDrawerDuplicateModal: React.FC<
  GarageCashflowDrawerDuplicateModalProps
> = ({ duplicate, isPending }) => {
  const t = useT();

  return (
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
  );
};
