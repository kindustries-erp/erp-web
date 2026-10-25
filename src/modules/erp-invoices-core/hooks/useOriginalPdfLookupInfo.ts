import { useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  type OriginalPdfLookupInfoResponse,
} from "../api/erpInvoicesCoreApi";

export const originalPdfLookupInfoKey = (invoiceId: string) =>
  ["erp-invoice-lookup-info", invoiceId] as const;

export function useOriginalPdfLookupInfo(
  invoiceId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery<OriginalPdfLookupInfoResponse>({
    queryKey: originalPdfLookupInfoKey(invoiceId ?? ""),
    queryFn: () => erpInvoicesCoreApi.getOriginalPdfLookupInfo(invoiceId!),
    enabled: Boolean(invoiceId) && (options?.enabled ?? true),
    staleTime: 30000,
  });
}
