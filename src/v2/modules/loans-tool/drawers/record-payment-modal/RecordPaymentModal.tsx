import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Button,
  V2Combobox,
  V2DatePicker,
  V2Modal,
  V2Text,
} from "@/v2/shared/components";
import type { RecordPaymentModalProps } from "./RecordPaymentModal.type";
import { useRecordPaymentModal } from "./RecordPaymentModal.hook";
import { RecordPaymentSummaryCard } from "./components/RecordPaymentSummaryCard";
import { RecordPaymentFooter } from "./components/RecordPaymentFooter";
import { RecordPaymentAmountsFields } from "./components/RecordPaymentAmountsFields";

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = (
  props,
) => {
  const { open, onClose, loanTitle, loanCode, remainingPrincipal } = props;
  const { t } = useV2Translation();
  const {
    isEdit,
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
    periodOptions,
    isLoadingPayments,
    currentScheduledPeriod,
    handleFillFromSchedule,
    handleSettleAll,
    totalPaid,
    allPeriodsPaid,
  } = useRecordPaymentModal(props);

  const modalTitle = isEdit
    ? t("v2.loans.modal.editPaymentTitle", "Chỉnh Sửa Thanh Toán")
    : t("v2.loans.modal.recordPaymentTitle", "Ghi Nhận Thanh Toán Khoản Vay");

  return (
    <V2Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={modalTitle}
      description={loanCode ? `${loanCode} — ${loanTitle}` : loanTitle}
      size="lg"
      footer={
        <RecordPaymentFooter
          totalPaid={totalPaid}
          isSubmitting={isSubmitting}
          submitDisabled={allPeriodsPaid}
          onClose={onClose}
        />
      }
    >
      <form
        id="record-payment-form"
        onSubmit={handleSubmit}
        className="space-y-4 py-2"
      >
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {allPeriodsPaid && (
          <div className="p-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
            {t("v2.loans.modal.allPeriodsPaid", "Đã thanh toán đủ các kỳ")}
          </div>
        )}

        <RecordPaymentSummaryCard
          remainingPrincipal={remainingPrincipal}
          scheduledDue={currentScheduledPeriod?.totalPaymentDue}
          periodNumber={periodNumber}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <V2Text variant="caption" className="font-medium mb-1 block">
              {t("v2.loans.modal.selectPeriod", "Kỳ thanh toán")} *
            </V2Text>
            <V2Combobox
              options={periodOptions}
              value={String(periodNumber)}
              onValueChange={(val) => val && setPeriodNumber(Number(val))}
              clearable={false}
              disabled={isLoadingPayments}
              searchable={periodOptions.length > 8}
              className="w-full"
            />
          </div>
          <div>
            <V2Text variant="caption" className="font-medium mb-1 block">
              {t("v2.loans.form.paymentDate", "Ngày thanh toán thực tế")} *
            </V2Text>
            <V2DatePicker
              value={paymentDate || null}
              onValueChange={(val) => setPaymentDate(val || "")}
              placeholder={t(
                "v2.loans.form.selectDate",
                "Chọn ngày thanh toán",
              )}
              clearable={false}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <V2Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillFromSchedule}
            className="text-xs h-7 px-2.5"
          >
            {t("v2.loans.modal.quickFillSchedule", "Điền theo lịch")}
          </V2Button>
          <V2Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSettleAll}
            className="text-xs h-7 px-2.5"
          >
            {t("v2.loans.modal.quickPayAll", "Tất toán toàn bộ")}
          </V2Button>
        </div>

        <RecordPaymentAmountsFields
          principalPaid={principalPaid}
          setPrincipalPaid={setPrincipalPaid}
          interestPaid={interestPaid}
          setInterestPaid={setInterestPaid}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          notes={notes}
          setNotes={setNotes}
        />
      </form>
    </V2Modal>
  );
};

RecordPaymentModal.displayName = "RecordPaymentModal";
