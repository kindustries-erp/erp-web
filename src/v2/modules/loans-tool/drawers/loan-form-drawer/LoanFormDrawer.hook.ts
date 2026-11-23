import { useState, useEffect } from "react";
import { addMonths } from "@/v2/core/loans";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useCreateLoanMutation, useUpdateLoanMutation } from "../../api";
import type {
  LoanFormDrawerProps,
  LoanFormValues,
} from "./LoanFormDrawer.type";
import { createDefaultValues, validateLoanForm } from "./LoanFormDrawer.helper";

export function useLoanFormDrawer({
  open,
  record,
  initialValues,
  onClose,
  onSuccess,
}: LoanFormDrawerProps) {
  const { t } = useV2Translation();
  const showToast = useV2ToastStore((s) => s.showToast);
  const [values, setValues] = useState<LoanFormValues>(createDefaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateLoanMutation();
  const updateMutation = useUpdateLoanMutation();

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (record) {
      setValues({
        loanCode: record.loanCode || "",
        title: record.title,
        lenderName: record.lenderName,
        principalAmount: Number(record.principalAmount || 0),
        annualInterestRate: Number(record.annualInterestRate ?? 0),
        tenorMonths: Number(record.tenorMonths || 12),
        amortizationMethod: record.amortizationMethod,
        startDate: record.startDate,
        firstPaymentDate: record.firstPaymentDate || record.startDate || "",
        status: record.status,
        notes: record.notes || "",
      });
    } else {
      setValues({
        ...createDefaultValues(),
        ...initialValues,
      });
    }
  }, [open, record, initialValues]);

  const handleChange = (field: keyof LoanFormValues, val: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "startDate" && typeof val === "string" && val) {
        if (!prev.firstPaymentDate || prev.firstPaymentDate < val) {
          next.firstPaymentDate = addMonths(val, 1);
        }
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs = validateLoanForm(values, t);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const sanitizedPayload = {
      ...values,
      loanCode: values.loanCode?.trim() || undefined,
      firstPaymentDate:
        values.firstPaymentDate && values.firstPaymentDate >= values.startDate
          ? values.firstPaymentDate
          : addMonths(values.startDate, 1),
      notes: values.notes?.trim() || "",
    };

    try {
      if (record) {
        const res = await updateMutation.mutateAsync({
          id: record.id,
          payload: sanitizedPayload,
        });
        showToast({
          title: t(
            "v2.loans.toast.updateSuccess",
            "Đã cập nhật hợp đồng vay thành công",
          ),
          variant: "success",
        });
        onSuccess?.(res);
      } else {
        const res = await createMutation.mutateAsync(sanitizedPayload);
        showToast({
          title: t(
            "v2.loans.toast.createSuccess",
            "Đã tạo hợp đồng vay thành công",
          ),
          variant: "success",
        });
        onSuccess?.(res);
      }
      onClose();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : t("v2.loans.toast.saveError", "Có lỗi xảy ra khi lưu hợp đồng vay");
      showToast({
        title: errMsg,
        variant: "destructive",
      });
    }
  };

  return {
    values,
    errors,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isEdit: Boolean(record),
    handleChange,
    handleSubmit,
  };
}
