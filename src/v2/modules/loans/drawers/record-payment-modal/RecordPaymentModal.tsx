import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Button,
  V2DatePicker,
  V2Input,
  V2Modal,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import type { RecordPaymentModalProps } from "./RecordPaymentModal.type";
import { useRecordPaymentModal } from "./RecordPaymentModal.hook";

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = (
  props,
) => {
  const { open, onClose, loanTitle } = props;
  const { t } = useV2Translation();
  const {
    periodNumber,
    setPeriodNumber,
    paymentDate,
    setPaymentDate,
    principalPaid,
    setPrincipalPaid,
    interestPaid,
    setInterestPaid,
    paymentReference,
    setPaymentReference,
    notes,
    setNotes,
    error,
    isSubmitting,
    handleSubmit,
  } = useRecordPaymentModal(props);

  const footerContent = (
    <div className="flex justify-end gap-2">
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
  );

  return (
    <V2Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={t("v2.loans.modal.recordPaymentTitle", "Ghi Nhận Thanh Toán Kỳ")}
      description={loanTitle}
      size="md"
      footer={footerContent}
    >
      <form
        id="record-payment-form"
        onSubmit={handleSubmit}
        className="space-y-3.5 py-2"
      >
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <V2Text variant="caption" className="font-medium mb-1 block">
              {t("v2.loans.table.period", "Kỳ thứ")} *
            </V2Text>
            <V2NumberInput
              sizeVariant="md"
              min={1}
              value={periodNumber}
              onValueChange={(val) => setPeriodNumber(Math.max(1, val ?? 1))}
            />
          </div>
          <div>
            <V2Text variant="caption" className="font-medium mb-1 block">
              {t("v2.loans.form.paymentDate", "Ngày trả")} *
            </V2Text>
            <V2DatePicker
              value={paymentDate || null}
              onValueChange={(val) => setPaymentDate(val || "")}
              placeholder={t("v2.loans.form.selectDate", "Chọn ngày trả")}
              clearable={false}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <V2Text variant="caption" className="font-medium mb-1 block">
              {t("v2.loans.table.principalPaid", "Tiền gốc trả (VND)")} *
            </V2Text>
            <V2NumberInput
              sizeVariant="md"
              min={0}
              value={principalPaid}
              onValueChange={(val) => setPrincipalPaid(Math.max(0, val ?? 0))}
            />
          </div>
          <div>
            <V2Text variant="caption" className="font-medium mb-1 block">
              {t("v2.loans.table.interestPaid", "Tiền lãi trả (VND)")} *
            </V2Text>
            <V2NumberInput
              sizeVariant="md"
              min={0}
              value={interestPaid}
              onValueChange={(val) => setInterestPaid(Math.max(0, val ?? 0))}
            />
          </div>
        </div>

        <div>
          <V2Text variant="caption" className="font-medium mb-1 block">
            {t(
              "v2.loans.form.paymentReference",
              "Mã giao dịch / UNC ngân hàng",
            )}
          </V2Text>
          <V2Input
            sizeVariant="md"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="VD: FT2412345678"
          />
        </div>

        <div>
          <V2Text variant="caption" className="font-medium mb-1 block">
            {t("v2.loans.form.notes", "Ghi chú")}
          </V2Text>
          <V2Input
            sizeVariant="md"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VD: Đã trừ tự động qua tài khoản VCB"
          />
        </div>
      </form>
    </V2Modal>
  );
};
