import { useQuery } from "@tanstack/react-query";
import { cashTransactionApi } from "../cashTransactionApi";
import { cashTransactionKeys } from "./cashTransactionKeys";

/** Đồ thị chứng từ liên kết của giao dịch; tải khi tab "Chứng từ liên kết" mở */
export function useTraceabilityGraphQuery(
  transactionId: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: cashTransactionKeys.traceability(transactionId),
    queryFn: () =>
      cashTransactionApi.getTraceabilityGraph(transactionId as string),
    enabled: enabled && Boolean(transactionId),
  });
}
