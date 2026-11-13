import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { formatVndCurrency } from "@/v2/core/loans";

interface RecordPaymentFooterProps {
  totalPaid: number;
  isSubmitting: boolean;
  onClose: () => void;
}

export const RecordPaymentFooter: React.FC<RecordPaymentFooterProps> = ({
  totalPaid,
  isSubmitting,
  onClose,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1.5">
        <V2Text variant="caption" color="muted">
          {t("v2.loans.modal.totalPaid", "Tổng trả")}:
        </V2Text>
        <V2Badge variant="success" className="font-mono text-sm font-semibold">
          {formatVndCurrency(totalPaid)}
        </V2Badge>
      </div>
      <div className="flex items-center gap-2">
        <V2Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t("v2.common.cancel", "Hủy")}
        </V2Button>
        <V2Button
          type="submit"
          form="record-payment-form"
          variant="primary"
          isLoading={isSubmitting}
        >
          {t("v2.loans.modal.confirmPayment", "Xác nhận thanh toán")}
        </V2Button>
      </div>
    </div>
  );
};

RecordPaymentFooter.displayName = "RecordPaymentFooter";
