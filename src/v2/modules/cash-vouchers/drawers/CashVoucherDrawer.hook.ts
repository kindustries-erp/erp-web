import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useCashBooksQuery } from "../api/queries/useCashBooksQuery";
import { useCreateCashVoucherMutation } from "../api/mutations/useCreateCashVoucherMutation";
import type { CreateCashVoucherDto } from "../api/dtos/cashVoucher.dto";
import {
  emptyCashVoucherForm,
  type CashVoucherFieldError,
  type CashVoucherFormValue,
} from "../domain/entities/cashVoucher";
import {
  isCashVoucherFormDirty,
  resolveVoucherBranchId,
  validateCashVoucherForm,
} from "../domain/rules/cashVoucherRules";

export interface CashVoucherDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Chi nhánh đang chọn ở V1, dùng khi sổ quỹ chưa có chi nhánh */
  fallbackBranchId?: string | null;
}

export function useCashVoucherDrawer({
  open,
  onClose,
  onCreated,
  fallbackBranchId,
}: CashVoucherDrawerProps) {
  const { t } = useV2Translation();
  const [form, setForm] =
    React.useState<CashVoucherFormValue>(emptyCashVoucherForm);
  const [errorField, setErrorField] =
    React.useState<CashVoucherFieldError | null>(null);
  const cashBooksQuery = useCashBooksQuery(open);
  const cashBooks = cashBooksQuery.data ?? [];

  // Form luôn bắt đầu trống mỗi lần mở
  React.useEffect(() => {
    if (!open) return;
    setForm(emptyCashVoucherForm());
    setErrorField(null);
  }, [open]);

  const save = useCreateCashVoucherMutation(t, () => {
    setForm(emptyCashVoucherForm());
    onCreated();
  });

  const setField = <K extends keyof CashVoucherFormValue>(
    key: K,
    value: CashVoucherFormValue[K],
  ) => {
    setErrorField(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    const invalid = validateCashVoucherForm(form);
    if (invalid) {
      setErrorField(invalid);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.cashVouchers.form.missingInfo", "Thiếu thông tin"),
        description:
          invalid === "amount"
            ? t(
                "v2.cashVouchers.form.amountRule",
                "Nhập đúng một trong hai: Thu hoặc Chi",
              )
            : t("v2.cashVouchers.form.required", "Trường này là bắt buộc"),
      });
      return;
    }
    const cashBook = cashBooks.find((cb) => cb.id === form.cashBookId);
    const payload: CreateCashVoucherDto = {
      branchId: resolveVoucherBranchId(cashBook, fallbackBranchId),
      sourceType: "CASH",
      cashBookId: form.cashBookId,
      transDate: form.transDate,
      debitAmount: form.debitAmount ?? 0,
      creditAmount: form.creditAmount ?? 0,
      description: form.description,
      correspondentName: form.correspondentName,
    };
    save.mutate(payload);
  };

  return {
    t,
    form,
    cashBooks,
    loadingCashBooks: cashBooksQuery.isFetching,
    errorField,
    setField,
    submit,
    saving: save.isPending,
    dirty: isCashVoucherFormDirty(form, emptyCashVoucherForm()),
    onClose,
  };
}
