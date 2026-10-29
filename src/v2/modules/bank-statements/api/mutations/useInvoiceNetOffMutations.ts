import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashTransactionApi } from "../cashTransactionApi";
import { cashTransactionKeys } from "../queries/cashTransactionKeys";

/** Liên kết và gỡ hóa đơn cấn trừ; làm mới giao dịch và đồ thị chứng từ sau khi xong */
export function useInvoiceNetOffMutations(transactionId: string) {
  const queryClient = useQueryClient();

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: cashTransactionKeys.detail(transactionId),
      }),
      queryClient.invalidateQueries({
        queryKey: cashTransactionKeys.traceability(transactionId),
      }),
      queryClient.invalidateQueries({ queryKey: cashTransactionKeys.all }),
    ]);

  const link = useMutation({
    mutationFn: (payload: { invoiceId: string; netOffAmount: number }) =>
      cashTransactionApi.linkInvoice(transactionId, payload),
    onSuccess: refresh,
  });

  const unlink = useMutation({
    mutationFn: (netOffId: string) =>
      cashTransactionApi.removeInvoice(transactionId, netOffId),
    onSuccess: refresh,
  });

  return { link, unlink };
}
