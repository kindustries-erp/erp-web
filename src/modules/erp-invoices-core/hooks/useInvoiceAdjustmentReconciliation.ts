import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type AdjustmentReconciliationDto,
  type ExecuteAdjustmentNetoffPayload,
} from "../api/erpInvoicesCoreApi";

export function useInvoiceAdjustmentReconciliation(
  invoiceId?: string | null,
  options?: { enabled?: boolean },
) {
  const { t } = useTranslation("erpInvoices");
  const queryClient = useQueryClient();

  const queryKey = ["erp-invoice-adjustment-reconciliation", invoiceId];

  const query = useQuery<AdjustmentReconciliationDto>({
    queryKey,
    queryFn: () => erpInvoicesCoreApi.getAdjustmentReconciliation(invoiceId!),
    enabled: Boolean(invoiceId) && (options?.enabled ?? true),
    staleTime: 30000,
  });

  const netoffMutation = useMutation({
    mutationFn: (payload: ExecuteAdjustmentNetoffPayload) =>
      erpInvoicesCoreApi.executeAdjustmentNetoff(payload),
    onSuccess: (data) => {
      toast.success(data.message || t("Cấn trừ công nợ thành công!"));
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["erp-invoice-debts"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || t("Cấn trừ công nợ thất bại"),
      );
    },
  });

  return {
    reconciliation: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    executeNetoff: netoffMutation.mutate,
    isExecutingNetoff: netoffMutation.isPending,
  };
}
