import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { invoiceFilesV2Api } from "../api/invoiceFilesV2Api";

export const invoiceFilesV2Key = (invoiceId: string | null | undefined) =>
  ["erp-invoice-files-v2", invoiceId ?? ""] as const;

/** Danh sách file của hóa đơn từ API V2 (nguồn duy nhất sau cutover) và hàm làm mới. */
export function useInvoiceFilesV2(invoiceId: string | null | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: invoiceFilesV2Key(invoiceId),
    queryFn: () => invoiceFilesV2Api.list(invoiceId as string),
    enabled: Boolean(invoiceId),
    staleTime: 15_000,
  });
  const reload = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: invoiceFilesV2Key(invoiceId) }),
    [queryClient, invoiceId],
  );
  return {
    files: query.data?.items ?? [],
    policy: query.data?.policy ?? null,
    loading: query.isLoading,
    reload,
  };
}
