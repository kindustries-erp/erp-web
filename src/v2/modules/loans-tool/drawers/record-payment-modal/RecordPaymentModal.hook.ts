import { useState, useEffect } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useRecordPaymentMutation } from "../../api";
import type { RecordPaymentModalProps } from "./RecordPaymentModal.type";

export function useRecordPaymentModal(props: RecordPaymentModalProps) {
  const {
    open,
    onClose,
    loanId,
    suggestedPeriod = 1,
    suggestedPrincipal = 0,
    suggestedInterest = 0,
  } = props;
  const { t } = useV2Translation();
  const recordPaymentMutation = useRecordPaymentMutation();

  const [periodNumber, setPeriodNumber] = useState<number>(suggestedPeriod);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [principalPaid, setPrincipalPaid] =
    useState<number>(suggestedPrincipal);
  const [interestPaid, setInterestPaid] = useState<number>(suggestedInterest);
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPeriodNumber(suggestedPeriod);
      setPrincipalPaid(suggestedPrincipal);
      setInterestPaid(suggestedInterest);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentReference("");
      setNotes("");
      setError(null);
    }
  }, [open, suggestedPeriod, suggestedPrincipal, suggestedInterest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId) return;

    if (periodNumber < 1) {
      setError(
        t("v2.loans.validation.periodPositive", "Kỳ thanh toán phải lớn hơn 0"),
      );
      return;
    }
    if (principalPaid < 0 || interestPaid < 0) {
      setError(t("v2.loans.validation.nonNegative", "Số tiền không được âm"));
      return;
    }
    if (principalPaid === 0 && interestPaid === 0) {
      setError(
        t(
          "v2.loans.validation.amountRequired",
          "Vui lòng nhập tiền gốc hoặc tiền lãi thanh toán",
        ),
      );
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        loanId,
        payload: {
          periodNumber: Number(periodNumber),
          paymentDate,
          principalPaid: Number(principalPaid),
          interestPaid: Number(interestPaid),
          paymentRef: paymentReference.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t(
          "v2.loans.toast.paymentRecordedTitle",
          "Đã ghi nhận thanh toán",
        ),
        description: t(
          "v2.loans.toast.paymentRecordedDesc",
          "Dư nợ gốc và lịch dự báo dòng tiền đã được cập nhật.",
        ),
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : t(
              "v2.loans.validation.paymentError",
              "Có lỗi xảy ra khi ghi nhận thanh toán",
            );
      setError(msg);
    }
  };

  return {
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
    isSubmitting: recordPaymentMutation.isPending,
    handleSubmit,
  };
}
