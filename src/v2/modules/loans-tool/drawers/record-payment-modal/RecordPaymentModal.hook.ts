import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { LoanSchedulePeriod } from "@/v2/core/loans";
import { useRecordPaymentMutation, useUpdatePaymentMutation } from "../../api";
import type { RecordPaymentModalProps } from "./RecordPaymentModal.type";
import {
  buildPeriodOptions,
  resolveEffectiveSchedule,
  resolveInitialPayment,
} from "./RecordPaymentModal.helper";
import { submitPaymentForm } from "./RecordPaymentModal.submit";

const EMPTY_PAID: number[] = [];

export function useRecordPaymentModal(props: RecordPaymentModalProps) {
  const {
    open,
    onClose,
    loanId,
    loan,
    schedule: propSchedule,
    paidPeriodNumbers = EMPTY_PAID,
    remainingPrincipal = 0,
    suggestedPeriod = 1,
    suggestedPrincipal = 0,
    suggestedInterest = 0,
    mode = "create",
    editPayment = null,
  } = props;
  const { t } = useV2Translation();
  const recordPaymentMutation = useRecordPaymentMutation();
  const updatePaymentMutation = useUpdatePaymentMutation();

  const effectiveSchedule = useMemo<LoanSchedulePeriod[]>(
    () => resolveEffectiveSchedule(propSchedule, loan),
    [propSchedule, loan],
  );

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

  const isEdit = mode === "edit" && Boolean(editPayment?.id);
  const paidSet = useMemo(
    () => new Set(paidPeriodNumbers),
    [paidPeriodNumbers],
  );
  const currentScheduledPeriod = useMemo(
    () => effectiveSchedule.find((p) => p.periodNumber === periodNumber),
    [effectiveSchedule, periodNumber],
  );

  const handleSelectPeriod = useCallback(
    (num: number) => {
      setPeriodNumber(num);
      const target = effectiveSchedule.find((p) => p.periodNumber === num);
      if (target) {
        setPrincipalPaid(Math.round(target.principalDue));
        setInterestPaid(Math.round(target.interestDue));
        if (target.dueDate) setPaymentDate(target.dueDate);
      }
    },
    [effectiveSchedule],
  );

  const handlePaymentDateChange = useCallback(
    (dateStr: string) => {
      setPaymentDate(dateStr);
      if (!dateStr || effectiveSchedule.length === 0) return;
      const targetMonth = dateStr.slice(0, 7);
      const matched = effectiveSchedule.find(
        (p) => p.dueDate.slice(0, 7) === targetMonth,
      );
      if (matched && matched.periodNumber !== periodNumber) {
        setPeriodNumber(matched.periodNumber);
        setPrincipalPaid(Math.round(matched.principalDue));
        setInterestPaid(Math.round(matched.interestDue));
      }
    },
    [effectiveSchedule, periodNumber],
  );

  const prevOpenRef = useRef<boolean>(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const init = resolveInitialPayment(
        suggestedPeriod,
        suggestedPrincipal,
        suggestedInterest,
        effectiveSchedule,
        isEdit ? editPayment : null,
      );
      setPeriodNumber(init.period);
      setPrincipalPaid(init.pPaid);
      setInterestPaid(init.iPaid);
      setPaymentDate(init.pDate);
      setPaymentReference(init.ref);
      setNotes(init.notes);
      setError(null);
    }
    prevOpenRef.current = open;
  }, [
    open,
    isEdit,
    editPayment,
    suggestedPeriod,
    suggestedPrincipal,
    suggestedInterest,
    effectiveSchedule,
  ]);

  const handleFillFromSchedule = useCallback(() => {
    if (currentScheduledPeriod) {
      setPrincipalPaid(Math.round(currentScheduledPeriod.principalDue));
      setInterestPaid(Math.round(currentScheduledPeriod.interestDue));
      if (currentScheduledPeriod.dueDate)
        setPaymentDate(currentScheduledPeriod.dueDate);
    }
  }, [currentScheduledPeriod]);

  const handleSettleAll = useCallback(() => {
    if (remainingPrincipal > 0) {
      setPrincipalPaid(Math.round(remainingPrincipal));
      if (currentScheduledPeriod)
        setInterestPaid(Math.round(currentScheduledPeriod.interestDue));
    }
  }, [remainingPrincipal, currentScheduledPeriod]);

  const periodOptions = useMemo(
    () => buildPeriodOptions(effectiveSchedule, paidSet),
    [effectiveSchedule, paidSet],
  );

  const totalPaid = (principalPaid || 0) + (interestPaid || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId) return;

    await submitPaymentForm({
      loanId,
      isEdit,
      paymentId: editPayment?.id,
      periodNumber,
      paymentDate,
      principalPaid,
      interestPaid,
      paymentReference,
      notes,
      recordMutation: recordPaymentMutation,
      updateMutation: updatePaymentMutation,
      t,
      onClose,
      setError,
    });
  };

  return {
    isEdit,
    periodNumber,
    setPeriodNumber: handleSelectPeriod,
    paymentDate,
    setPaymentDate: handlePaymentDateChange,
    principalPaid,
    setPrincipalPaid,
    interestPaid,
    setInterestPaid,
    paymentReference,
    setPaymentReference,
    notes,
    setNotes,
    error,
    isSubmitting: isEdit
      ? updatePaymentMutation.isPending
      : recordPaymentMutation.isPending,
    handleSubmit,
    periodOptions,
    currentScheduledPeriod,
    handleFillFromSchedule,
    handleSettleAll,
    totalPaid,
  };
}
