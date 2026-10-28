import { useQuery } from "@tanstack/react-query";
import { cashTransactionApi } from "../cashTransactionApi";
import { cashTransactionKeys } from "./cashTransactionKeys";

/** Tổng số giao dịch của đối tác đối ứng, dùng cho badge tab "Chi tiết theo đối tác" */
export function usePartnerTransactionCountQuery(
  correspondentAccount: string,
  correspondentName: string,
) {
  return useQuery({
    queryKey: cashTransactionKeys.partnerCount(
      correspondentAccount,
      correspondentName,
    ),
    queryFn: () =>
      cashTransactionApi.listTransactions({
        page: 1,
        pageSize: 1,
        correspondentAccount: correspondentAccount || undefined,
        correspondentName: correspondentName || undefined,
      }),
    enabled: Boolean(correspondentAccount || correspondentName),
    staleTime: 60_000,
  });
}
