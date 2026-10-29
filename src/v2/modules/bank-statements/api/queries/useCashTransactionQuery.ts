import { useQuery } from "@tanstack/react-query";
import { cashTransactionApi } from "../cashTransactionApi";
import { cashTransactionKeys } from "./cashTransactionKeys";

/** Chi tiết một giao dịch tiền mặt; chỉ tải khi drawer đang mở và có id */
export function useCashTransactionQuery(
  transactionId: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: cashTransactionKeys.detail(transactionId),
    queryFn: () => cashTransactionApi.getTransaction(transactionId as string),
    enabled: enabled && Boolean(transactionId),
  });
}
