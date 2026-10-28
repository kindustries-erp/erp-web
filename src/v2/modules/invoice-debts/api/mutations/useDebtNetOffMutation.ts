import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErpQueryKey } from "@/shared/lib/queryKeys";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { debtNetOffV2Api } from "../debtNetOffApi";
import type { DebtNetOffAllocateRequestDto } from "../dtos/debtNetOff.dto";
import { invoiceDebtsKeys } from "../queries/invoiceDebtsKeys";

type Translate = (key: string, fallback?: string) => string;

export interface DebtNetOffInput {
  taxCode: string;
  body: DebtNetOffAllocateRequestDto;
}

/** Các query v1 và v2 hiển thị số công nợ/chưa phân bổ, cần làm mới sau khi cấn trừ */
const RELATED_V1_KEYS = [
  ErpQueryKey.INVOICE_DEBTS_LIST,
  ErpQueryKey.INVOICE_DEBT_PARTNER_INVOICES,
  "invoice-partner-invoices",
  "invoice-partner-unallocated",
  "invoice-partner-trend-stats",
  "invoice-debts-analytics",
] as const;

/** Cấn trừ thành công làm mới số liệu công nợ và chạy `onSaved` */
export function useDebtNetOffMutation(t: Translate, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taxCode, body }: DebtNetOffInput) =>
      debtNetOffV2Api.allocate(taxCode, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: invoiceDebtsKeys.all }),
        ...RELATED_V1_KEYS.map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      ]);
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.invoiceDebts.netOff.success", "Đã cấn trừ công nợ"),
      });
      onSaved();
    },
    onError: (error) => {
      const fallback = t("v2.invoiceDebts.netOff.error", "Không thể cấn trừ");
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}
