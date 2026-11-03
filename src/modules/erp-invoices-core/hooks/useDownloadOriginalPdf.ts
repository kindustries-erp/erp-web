import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type OriginalPdfDownloadResponse,
} from "../api/erpInvoicesCoreApi";
import { originalPdfLookupInfoKey } from "./useOriginalPdfLookupInfo";

export function useDownloadOriginalPdf() {
  const { t } = useTranslation("erpInvoices");
  const queryClient = useQueryClient();

  return useMutation<OriginalPdfDownloadResponse, Error, string>({
    mutationFn: (invoiceId) =>
      erpInvoicesCoreApi.downloadOriginalPdf(invoiceId),
    onSuccess: (data, invoiceId) => {
      if (data.success) {
        toast.success(t("downloadPdfSuccess"));
      } else {
        toast.error(data.pdfError || t("downloadPdfFailed"));
      }
      queryClient.invalidateQueries({
        queryKey: originalPdfLookupInfoKey(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("downloadPdfFailed"));
    },
  });
}
