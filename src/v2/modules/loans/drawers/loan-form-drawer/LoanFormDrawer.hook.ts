import { useState, useEffect } from "react";
import { AmortizationMethod, LoanStatus } from "@/v2/core/loans";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useCreateLoanMutation, useUpdateLoanMutation } from "../../api";
import { LoanFormDrawerProps, LoanFormValues } from "./LoanFormDrawer.type";

const createDefaultValues = (): LoanFormValues => ({
  loanCode: "",
  title: "",
  lenderName: "",
  principalAmount: 100000000,
  annualInterestRate: 10.5,
  tenorMonths: 12,
  amortizationMethod: AmortizationMethod.AMORTIZED,
  startDate: new Date().toISOString().split("T")[0],
  firstPaymentDate: "",
  status: LoanStatus.ACTIVE,
  notes: "",
});

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
    setValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!values.title.trim()) {
      errs.title = t(
        "v2.loans.validation.titleRequired",
        "Vui lòng nhập tên khoản vay",
      );
    }
    if (!values.lenderName.trim()) {
      errs.lenderName = t(
        "v2.loans.validation.lenderRequired",
        "Vui lòng nhập đơn vị cho vay",
      );
    }
    if (values.principalAmount <= 0) {
      errs.principalAmount = t(
        "v2.loans.validation.principalPositive",
        "Số tiền vay phải > 0",
      );
    }
    if (values.tenorMonths <= 0) {
      errs.tenorMonths = t(
        "v2.loans.validation.tenorPositive",
        "Kỳ hạn phải > 0",
      );
    }
    if (values.annualInterestRate < 0) {
      errs.annualInterestRate = t(
        "v2.loans.validation.rateNonNegative",
        "Lãi suất không thể âm",
      );
    }
    if (!values.startDate) {
      errs.startDate = t(
        "v2.loans.validation.startDateRequired",
        "Vui lòng chọn ngày giải ngân",
      );
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const sanitizedPayload = {
      ...values,
      loanCode: values.loanCode?.trim() || undefined,
      firstPaymentDate: values.firstPaymentDate || values.startDate,
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
            "Đã tạo hợp đồng vay mới thành công",
          ),
          variant: "success",
        });
        onSuccess?.(res);
      }
      onClose();
    } catch {
      showToast({
        title: t(
          "v2.loans.toast.saveError",
          "Không thể lưu thông tin khoản vay, vui lòng thử lại",
        ),
        variant: "destructive",
      });
    }
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isEdit: Boolean(record),
  };
}
