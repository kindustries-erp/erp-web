import { useState, useEffect } from "react";
import { AmortizationMethod, LoanStatus } from "@/v2/core/loans";
import { useCreateLoanMutation, useUpdateLoanMutation } from "../../api";
import { LoanFormDrawerProps, LoanFormValues } from "./LoanFormDrawer.type";

export function useLoanFormDrawer({
  record,
  initialValues,
  onClose,
  onSuccess,
}: LoanFormDrawerProps) {
  const [values, setValues] = useState<LoanFormValues>({
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateLoanMutation();
  const updateMutation = useUpdateLoanMutation();

  useEffect(() => {
    if (record) {
      setValues({
        loanCode: record.loanCode,
        title: record.title,
        lenderName: record.lenderName,
        principalAmount: record.principalAmount,
        annualInterestRate: record.annualInterestRate,
        tenorMonths: record.tenorMonths,
        amortizationMethod: record.amortizationMethod,
        startDate: record.startDate,
        firstPaymentDate: record.firstPaymentDate,
        status: record.status,
        notes: record.notes || "",
      });
    } else if (initialValues) {
      setValues((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [record, initialValues]);

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
    if (!values.title.trim()) errs.title = "Vui lòng nhập tên khoản vay";
    if (!values.lenderName.trim())
      errs.lenderName = "Vui lòng nhập đơn vị cho vay";
    if (values.principalAmount <= 0)
      errs.principalAmount = "Số tiền vay phải > 0";
    if (values.tenorMonths <= 0) errs.tenorMonths = "Kỳ hạn phải > 0";
    if (values.annualInterestRate < 0)
      errs.annualInterestRate = "Lãi suất không thể âm";
    if (!values.startDate) errs.startDate = "Vui lòng chọn ngày giải ngân";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (record) {
      const res = await updateMutation.mutateAsync({
        id: record.id,
        payload: values,
      });
      onSuccess?.(res);
    } else {
      const res = await createMutation.mutateAsync(values);
      onSuccess?.(res);
    }
    onClose();
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
