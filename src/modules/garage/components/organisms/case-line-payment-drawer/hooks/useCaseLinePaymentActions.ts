import { useMemo } from "react";
import type { TFunction } from "i18next";
import type { DrawerAction } from "@/shared/components/DrawerModal";

export interface UseCaseLinePaymentActionsOptions {
  isManualTab: boolean;
  direction?: "COST" | "REVENUE";
  reconLogic: any;
  onClose: () => void;
  t: TFunction;
}

export function useCaseLinePaymentActions({
  isManualTab,
  direction,
  reconLogic,
  onClose,
  t,
}: UseCaseLinePaymentActionsOptions): DrawerAction[] {
  return useMemo(() => {
    if (isManualTab) {
      const hasAmount =
        Boolean(reconLogic.manualAmount) && Number(reconLogic.manualAmount) > 0;
      const pendingCount = reconLogic.pendingManualSettlements?.length || 0;
      const deletedCount = reconLogic.pendingDeletedSettlementIds?.length || 0;
      const canSave = hasAmount || pendingCount > 0 || deletedCount > 0;

      const baseLabel =
        direction === "COST"
          ? t("cases.financials.saveManualPayment", "Ghi nhận chi ngoài sổ")
          : t("cases.financials.saveManualReceipt", "Ghi nhận thu ngoài sổ");

      let submitLabel = baseLabel;
      if (pendingCount > 0 && deletedCount > 0) {
        submitLabel = `${baseLabel} (+${pendingCount}, -${deletedCount})`;
      } else if (deletedCount > 0) {
        submitLabel = `${baseLabel} (-${deletedCount})`;
      } else if (pendingCount > 0 || hasAmount) {
        const totalAdd = pendingCount + (hasAmount ? 1 : 0);
        submitLabel = `${baseLabel} (${totalAdd})`;
      }

      return [
        {
          label: t("common.close", "Đóng"),
          variant: "outline" as const,
          onClick: onClose,
        },
        {
          label: submitLabel,
          disabled: !canSave,
          loading: reconLogic.isSubmitting,
          onClick: reconLogic.handleSubmitBankAndCash,
        },
      ];
    }

    return [
      {
        label: t("common.close", "Đóng"),
        variant: "outline" as const,
        onClick: onClose,
      },
      {
        label: t("cases.reconciliation.saveInvoiceLinks", {
          count: reconLogic.selectedInvoicesCount,
          defaultValue: `Lưu cấn trừ (${reconLogic.selectedInvoicesCount} HĐ)`,
        }),
        disabled: !reconLogic.hasInvoiceChanges,
        loading: reconLogic.isSubmitting,
        onClick: reconLogic.handleSubmitInvoices,
      },
    ];
  }, [t, isManualTab, direction, onClose, reconLogic]);
}
