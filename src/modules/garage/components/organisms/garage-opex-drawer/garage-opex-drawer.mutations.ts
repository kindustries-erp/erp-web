import toast from "react-hot-toast";
import { garageOpexApi } from "@/modules/garage/api/garageOpexApi";
import type { RecurringApplyScope } from "../../OpexRecurringConfirmModal";

export interface SubmitOpexParams {
  id?: string;
  isCreate: boolean;
  periodYear: number;
  periodMonth: number;
  categoryKey: string;
  categoryName: string;
  amount: string;
  ojAmount: string;
  note: string;
  isRecurring: boolean;
  untilYear: number;
  untilMonth: number;
  t: (key: string, fallback: string) => string;
  onSuccess?: () => void;
  onClose: () => void;
  setShowConfirmModal: (show: boolean) => void;
}

export async function submitOpexForm(
  params: SubmitOpexParams,
): Promise<boolean> {
  const {
    id,
    isCreate,
    periodYear,
    periodMonth,
    categoryKey,
    categoryName,
    amount,
    ojAmount,
    note,
    isRecurring,
    untilYear,
    untilMonth,
    t,
    onSuccess,
    onClose,
    setShowConfirmModal,
  } = params;

  const numAmt = Number(amount.replace(/[^0-9.-]+/g, ""));
  const numOj = Number(ojAmount.replace(/[^0-9.-]+/g, "")) || 0;

  if (
    isNaN(numAmt) ||
    isNaN(numOj) ||
    !categoryName.trim() ||
    (numAmt > 0 && numOj > numAmt)
  ) {
    toast.error(t("opex.invalidInput", "Dữ liệu nhập chưa hợp lệ"));
    return false;
  }

  if (!isCreate && isRecurring) {
    setShowConfirmModal(true);
    return false;
  }

  try {
    const payload = {
      periodYear: Number(periodYear),
      periodMonth: Number(periodMonth),
      categoryKey,
      categoryName: categoryName.trim(),
      amount: numAmt,
      ojAmount: numOj,
      note: note.trim() || undefined,
      recurrenceType: isRecurring ? ("monthly" as const) : undefined,
      recurrenceUntilYear: isRecurring ? Number(untilYear) : undefined,
      recurrenceUntilMonth: isRecurring ? Number(untilMonth) : undefined,
    };

    if (isCreate) {
      await garageOpexApi.create(payload);
    } else {
      await garageOpexApi.update(id!, payload);
    }

    toast.success(
      t(
        isCreate ? "opex.createSuccess" : "opex.updateSuccess",
        "Lưu chi phí thành công",
      ),
    );
    onSuccess?.();
    onClose();
    return true;
  } catch (err: any) {
    toast.error(err?.message || "Không thể lưu chi phí vận hành");
    return false;
  }
}

export async function submitRecurringScope(
  targetId: string,
  scope: RecurringApplyScope,
  params: {
    amount: string;
    ojAmount: string;
    categoryKey: string;
    categoryName: string;
    note: string;
    isRecurring: boolean;
    untilYear: number;
    untilMonth: number;
    onSuccess?: () => void;
    onClose: () => void;
  },
): Promise<boolean> {
  try {
    await garageOpexApi.applyRecurring(targetId, {
      applyScope: scope,
      amount: Number(params.amount.replace(/[^0-9.-]+/g, "")),
      ojAmount: Number(params.ojAmount.replace(/[^0-9.-]+/g, "")) || 0,
      categoryKey: params.categoryKey,
      categoryName: params.categoryName.trim(),
      note: params.note.trim() || undefined,
      recurrenceType: params.isRecurring ? "monthly" : undefined,
      untilYear: params.isRecurring ? Number(params.untilYear) : undefined,
      untilMonth: params.isRecurring ? Number(params.untilMonth) : undefined,
    });
    params.onSuccess?.();
    params.onClose();
    return true;
  } catch (err: any) {
    toast.error(err?.message || "Không thể áp dụng thay đổi định kỳ");
    return false;
  }
}
